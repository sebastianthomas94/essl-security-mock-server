/**
 * Type declarations for node-zklib
 * @see https://www.npmjs.com/package/node-zklib
 */

declare module "node-zklib" {
  /**
   * Error types for ZKLib operations
   */
  export enum ERROR_TYPES {
    ECONNREFUSED = "ECONNREFUSED",
    EADDRINUSE = "EADDRINUSE",
  }

  /**
   * Custom error class for ZKLib operations
   */
  export class ZKError extends Error {
    constructor(error: Error, command: string, ip: string);
    code?: string;
  }

  /**
   * User data structure returned from the device
   */
  export interface User {
    uid: number;
    userId: string;
    name: string;
    password: string;
    role: number;
    cardno: string;
  }

  /**
   * Attendance record structure
   */
  export interface AttendanceLog {
    uid: number;
    userId: string;
    attTime: Date;
    ip: string;
    deviceUserId: string;
  }

  /**
   * Device information structure
   */
  export interface DeviceInfo {
    userCounts: number;
    logCounts: number;
    logCapacity: number;
    faceCount?: number;
    fingerprintCount?: number;
    serialNumber?: string;
    model?: string;
    firmwareVersion?: string;
    platform?: string;
    deviceName?: string;
    [key: string]: any;
  }

  /**
   * Socket status information
   */
  export interface SocketStatus {
    socket: any;
    is_connect: boolean;
  }

  /**
   * Connection protocol type
   */
  export type ConnectionProtocol = "tcp" | "udp" | null;

  /**
   * Callback function for real-time logs
   */
  export type RealTimeLogCallback = (log: AttendanceLog) => void;

  /**
   * Callback function for errors
   */
  export type ErrorCallback = (err: Error) => void;

  /**
   * Callback function for connection close
   */
  export type CloseCallback = () => void;

  /**
   * Main ZKLib class for device communication
   */
  export default class ZKLib {
    /**
     * Current connection type (tcp/udp)
     */
    connectionType: ConnectionProtocol;

    /**
     * IP address of the device
     */
    ip: string;

    /**
     * Communication code (device password)
     */
    comm_code?: number;

    /**
     * Indicates if the device is busy
     */
    isBusy: boolean;

    /**
     * Creates a new ZKLib instance
     * @param ip - Device IP address
     * @param port - Device port (usually 4370)
     * @param timeout - Connection timeout in milliseconds
     * @param inport - Incoming port for UDP connection
     * @param comm_code - Communication code (device password, default: 0)
     * @param protocol - Connection protocol ('tcp' or 'udp', auto-detect if not specified)
     */
    constructor(
      ip: string,
      port: number,
      timeout: number,
      inport: number,
      comm_code?: number,
      protocol?: ConnectionProtocol
    );

    /**
     * Create and establish socket connection to the device
     * @param cbErr - Error callback function
     * @param cbClose - Close callback function
     */
    createSocket(cbErr?: ErrorCallback, cbClose?: CloseCallback): Promise<void>;

    /**
     * Get all users from the device
     * @returns Array of user objects
     */
    getUsers(): Promise<{ data: User[] }>;

    /**
     * Get all attendance logs from the device
     * @param cb - Optional callback function for processing each log
     * @returns Array of attendance log objects
     */
    getAttendances(
      cb?: (log: AttendanceLog) => void
    ): Promise<{ data: AttendanceLog[] }>;

    /**
     * Enable real-time log monitoring
     * @param cb - Callback function called for each real-time log entry
     */
    getRealTimeLogs(cb: RealTimeLogCallback): Promise<void>;

    /**
     * Disconnect from the device
     */
    disconnect(): Promise<void>;

    /**
     * Free buffered data on the device
     */
    freeData(): Promise<void>;

    /**
     * Get current time from the device
     * @returns Device time
     */
    getTime(): Promise<Date>;

    /**
     * Disable the device (locks the device)
     */
    disableDevice(): Promise<void>;

    /**
     * Enable the device (unlocks the device)
     */
    enableDevice(): Promise<void>;

    /**
     * Get device information
     * @returns Device information object
     */
    getInfo(): Promise<DeviceInfo>;

    /**
     * Get current socket status
     * @returns Socket status information
     */
    getSocketStatus(): Promise<SocketStatus>;

    /**
     * Clear all attendance logs from the device
     */
    clearAttendanceLog(): Promise<void>;

    /**
     * Execute a custom command on the device
     * @param command - Command code
     * @param data - Command data (optional)
     * @returns Command response
     */
    executeCmd(command: number, data?: string | Buffer): Promise<any>;

    /**
     * Set up an interval schedule
     * @param cb - Callback function to execute
     * @param timer - Interval time in milliseconds
     */
    setIntervalSchedule(cb: () => void, timer: number): void;

    /**
     * Set up a timer schedule
     * @param cb - Callback function to execute
     * @param timer - Timeout time in milliseconds
     */
    setTimerSchedule(cb: () => void, timer: number): void;

    /**
     * Internal method to wrap TCP/UDP function calls
     * @internal
     */
    functionWrapper(
      tcpCallback: () => Promise<any>,
      udpCallback: () => Promise<any>,
      command?: string
    ): Promise<any>;
  }

  /**
   * Export error types
   */
  export { ERROR_TYPES, ZKError };
}
