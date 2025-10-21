/**
 * Fixed eSSL / ZKTeco command queue behavior
 * - Commands are returned as: C:<id>:<command>\n
 * - Commands are NOT removed when sent; they are removed only after device ACKs via /iclock/devicecmd
 * - Provides debug endpoints to inspect queued commands
 */

const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 1337;

// --- simple data storage (users/attendance) ------------------------------------------------
const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const usersFile = path.join(dataDir, "users.json");
const attendanceFile = path.join(dataDir, "attendance.json");
if (!fs.existsSync(usersFile)) fs.writeFileSync(usersFile, "[]");
if (!fs.existsSync(attendanceFile)) fs.writeFileSync(attendanceFile, "[]");

const loadJSON = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const saveJSON = (file, data) =>
  fs.writeFileSync(file, JSON.stringify(data, null, 2));

// --- parsers (kept from your previous code) ---------------------------------------------
const parseUserLine = (line) => {
  const fields = {};
  line.split(/\s+/).forEach((pair) => {
    const [key, value] = pair.split("=");
    if (key) fields[key] = value || "";
  });

  console.log(JSON.stringify(fields, null, 2));

  return {
    PIN: fields.PIN,
    Name: fields.Name,
    Privilege: Number(fields.Pri) || 0,
    Password: fields.Passwd || "",
    Card: fields.Card || "",
    Group: fields.Grp || "",
    TZ: fields.TZ || "",
    Expires: fields.Expires || "0",
    StartDatetime: fields.StartDatetime || "0",
    EndDatetime: fields.EndDatetime || "0",
    ValidCount: fields.ValidCount || "0",
    ...fields,
  };
};

const parseAttendanceLine = (line) => {
  const parts = line.trim().split(/\s+/);
  return {
    PIN: parts[0],
    Timestamp: parts[1] + (parts[2] ? " " + parts[2] : ""),
    VerifyMode: parts[3] || "",
    InOutMode: parts[4] || "",
    WorkCode: parts[5] || "",
  };
};

// --- middleware --------------------------------------------------------------------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  express.text({ type: ["text/plain", "text/html", "*/*"], limit: "10mb" })
);

// --- command queue structures -----------------------------------------------------------
// deviceCommands: Map<SN, Array< { id: number, command: string, status: 'pending'|'sent'|'done', queuedAt, sentAt, doneAt } >>
const deviceCommands = new Map();
// deviceSeq: Map<SN, lastId> to generate incremental IDs per device
const deviceSeq = new Map();

function nextCommandIdFor(sn) {
  const last = deviceSeq.get(sn) || 0;
  const next = last + 1;
  deviceSeq.set(sn, next);
  return next;
}

/** queueCommand: create a new command for a device and return the created command object */
function queueCommand(sn, commandText) {
  const id = nextCommandIdFor(sn);
  const now = new Date().toISOString();
  const cmd = { id, command: commandText, status: "pending", queuedAt: now };
  const arr = deviceCommands.get(sn) || [];
  arr.push(cmd);
  deviceCommands.set(sn, arr);
  console.log(`📋 Queued command for ${sn}: C:${id}:${commandText}`);
  return cmd;
}

app.get("/iclock/cdata.aspx", (req, res) => {
  console.log(`ℹ️ Device metadata query:`, req.query);
  res.type("text/plain").send("OK");
});

// --- cdata handler (users / attendance) -------------------------------------------------
app.post("/iclock/cdata.aspx", (req, res) => {
  const { table, SN } = req.query;
  const rawBody = (typeof req.body === "string" ? req.body : "") || "";
  const now = new Date().toISOString();

  if (table === "ATTLOG") {
    const lines = rawBody
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const logs = lines.map(parseAttendanceLine);
    if (logs.length) {
      const existing = loadJSON(attendanceFile);
      logs.forEach((log) => existing.push({ ...log, SN, receivedAt: now }));
      saveJSON(attendanceFile, existing);
      console.log(`📦 Saved ${logs.length} attendance logs (SN=${SN})`);
    }

    res.type("text/plain").send("OK:ATTLOG 10001"); // device will accept plain-text ack
    return;
  }

  if (table === "OPERLOG") {
    console.log(rawBody);
    const lines = rawBody
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.startsWith("USER"));
    const users = lines.map(parseUserLine);
    if (users.length) {
      const existing = loadJSON(usersFile);
      users.forEach((u) => {
        const idx = existing.findIndex((x) => x.PIN === u.PIN);
        if (idx >= 0) existing[idx] = { ...u, updatedAt: now, SN };
        else existing.push({ ...u, createdAt: now, SN });
      });
      saveJSON(usersFile, existing);
      console.log(`👥 Synced ${users.length} users (SN=${SN})`);
    }

    res.type("text/plain").send("OK:OPERLOG 10001");
    return;
  }

  console.log(table);
  console.log(rawBody);

  // no table - generic OK (handshake/poll)
  res.type("text/plain").send("OK");
});

// --- getrequest: return pending commands (but don't remove until ACK) -------------------
app.get("/iclock/getrequest.aspx", (req, res) => {
  const SN = req.query.SN || "";
  const ip = req.ip;
  console.log(`📡 Device polling for commands: SN=${SN} IP=${ip}`);

  if (!SN) {
    // if no SN, respond OK to avoid device loop
    return res.type("text/plain").send("OK");
  }

  const all = deviceCommands.get(SN) || [];
  // find only pending commands (not yet sent or not yet done)
  const pending = all.filter((c) => c.status === "pending");

  if (pending.length === 0) {
    return res.type("text/plain").send("OK");
  }

  // build response: one command per line as "C:<id>:<command>"
  const lines = pending.map((c) => `C:${c.id}:${c.command}`);
  // mark them as sent (but KEEP them in queue until device ACKs)
  const now = new Date().toISOString();
  pending.forEach((c) => {
    c.status = "sent";
    c.sentAt = now;
  });
  deviceCommands.set(SN, all); // update map

  const responseText = lines.join("\n") + "\n"; // trailing newline is important
  console.log(
    `📤 Sending ${lines.length} command(s) to ${SN}:\n${responseText.trim()}`
  );
  res.type("text/plain").send(responseText);
});

// --- devicecmd: device acknowledges command execution -----------------------------------
app.get("/iclock/devicecmd", (req, res) => {
  const SN = req.query.SN || "";
  const infoRaw = req.query.info || "";
  console.log(`✅ Command ack from device ${SN}: ${infoRaw}`);

  if (!SN || !infoRaw) {
    return res.type("text/plain").send("OK");
  }

  // device might send multiple lines: handle each line
  const lines = String(infoRaw)
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const arr = deviceCommands.get(SN) || [];

  lines.forEach((line) => {
    // expected: "C:<id>:OK" or "C:<id>:ERR" etc.
    const parts = line.split(":");
    if (parts.length < 3 || parts[0] !== "C") {
      console.log(`⚠️ Unrecognized devicecmd format: ${line}`);
      return;
    }
    const id = Number(parts[1]);
    const status = parts.slice(2).join(":"); // everything after id

    const idx = arr.findIndex((c) => c.id === id);
    if (idx === -1) {
      console.log(`⚠️ Ack for unknown command id ${id} (SN=${SN})`);
      return;
    }

    const cmd = arr[idx];
    cmd.status = "done";
    cmd.doneAt = new Date().toISOString();
    cmd.deviceAck = status;
    console.log(
      `✅ Command C:${id}:${cmd.command} acknowledged by ${SN} -> ${status}`
    );

    // remove confirmed commands from the queue
    arr.splice(idx, 1);
  });

  // update queue (arr may have changed)
  if (arr.length === 0) deviceCommands.delete(SN);
  else deviceCommands.set(SN, arr);

  // respond OK
  res.type("text/plain").send("OK");
});

app.post(
  "/iclock/devicecmd.aspx",
  express.urlencoded({ extended: true }),
  (req, res) => {
    const SN = req.query.SN || req.body.SN || "";
    const { ID, Return, CMD } = req.body || {};

    if (!SN || !ID || !CMD) {
      return res.type("text/plain").send("OK");
    }

    const arr = deviceCommands.get(SN) || [];
    const cmdId = Number(ID);
    const idx = arr.findIndex((c) => c.id === cmdId);
    if (idx !== -1) {
      arr[idx].status = "done";
      arr[idx].doneAt = new Date().toISOString();
      arr[idx].deviceAck = Return === "0" ? "OK" : "ERR";
      console.log(
        `✅ Command C:${ID}:${CMD} acknowledged by device ${SN} -> Return=${Return}`
      );
      arr.splice(idx, 1); // remove from queue
      if (arr.length === 0) deviceCommands.delete(SN);
      else deviceCommands.set(SN, arr);
    } else {
      console.log(`⚠️ Unknown command ack C:${ID}:${CMD} from device ${SN}`);
    }

    res.type("text/plain").send("OK");
  }
);

// --- endpoints to queue commands from your side -----------------------------------------
app.post("/queue-command", (req, res) => {
  console.log(req.body);
  const { SN, command } = req.body || {};
  if (!SN || !command) {
    return res.status(400).json({ error: "SN and command are required" });
  }
  const cmd = queueCommand(String(SN), String(command));
  res.json({ success: true, queued: cmd });
});

app.get("/request-users", (req, res) => {
  const SN = req.query.SN;
  if (!SN) return res.status(400).json({ error: "SN is required" });
  const cmd = queueCommand(String(SN), "CHECK"); // CHECK requests immediate sync
  res.json({ success: true, queued: cmd });
});

app.get("/request-attendance", (req, res) => {
  const SN = req.query.SN;
  if (!SN) return res.status(400).json({ error: "SN is required" });
  const cmd = queueCommand(String(SN), "DATA QUERY ATTLOG"); // ask device to upload ATTLOG
  res.json({ success: true, queued: cmd });
});

// --- debug: view queued commands for a device -----------------------------------------
app.get("/commands/:sn", (req, res) => {
  const sn = req.params.sn;
  const arr = deviceCommands.get(sn) || [];
  res.json({ sn, commands: arr });
});

// --- data viewer -----------------------------------------------------------------------
app.get("/data", (req, res) => {
  const users = loadJSON(usersFile);
  const attendance = loadJSON(attendanceFile);
  res.json({ users, attendance });
});

// --- fallback: log unknown requests (keeps your previous behavior) ---------------------
app.all("*", (req, res) => {
  console.log("\n" + "=".repeat(80));
  console.log(`🕵️ Unknown request from device - ${new Date().toISOString()}`);
  console.log("=".repeat(80));
  console.log(`Method: ${req.method}`);
  console.log(`URL: ${req.originalUrl}`);
  console.log(`IP: ${req.ip}`);
  console.log("Headers:", req.headers);
  // For verbose bodies (text) print only for non-handled routes
  if (req.body && typeof req.body === "string" && req.body.trim().length) {
    console.log("Body:", req.body);
  }
  console.log("=".repeat(80));

  res.setHeader("Content-Type", "text/plain");
  res.send("OK");
});

// --- start server ----------------------------------------------------------------------
app.listen(PORT, () => {
  console.log("\n" + "🚀".repeat(10));
  console.log(`eSSL sync server running on port ${PORT}`);
  console.log("Endpoints:");
  console.log("  GET  /iclock/getrequest.aspx?SN=<sn>   (device polling)");
  console.log("  GET  /iclock/devicecmd?SN=<sn>&info=C:<id>:OK   (device ack)");
  console.log("  POST /queue-command  { SN, command }");
  console.log("  GET  /commands/:sn   (view queued commands)");
  console.log("  GET  /data           (view users & attendance)");
  console.log("🚀".repeat(10) + "\n");
});
