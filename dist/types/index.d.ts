/**
 * Type definitions for ESSL Server Events
 */
import type { UserData, AttendanceRecord, Command } from "../index.js";
import { ParsedFace, ParsedFingerprint } from "../lib/utils/DataParser.js";
export interface ESSLEventMap {
    "server.started": {
        port: number;
    };
    "server.stopped": undefined;
    "userInfo.changed": {
        userId: string;
        deviceSN: string;
    };
    "fingerprint.added": {
        userId: string;
        deviceSN: string;
    };
    "user.info": {
        user: UserData;
        deviceSN: string;
    };
    "fingerprint.info": {
        fingerPrint: ParsedFingerprint;
        deviceSN: string;
    };
    "faceData.info": {
        faceData: ParsedFace;
        deviceSN: string;
    };
    "users.added": {
        users: UserData[];
        commands: Record<string, Command[]>;
        count: number;
    };
    "user.deleted": {
        user: UserData | null;
        command: Command;
        deviceSN: string;
        pin?: string;
    };
    "users.allDeleted": {
        deviceSN: string;
        command: Command;
    };
    "users.allDeletedFromAllDevices": {
        command: Command;
    };
    "users.synced": {
        users: any[];
        deviceSN: string;
    };
    "device.connected": {
        deviceSN: string;
        timestamp: string;
    };
    "device.command.sent": {
        command: string;
        deviceSN: string;
        commandId: string;
    };
    attendace: {
        attendance: AttendanceRecord[];
        deviceSN: string;
    };
    "command.acknowledged": {
        commandId: string;
        command: string;
        returnCode: string;
        deviceSN: string;
    };
    "query.users": {
        deviceSN: string;
        command: Command;
    };
}
/**
 * Type helper for event names
 */
export type ESSLEventName = keyof ESSLEventMap;
/**
 * Type helper for event callbacks
 */
export type ESSLEventCallback<K extends ESSLEventName> = (data: ESSLEventMap[K]) => void;
//# sourceMappingURL=index.d.ts.map