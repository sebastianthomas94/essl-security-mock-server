/**
 * Data Parser Utility
 * Handles parsing of device data formats
 */
import type { UserData } from "../../index.js";
export interface ParsedFingerprint {
    pin: string;
    fingerId: string;
    size: number;
    valid: number;
    template: string;
}
export interface ParsedFace {
    pin: string;
    faceId: string;
    size: number;
    valid: number;
    template: string;
}
interface ParsedUser {
    PIN: string;
    Name: string;
    Privilege: number;
    Password: string;
    Card: string;
}
interface ParsedAttendance {
    PIN: string;
    Timestamp: string;
    VerifyMode: string;
    InOutMode: string;
    WorkCode: string;
}
export declare class DataParser {
    /**
     * Parse user line from device data
     */
    parseUserLine(line: string): ParsedUser;
    /**
     * Parse attendance line from device data
     */
    parseAttendanceLine(line: string): ParsedAttendance;
    parseOperationLine(line: string): {
        userPin: string | null;
        codeNumber: string | null;
    };
    /**
     * Format user data for device command
     */
    formatUserForDevice(user: UserData | (UserData & {
        deviceSN: string;
    })): string;
    parseFingerprintLine(line: string): ParsedFingerprint;
    parseFaceLine(line: string): ParsedFace;
}
export {};
//# sourceMappingURL=DataParser.d.ts.map