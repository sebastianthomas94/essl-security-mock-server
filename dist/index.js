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
/**
 * ESSLServer Class - Main SDK class
 */
export class ESSLServer {
    constructor(options = {}) {
        this.isConnected = false;
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
        this.userManager = new UserManager(this.commandManager, this.dataParser, this.eventManager, this.options.deviceSN, this.options.logRequests);
        this.deviceHandler = new DeviceHandler(this.attendanceManager, this.commandManager, this);
        this.serverSetup = new ServerSetup();
        this.app = null;
        this.server = null;
    }
    /**
     * Connect to ZKTeco device
     */
    async connect() {
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
        }
        catch (error) {
            this.isConnected = false;
            console.error("❌ Failed to connect to ZKTeco device:", error);
            throw error;
        }
    }
    /**
     * Disconnect from ZKTeco device
     */
    async disconnect() {
        try {
            if (this.isConnected) {
                await this.zkInstance.disconnect();
                this.isConnected = false;
                console.log("✅ Disconnected from ZKTeco device");
            }
        }
        catch (error) {
            console.error("❌ Error disconnecting:", error);
        }
    }
    on(event, callback) {
        this.eventManager.on(event, callback);
        return this;
    }
    off(event, callback) {
        this.eventManager.off(event, callback);
        return this;
    }
    once(event, callback) {
        this.eventManager.once(event, callback);
        return this;
    }
    emit(event, data) {
        return this.eventManager.emit(event, data);
    }
    getEventDebugInfo() {
        return this.eventManager.getDebugInfo();
    }
    createSocket() {
        return this.zkInstance.createSocket();
    }
    startServer(port, callback) {
        // Handle different parameter combinations
        let finalPort;
        if (typeof port === "function") {
            callback = port;
            finalPort = this.options.port;
        }
        else {
            finalPort = port || this.options.port;
        }
        this.app = this.serverSetup.createApp();
        if (this.app) {
            this.setupRoutes(this.app);
        }
        this.server = this.serverSetup.startServer(finalPort, () => {
            this.emit("server.started", { port: finalPort });
            if (callback)
                callback();
        });
        return this.server;
    }
    stopServer() {
        if (this.server) {
            this.serverSetup.stopServer();
            this.server = null;
            this.app = null;
            this.emit("server.stopped", undefined);
        }
    }
    getApp() {
        return this.app || this.serverSetup.getApp();
    }
    setupRoutes(app) {
        this.serverSetup.setupRoutes(app, this.deviceHandler);
    }
    async addUser(userData) {
        this.userManager.addUser(userData);
    }
    addUsers(usersData, defaultDeviceSN = "DEFAULT") {
        return this.userManager.addUsers(usersData, defaultDeviceSN);
    }
    getUserByPin(pin) {
        return this.userManager.getUserByPin(pin, this.options.deviceSN);
    }
    async getUsers() {
        return this.userManager.getUsers(this.options.deviceSN);
    }
    updateUser(pin, updateData) {
        return this.userManager.updateUser(pin, updateData, this.options.deviceSN);
    }
    deleteUser(pin) {
        return this.userManager.deleteUser(pin);
    }
    deleteAllUsers() {
        return this.userManager.deleteAllUsers();
    }
    deleteAllUsersFromAllDevices() {
        return this.userManager.deleteAllUsersFromAllDevices(this.options.deviceSN);
    }
    getUsersSummary() {
        return this.userManager.getUsersSummary();
    }
    async getAttendance() {
        return this.attendanceManager.queryAttendance(this.options.deviceSN);
    }
    getCommands() {
        return this.commandManager.getCommands(this.options.deviceSN);
    }
    queueCommand(command) {
        return this.commandManager.queueCommand(this.options.deviceSN, command);
    }
}
export default ESSLServer;
//# sourceMappingURL=index.js.map