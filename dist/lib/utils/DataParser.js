/**
 * Data Parser Utility
 * Handles parsing of device data formats
 */
var OperationType;
(function (OperationType) {
    OperationType["ADD_USER"] = "0";
    OperationType["EDIT_USER"] = "1";
    OperationType["DELETE_USER"] = "2";
    OperationType["ENROLL_FINGER"] = "3";
    OperationType["DELETE_FINGER"] = "4";
    OperationType["MODIFY_PRIVILEGE"] = "5";
    OperationType["UNKNOWN"] = "99";
})(OperationType || (OperationType = {}));
// Operation names for logging
const OPERATION_NAMES = {
    "0": "Add User",
    "1": "Edit User",
    "2": "Delete User",
    "3": "Enroll Fingerprint",
    "4": "Delete Fingerprint",
    "5": "Modify Privilege",
    "99": "Unknown Operation",
};
export class DataParser {
    /**
     * Parse user line from device data
     */
    parseUserLine(line) {
        const fields = {};
        line.split(/\s+/).forEach((pair) => {
            const [key, value] = pair.split("=");
            if (key)
                fields[key] = value || "";
        });
        return {
            PIN: fields.PIN || "",
            Name: fields.Name || "",
            Privilege: Number(fields.Pri) || 0,
            Password: fields.Passwd || "",
            Card: fields.Card || "",
        };
    }
    /**
     * Parse attendance line from device data
     */
    parseAttendanceLine(line) {
        const parts = line.trim().split(/\s+/);
        return {
            PIN: parts[0] || "",
            Timestamp: parts[1] + (parts[2] ? " " + parts[2] : ""),
            VerifyMode: parts[3] || "",
            InOutMode: parts[4] || "",
            WorkCode: parts[5] || "",
        };
    }
    parseOperationLine(line) {
        // Remove "OPLOG " prefix if present
        const cleanLine = line.replace(/^OPLOG\s+/, "");
        const parts = cleanLine.split("\t");
        const codeNumber = parts ? parts[0] : null;
        const userPin = parts ? parts[1] : null;
        return {
            userPin,
            codeNumber,
        };
    }
    /**
     * Format user data for device command
     */
    formatUserForDevice(user) {
        const privilege = user.Pri || "0";
        return `PIN=${user.PIN}\tName=${user.Name}\tPri=${privilege}\tPasswd=${user.Passwd}\tCard=${user.Card}`;
    }
    parseFingerprintLine(line) {
        const fields = {};
        line.split(/\s+/).forEach((pair) => {
            const [key, value] = pair.split("=");
            if (key)
                fields[key] = value || "";
        });
        return {
            pin: fields.PIN || "",
            fingerId: fields.FID || "",
            size: Number(fields.Size) || 0,
            valid: Number(fields.Valid) || 0,
            template: fields.TMP || "",
        };
    }
    parseFaceLine(line) {
        const fields = {};
        line.split(/\s+/).forEach((pair) => {
            const [key, value] = pair.split("=");
            if (key)
                fields[key] = value || "";
        });
        return {
            pin: fields.PIN || "",
            faceId: fields.FID || "",
            size: Number(fields.SIZE) || 0,
            valid: Number(fields.VALID) || 0,
            template: fields.TMP || "",
        };
    }
}
//# sourceMappingURL=DataParser.js.map