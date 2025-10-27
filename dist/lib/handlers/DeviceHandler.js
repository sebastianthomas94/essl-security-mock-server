/**
 * Device Communication Handler
 * Handles device protocol communication
 */
import { DataParser } from "../utils/DataParser.js";
export class DeviceHandler {
    constructor(attendanceManager, commandManager, esslServer) {
        this.attendanceManager = attendanceManager;
        this.commandManager = commandManager;
        this.esslServer = esslServer;
        this.parser = new DataParser();
        // Store reference to event manager for easier access
        this.eventManager = esslServer.eventManager;
    }
    /**
     * Handle device polling for commands
     */
    handlePolling(deviceSN) {
        if (!deviceSN)
            return "OK";
        // Emit device connected event
        this.esslServer.emit("device.connected", {
            deviceSN,
            timestamp: new Date(),
        });
        const pendingCommands = this.commandManager.getPendingCommands(deviceSN);
        if (pendingCommands.length === 0) {
            return "OK";
        }
        const commandStrings = pendingCommands.map((cmd) => `C:${cmd.id}:${cmd.command}`);
        this.commandManager.markCommandsAsSent(deviceSN, pendingCommands);
        // Emit command sent events
        pendingCommands.forEach((cmd) => {
            this.esslServer.emit("device.command.sent", {
                deviceSN,
                commandId: cmd.id,
                command: cmd.command,
                timestamp: new Date(),
            });
        });
        return commandStrings.join("\n") + "\n";
    }
    /**
     * Handle device data requests (GET /iclock/cdata.aspx)
     */
    handleDataRequest(table, deviceSN, queryParams) {
        // Device is requesting data/configuration
        console.log(`📥 Device ${deviceSN} requesting data for table: ${table}`);
        if (table === "USERINFO") {
            // NO LOCAL STORAGE - users exist only on device
            console.log(`📄 No local user data for device ${deviceSN} - users stored on device only`);
            return "OK";
        }
        if (table === "ATTLOG") {
            // Device wants attendance data (rarely used)
            return "OK";
        }
        // Default response for unknown tables
        return "OK";
    }
    /**
     * Handle device data submission
     */
    handleDataSubmission(table, deviceSN, rawBody) {
        console.log("table received:", table);
        console.log(rawBody);
        if (table === "ATTLOG") {
            const lines = rawBody
                .split("\n")
                .map((l) => l.trim())
                .filter(Boolean);
            const attendanceRecords = lines.map((line) => this.parser.parseAttendanceLine(line));
            // Convert parsed attendance to our format
            const convertedRecords = attendanceRecords.map((record) => ({
                SN: deviceSN,
                PIN: record.PIN,
                DateTime: record.Timestamp,
                Verified: record.VerifyMode,
                Status: record.InOutMode,
                WorkCode: record.WorkCode,
            }));
            // Emit attendance event
            this.esslServer.emit("attendace", convertedRecords);
            return "OK:ATTLOG 10001";
        }
        if (table === "OPERLOG") {
            const lines = rawBody.split("\n").map((l) => l.trim());
            const operationLines = lines.filter((l) => l.includes("OPLOG"));
            const userLines = lines.filter((l) => l.startsWith("USER"));
            const fingerprintLines = lines.filter((l) => l.startsWith("FP"));
            const faceLines = lines.filter((l) => l.startsWith("Face"));
            const users = userLines.map((line) => this.parser.parseUserLine(line));
            const fingerPrint = fingerprintLines.map((line) => this.parser.parseFingerprintLine(line));
            const operation = operationLines.map((line) => this.parser.parseOperationLine(line));
            const faceData = faceLines.map((line) => this.parser.parseFaceLine(line));
            if (faceData.length > 0) {
                this.esslServer.emit("faceData.info", {
                    faceData: faceData,
                    deviceSN,
                });
            }
            if (fingerPrint.length > 0) {
                this.esslServer.emit("fingerprint.info", {
                    fingerPring: fingerPrint,
                    deviceSN,
                });
            }
            if (users.length > 0) {
                this.esslServer.emit("user.info", {
                    users,
                    commands: { [deviceSN]: [] },
                    count: users.length,
                });
                console.log(`📄 Received ${users.length} users from device ${deviceSN} `);
            }
            operation.forEach((op) => {
                if (op.codeNumber === "9" && op.userPin !== "0") {
                    this.esslServer.emit("user.deleted", {
                        userPin: op.userPin,
                        deviceSN,
                    });
                }
                if (op.codeNumber === "36") {
                    this.esslServer.emit("userInfo.changed", {
                        userId: op.userPin,
                        deviceSN,
                    });
                }
                if (op.codeNumber === "6") {
                    this.esslServer.emit("fingerprint.added", {
                        userId: op.userPin,
                        deviceSN,
                    });
                }
            });
            return "OK:OPERLOG 10001";
        }
        return "OK";
    }
    /**
     * Handle device command acknowledgment
     */
    handleCommandAck(body) {
        const { SN, ID, Return, CMD } = body || {};
        if (!SN || !ID)
            return;
        const acknowledged = this.commandManager.acknowledgeCommand(SN, String(ID), Return === "0" ? "OK" : "ERR");
        console.log("this is  device post request /iclock/devicecmd.aspx", body);
        this.esslServer.emit("command.acknowledged", {
            deviceSN: SN,
            commandId: Number(ID),
            command: CMD,
            returnCode: Return,
            acknowledged: acknowledged,
        });
    }
}
//# sourceMappingURL=DeviceHandler.js.map