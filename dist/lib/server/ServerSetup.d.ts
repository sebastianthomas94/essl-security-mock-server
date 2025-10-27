/**
 * Express Server Setup
 * Handles complete server configuration for eSSL device communication
 */
import express from "express";
import { Server } from "http";
import type { DeviceHandler } from "../handlers/DeviceHandler.js";
export declare class ServerSetup {
    private app;
    private server;
    constructor();
    /**
     * Create and configure Express app with middleware
     */
    createApp(): express.Application;
    /**
     * Start the server on specified port
     */
    startServer(port?: number, callback?: () => void): Server;
    /**
     * Stop the server
     */
    stopServer(): void;
    /**
     * Get the Express app instance
     */
    getApp(): express.Application | null;
    setupRoutes(app: express.Application, deviceHandler: DeviceHandler): void;
}
//# sourceMappingURL=ServerSetup.d.ts.map