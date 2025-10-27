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

enum OperationType {
  ADD_USER = "0",
  EDIT_USER = "1",
  DELETE_USER = "2",
  ENROLL_FINGER = "3",
  DELETE_FINGER = "4",
  MODIFY_PRIVILEGE = "5",
  UNKNOWN = "99",
}

// Operation names for logging
const OPERATION_NAMES: Record<string, string> = {
  "0": "Add User",
  "1": "Edit User",
  "2": "Delete User",
  "3": "Enroll Fingerprint",
  "4": "Delete Fingerprint",
  "5": "Modify Privilege",
  "99": "Unknown Operation",
};

interface ParsedOperation {
  PIN: string;
  operation: string;
  operationName: string;
  timestamp: string;
  rawData: string;
}

interface ParsedAttendance {
  PIN: string;
  Timestamp: string;
  VerifyMode: string;
  InOutMode: string;
  WorkCode: string;
}

export class DataParser {
  /**
   * Parse user line from device data
   */
  parseUserLine(line: string): ParsedUser {
    const fields: Record<string, string> = {};
    line.split(/\s+/).forEach((pair) => {
      const [key, value] = pair.split("=");
      if (key) fields[key] = value || "";
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
  parseAttendanceLine(line: string): ParsedAttendance {
    const parts = line.trim().split(/\s+/);
    return {
      PIN: parts[0] || "",
      Timestamp: parts[1] + (parts[2] ? " " + parts[2] : ""),
      VerifyMode: parts[3] || "",
      InOutMode: parts[4] || "",
      WorkCode: parts[5] || "",
    };
  }

  parseOperationLine(line: string): {
    userPin: string | null;
    codeNumber: string | null;
  } {
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
  formatUserForDevice(
    user: UserData | (UserData & { deviceSN: string })
  ): string {
    const privilege = user.Pri || "0";
    return `PIN=${user.PIN}\tName=${user.Name}\tPri=${privilege}\tPasswd=${user.Passwd}\tCard=${user.Card}`;
  }

  parseFingerprintLine(line: string): ParsedFingerprint {
    const fields: Record<string, string> = {};

    line.split(/\s+/).forEach((pair) => {
      const [key, value] = pair.split("=");
      if (key) fields[key] = value || "";
    });

    return {
      pin: fields.PIN || "",
      fingerId: fields.FID || "",
      size: Number(fields.Size) || 0,
      valid: Number(fields.Valid) || 0,
      template: fields.TMP || "",
    };
  }

  parseFaceLine(line: string): ParsedFace {
    const fields: Record<string, string> = {};

    line.split(/\s+/).forEach((pair) => {
      const [key, value] = pair.split("=");
      if (key) fields[key] = value || "";
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
