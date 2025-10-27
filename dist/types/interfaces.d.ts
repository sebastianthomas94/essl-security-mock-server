/**
 * Core interface definitions for eSSL SDK
 */
export interface ESSLServerOptions {
    port?: number;
    logRequests?: boolean;
    deviceSN?: string;
}
export interface UserData {
    PIN: string;
    Name?: string;
    Passwd?: string;
    Card?: string;
    Grp?: string;
    TZ?: string;
    Pri?: string;
    pin?: string;
    name?: string;
    password?: string;
    card?: string;
    group?: string;
    timezone?: string;
    privilege?: string;
    deviceSN?: string;
}
export interface AttendanceRecord {
    SN: string;
    PIN: string;
    DateTime: string;
    Verified: string;
    Status: string;
    WorkCode?: string;
}
export interface Command {
    id: string;
    type: string;
    data?: any;
    deviceSN?: string;
    timestamp?: Date;
    status?: "pending" | "sent" | "completed" | "failed" | "acknowledged";
}
export interface ServerResponse {
    success: boolean;
    message?: string;
    data?: any;
    error?: string;
}
//# sourceMappingURL=interfaces.d.ts.map