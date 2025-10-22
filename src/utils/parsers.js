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

export {
  parseUserLine,
  parseAttendanceLine,
};