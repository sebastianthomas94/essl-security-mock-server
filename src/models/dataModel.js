import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DataModel {
  constructor() {
    this.dataDir = path.join(__dirname, "../../data");
    this.usersFile = path.join(this.dataDir, "users.json");
    this.attendanceFile = path.join(this.dataDir, "attendance.json");
    this.initializeFiles();
  }

  initializeFiles() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir);
    }
    if (!fs.existsSync(this.usersFile)) {
      fs.writeFileSync(this.usersFile, "[]");
    }
    if (!fs.existsSync(this.attendanceFile)) {
      fs.writeFileSync(this.attendanceFile, "[]");
    }
  }

  loadJSON(file) {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  }

  saveJSON(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  }

  saveAttendance(logs, sn) {
    const now = new Date().toISOString();
    const existing = this.loadJSON(this.attendanceFile);
    logs.forEach((log) => existing.push({ ...log, SN: sn, receivedAt: now }));
    this.saveJSON(this.attendanceFile, existing);
    console.log(`📦 Saved ${logs.length} attendance logs (SN=${sn})`);
  }

  saveUsers(users, sn) {
    const now = new Date().toISOString();
    const existing = this.loadJSON(this.usersFile);
    users.forEach((u) => {
      const idx = existing.findIndex((x) => x.PIN === u.PIN);
      if (idx >= 0) {
        existing[idx] = { ...u, updatedAt: now, SN: sn };
      } else {
        existing.push({ ...u, createdAt: now, SN: sn });
      }
    });
    this.saveJSON(this.usersFile, existing);
    console.log(`👥 Synced ${users.length} users (SN=${sn})`);
  }

  getAllData() {
    return {
      users: this.loadJSON(this.usersFile),
      attendance: this.loadJSON(this.attendanceFile),
    };
  }
}

export default new DataModel();