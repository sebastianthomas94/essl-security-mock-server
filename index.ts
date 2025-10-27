/**
 * eSSL Node SDK - Main Entry Point
 * Clean and organized SDK for eSSL/ZKTeco device communication
 */

import { ServerSetup } from "./lib/server/ServerSetup.js";
import { AttendanceManager } from "./lib/managers/AttendanceManager.js";
import { CommandManager } from "./lib/managers/CommandManager.js";
import { UserManager } from "./lib/managers/UserManager.js";
import { DeviceHandler } from "./lib/handlers/DeviceHandler.js";
import { DataParser } from "./lib/utils/DataParser.js";
import { EventManager } from "./lib/utils/EventManager.js";

import ZKLib from "node-zklib";
import type {
  ESSLEventMap,
  ESSLEventName,
  ESSLEventCallback,
} from "./types/index.js";
import express from "express";
import { Server } from "http";

// Import and re-export interfaces
import type {
  ESSLServerOptions,
  UserData,
  AttendanceRecord,
  Command,
  ServerResponse,
} from "./types/interfaces.js";
import { createUserDataString } from "./lib/utils/create-user-data-buffer.js";

export type {
  ESSLServerOptions,
  UserData,
  AttendanceRecord,
  Command,
  ServerResponse,
};

// Re-export event types
export type {
  ESSLEventMap,
  ESSLEventName,
  ESSLEventCallback,
} from "./types/index.js";

/**
 * ESSLServer Class - Main SDK class
 */
export class ESSLServer {
  private options: Required<ESSLServerOptions>;
  public eventManager: EventManager;
  private attendanceManager: AttendanceManager;
  private commandManager: CommandManager;
  private userManager: UserManager;
  private dataParser: DataParser;
  private deviceHandler: DeviceHandler;
  private serverSetup: ServerSetup;
  private app: express.Application | null;
  private server: Server | null;
  private zkInstance!: ZKLib;
  private isConnected: boolean = false;

  constructor(options: ESSLServerOptions = {}) {
    this.options = {
      port: 3000,
      logRequests: false,
      deviceSN: "DEFAULT",
      ...options,
    };

    // Initialize ZKLib instance
    this.zkInstance = new ZKLib("192.168.76.99", 4370, 10000, 4000, 1234);

    // Initialize core utilities
    this.eventManager = new EventManager();
    this.dataParser = new DataParser();

    // Enable debug mode if logging is enabled
    if (this.options.logRequests) {
      this.eventManager.setDebugMode(true);
    }

    // Initialize managers
    this.commandManager = new CommandManager();
    this.attendanceManager = new AttendanceManager(this.commandManager);

    this.userManager = new UserManager(
      this.commandManager,
      this.dataParser,
      this.eventManager,
      this.options.deviceSN,
      this.options.logRequests
    );

    this.deviceHandler = new DeviceHandler(
      this.attendanceManager,
      this.commandManager,
      this
    );
    this.serverSetup = new ServerSetup();
    this.app = null;
    this.server = null;
  }

  /**
   * Connect to ZKTeco device
   */
  async connect(): Promise<void> {
    try {
      if (this.isConnected) {
        console.log("✅ Already connected to device");
        return;
      }

      console.log("📡 Connecting to ZKTeco device...");
      await this.zkInstance.createSocket();
      this.isConnected = true;

      const info = await this.zkInstance.getInfo();
      console.log("✅ Connected to ZKTeco device:", info);
    } catch (error) {
      this.isConnected = false;
      console.error("❌ Failed to connect to ZKTeco device:", error);
      throw error;
    }
  }

  /**
   * Disconnect from ZKTeco device
   */
  async disconnect(): Promise<void> {
    try {
      if (this.isConnected) {
        await this.zkInstance.disconnect();
        this.isConnected = false;
        console.log("✅ Disconnected from ZKTeco device");
      }
    } catch (error) {
      console.error("❌ Error disconnecting:", error);
    }
  }

  on<K extends ESSLEventName>(event: K, callback: ESSLEventCallback<K>): this {
    this.eventManager.on(event, callback);
    return this;
  }

  off<K extends ESSLEventName>(event: K, callback: ESSLEventCallback<K>): this {
    this.eventManager.off(event, callback);
    return this;
  }

  once<K extends ESSLEventName>(
    event: K,
    callback: ESSLEventCallback<K>
  ): this {
    this.eventManager.once(event, callback);
    return this;
  }

  emit<K extends ESSLEventName>(event: K, data: ESSLEventMap[K]): boolean {
    return this.eventManager.emit(event, data);
  }

  getEventDebugInfo(): any {
    return this.eventManager.getDebugInfo();
  }

  createSocket(): Promise<void> {
    return this.zkInstance.createSocket();
  }

  startServer(port?: number | (() => void), callback?: () => void): Server {
    // Handle different parameter combinations
    let finalPort: number;
    if (typeof port === "function") {
      callback = port;
      finalPort = this.options.port;
    } else {
      finalPort = port || this.options.port;
    }

    this.app = this.serverSetup.createApp();

    if (this.app) {
      this.setupRoutes(this.app);
    }

    this.server = this.serverSetup.startServer(finalPort, () => {
      this.emit("server.started", { port: finalPort });
      if (callback) callback();
    });

    return this.server!;
  }

  stopServer(): void {
    if (this.server) {
      this.serverSetup.stopServer();
      this.server = null;
      this.app = null;
      this.emit("server.stopped", undefined);
    }
  }

  getApp(): express.Application | null {
    return this.app || this.serverSetup.getApp();
  }

  setupRoutes(app: express.Application): void {
    this.serverSetup.setupRoutes(app, this.deviceHandler);
  }

  async addUser(userData: Partial<UserData> & { pin: string }) {
    this.userManager.addUser(userData);
  }

  addUsers(
    usersData: Array<Partial<UserData> & { pin: string }>,
    defaultDeviceSN: string = "DEFAULT"
  ): ServerResponse {
    return this.userManager.addUsers(usersData, defaultDeviceSN);
  }

  getUserByPin(pin: string): UserData | null {
    return this.userManager.getUserByPin(pin, this.options.deviceSN);
  }

  async getUsers() {
    return this.userManager.getUsers(this.options.deviceSN);
  }

  updateUser(pin: string, updateData: Partial<UserData>): ServerResponse {
    return this.userManager.updateUser(pin, updateData, this.options.deviceSN);
  }

  deleteUser(pin: string): ServerResponse {
    return this.userManager.deleteUser(pin);
  }

  deleteAllUsers(): ServerResponse {
    return this.userManager.deleteAllUsers();
  }

  deleteAllUsersFromAllDevices(): ServerResponse {
    return this.userManager.deleteAllUsersFromAllDevices(this.options.deviceSN);
  }

  getUsersSummary(): ServerResponse {
    return this.userManager.getUsersSummary();
  }

  async getAttendance() {
    return this.attendanceManager.queryAttendance(this.options.deviceSN);
  }

  getCommands(): Command[] {
    return this.commandManager.getCommands(this.options.deviceSN);
  }

  queueCommand(command: string): Command {
    return this.commandManager.queueCommand(this.options.deviceSN, command);
  }
}

export default ESSLServer;
