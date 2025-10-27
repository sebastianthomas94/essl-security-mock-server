import { CommandManager } from "./CommandManager.js";

export class AttendanceManager {
  constructor(private commandManager: CommandManager) {}

  queryAttendance(deviceSN: string = "DEFAULT") {
    this.commandManager.queueCommand(deviceSN, `DATA QUERY ATTLOG`);
  }
}
