import deviceModel from "../models/deviceModel.js";
import dataModel from "../models/dataModel.js";
import { parseUserLine, parseAttendanceLine } from "../utils/parsers.js";
import { convertJsonToDeviceFormat } from "../utils/formatters.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DeviceController {
  // Handle device metadata query
  getDeviceData(req, res) {
    console.log(`ℹ️ Device metadata query:`, req.query);
    res.type("text/plain").send("OK");
  }

  // Handle device data submission (users/attendance)
  postDeviceData(req, res) {
    const { table, SN } = req.query;
    const rawBody = (typeof req.body === "string" ? req.body : "") || "";

  console.log('this is post device data');
  
    console.log('table:', table);
    if (table === "ATTLOG") {
      const lines = rawBody
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      const logs = lines.map(parseAttendanceLine);
      if (logs.length) {
        dataModel.saveAttendance(logs, SN);
      }
      res.type("text/plain").send("OK:ATTLOG 10001");
      return;
    }

    if (table === "OPERLOG") {
      console.log(rawBody);
      const lines = rawBody
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.startsWith("USER"));
      const users = lines.map(parseUserLine);
        dataModel.saveUsers(users, SN);
      res.type("text/plain").send("OK:OPERLOG 10001");
      return;
    }

    console.log(table);
    console.log(rawBody);
    res.type("text/plain").send("OK");
  }

  // Handle device polling for commands
  getRequest(req, res) {
    console.log("request body:", req.body);
    const SN = req.query.SN || "";
    const ip = req.ip;
    console.log(`📡 Device polling for commands: SN=${SN} IP=${ip}`);

    if (!SN) {
      return res.type("text/plain").send("OK");
    }

    const pending = deviceModel.getPendingCommands(SN);

    if (pending.length === 0) {
      return res.type("text/plain").send("OK");
    }

    const lines = pending.map((c) => `C:${c.id}:${c.command}`);
    deviceModel.markCommandsAsSent(SN, pending);

    const responseText = lines.join("\n") + "\n";
    console.log(
      `📤 Sending ${lines.length} command(s) to ${SN}:\n${responseText.trim()}`
    );
    res.type("text/plain").send(responseText);
  }

  // Handle device command acknowledgment
  deviceCommand(req, res) {
    const SN = req.query.SN || req.body.SN || "";
    const { ID, Return, CMD } = req.body || {};

    if (!SN || !ID || !CMD) {
      return res.type("text/plain").send("OK");
    }

    const cmdId = Number(ID);
    const deviceAck = Return === "0" ? "OK" : "ERR";
    const acknowledged = deviceModel.acknowledgeCommand(SN, cmdId, deviceAck);

    if (acknowledged) {
      console.log(
        `✅ Command C:${ID}:${CMD} acknowledged by device ${SN} -> Return=${Return}`
      );
    } else {
      console.log(`⚠️ Unknown command ack C:${ID}:${CMD} from device ${SN}`);
    }

    res.type("text/plain").send("OK");
  }

  // Queue a new command
  queueCommand(req, res) {
    console.log(req.body);
    const { SN, command } = req.body || {};
    if (!SN || !command) {
      return res.status(400).json({ error: "SN and command are required" });
    }
    const cmd = deviceModel.queueCommand(String(SN), String(command));
    res.json({ success: true, queued: cmd });
  }

  // Request users sync
  requestUsers(req, res) {
    const SN = req.query.SN;
    if (!SN) return res.status(400).json({ error: "SN is required" });
    const cmd = deviceModel.queueCommand(String(SN), "CHECK");
    res.json({ success: true, queued: cmd });
  }

  // Request attendance sync
  requestAttendance(req, res) {
    const SN = req.query.SN;
    if (!SN) return res.status(400).json({ error: "SN is required" });
    const cmd = deviceModel.queueCommand(String(SN), "DATA QUERY ATTLOG");
    res.json({ success: true, queued: cmd });
  }

  // Request user info sync
  requestUserInfo(req, res) {
    const { SN } = req.body || {};
    if (!SN) return res.status(400).json({ error: "SN is required" });
    const cmd = deviceModel.queueCommand(String(SN), "DATA QUERY USERINFO");
    res.json({ success: true, queued: cmd });
  }

  // Add new user to device
  addUser(req, res) {
    const { SN, PIN, Name, Privilege, Password, Card, Group, TZ } = req.body || {};
    if (!SN || !PIN || !Name) {
      return res.status(400).json({ error: "SN, PIN, and Name are required" });
    }
    
    const user = { PIN, Name, Pri: Privilege, Password, Card, Group, TZ };
    const userCommand = `DATA UPDATE USERINFO ${userToDeviceFormat(user)}`;
    const cmd = deviceModel.queueCommand(String(SN), userCommand);
    res.json({ success: true, queued: cmd });
  }

  // Sync users from users.json file to device
  syncUsersFromFile(req, res) {
    const { SN } = req.body || {};
    if (!SN) return res.status(400).json({ error: "SN is required" });

    try {
      const usersFilePath = path.join(__dirname, '../../data/new-users.json');
      
      // Convert JSON file to device format
      const formattedUsers = convertJsonToDeviceFormat(usersFilePath);
      const queuedCommands = [];
      
      // Queue each user command
      formattedUsers.forEach(userFormat => {
        const userCommand = `DATA UPDATE USERINFO ${userFormat}`;
        const cmd = deviceModel.queueCommand(String(SN), userCommand);
        queuedCommands.push(cmd);
      });

      res.json({ 
        success: true, 
        message: `${queuedCommands.length} users queued for sync`,
        queuedCommands 
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to read users file: " + error.message });
    }
  }


  // View queued commands for a device
  getCommands(req, res) {
    const sn = req.params.sn;
    const commands = deviceModel.getCommands(sn);
    res.json({ sn, commands });
  }

  // View all data
  getData(req, res) {
    const data = dataModel.getAllData();
    res.json(data);
  }

  // Handle unknown requests
  handleUnknownRequest(req, res) {
    console.log("request body:", req.body);
    console.log("\n" + "=".repeat(80));
    console.log(`🕵️ Unknown request from device - ${new Date().toISOString()}`);
    console.log("=".repeat(80));
    console.log(`Method: ${req.method}`);
    console.log(`URL: ${req.originalUrl}`);
    console.log(`IP: ${req.ip}`);
    console.log("Headers:", req.headers);
    if (req.body && typeof req.body === "string" && req.body.trim().length) {
      console.log("Body:", req.body);
    }
    console.log("=".repeat(80));

    res.setHeader("Content-Type", "text/plain");
    res.send("OK");
  }
}

export default new DeviceController();