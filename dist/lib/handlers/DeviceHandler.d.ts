/**
 * Device Communication Handler
 * Handles device protocol communication
 */
import type { AttendanceManager } from "../managers/AttendanceManager.js";
import type { CommandManager } from "../managers/CommandManager.js";
export declare class DeviceHandler {
    private attendanceManager;
    private commandManager;
    private esslServer;
    private parser;
    private eventManager;
    constructor(attendanceManager: AttendanceManager, commandManager: CommandManager, esslServer: any);
    /**
     * Handle device polling for commands
     */
    handlePolling(deviceSN: string): string;
    /**
     * Handle device data requests (GET /iclock/cdata.aspx)
     */
    handleDataRequest(table: string, deviceSN: string, queryParams: any): string;
    /**
     * Handle device data submission
     */
    handleDataSubmission(table: string, deviceSN: string, rawBody: string): string;
    /**
     * Handle device command acknowledgment
     */
    handleCommandAck(body: any): void;
}
//# sourceMappingURL=DeviceHandler.d.ts.map