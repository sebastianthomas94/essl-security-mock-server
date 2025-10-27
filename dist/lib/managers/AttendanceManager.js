export class AttendanceManager {
    constructor(commandManager) {
        this.commandManager = commandManager;
    }
    queryAttendance(deviceSN = "DEFAULT") {
        this.commandManager.queueCommand(deviceSN, `DATA QUERY ATTLOG`);
    }
}
//# sourceMappingURL=AttendanceManager.js.map