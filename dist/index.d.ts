/**
 * eSSL Node SDK - Main Entry Point
 * Clean and organized SDK for eSSL/ZKTeco device communication
 */
import { EventManager } from "./lib/utils/EventManager.js";
import type { ESSLEventMap, ESSLEventName, ESSLEventCallback } from "./types/index.js";
import express from "express";
import { Server } from "http";
import type { ESSLServerOptions, UserData, AttendanceRecord, Command, ServerResponse } from "./types/interfaces.js";
export type { ESSLServerOptions, UserData, AttendanceRecord, Command, ServerResponse, };
export type { ESSLEventMap, ESSLEventName, ESSLEventCallback, } from "./types/index.js";
/**
 * ESSLServer Class - Main SDK class
 */
export declare class ESSLServer {
    private options;
    eventManager: EventManager;
    private attendanceManager;
    private commandManager;
    private userManager;
    private dataParser;
    private deviceHandler;
    private serverSetup;
    private app;
    private server;
    private zkInstance;
    private isConnected;
    constructor(options?: ESSLServerOptions);
    /**
     * Connect to ZKTeco device
     */
    connect(): Promise<void>;
    /**
     * Disconnect from ZKTeco device
     */
    disconnect(): Promise<void>;
    on<K extends ESSLEventName>(event: K, callback: ESSLEventCallback<K>): this;
    off<K extends ESSLEventName>(event: K, callback: ESSLEventCallback<K>): this;
    once<K extends ESSLEventName>(event: K, callback: ESSLEventCallback<K>): this;
    emit<K extends ESSLEventName>(event: K, data: ESSLEventMap[K]): boolean;
    getEventDebugInfo(): any;
    createSocket(): Promise<void>;
    startServer(port?: number | (() => void), callback?: () => void): Server;
    stopServer(): void;
    getApp(): express.Application | null;
    setupRoutes(app: express.Application): void;
    addUser(userData: Partial<UserData> & {
        pin: string;
    }): Promise<void>;
    addUsers(usersData: Array<Partial<UserData> & {
        pin: string;
    }>, defaultDeviceSN?: string): ServerResponse;
    getUserByPin(pin: string): UserData | null;
    getUsers(): Promise<UserData[]>;
    updateUser(pin: string, updateData: Partial<UserData>): ServerResponse;
    deleteUser(pin: string): ServerResponse;
    deleteAllUsers(): ServerResponse;
    deleteAllUsersFromAllDevices(): ServerResponse;
    getUsersSummary(): ServerResponse;
    getAttendance(): Promise<void>;
    getCommands(): Command[];
    queueCommand(command: string): Command;
}
export default ESSLServer;
//# sourceMappingURL=index.d.ts.map