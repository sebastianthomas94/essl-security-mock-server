/**
 * Express Server Setup
 * Handles complete server configuration for eSSL device communication
 */

import express from "express";
import cors from "cors";
// @ts-ignore
import xmlParser from "express-xml-bodyparser";
import { Server } from "http";
import type { DeviceHandler } from "../handlers/DeviceHandler.js";

export class ServerSetup {
  private app: express.Application | null;
  private server: Server | null;

  constructor() {
    this.app = null;
    this.server = null;
  }

  /**
   * Create and configure Express app with middleware
   */
  createApp(): express.Application {
    const app = express();

    // Setup middleware
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.text());
    app.use(xmlParser());

    this.app = app;
    return app;
  }

  /**
   * Start the server on specified port
   */
  startServer(port: number = 3000, callback?: () => void): Server {
    if (!this.app) {
      throw new Error("App not created. Call createApp() first.");
    }

    this.server = this.app.listen(port, () => {
      console.log(`🚀 eSSL Mock Server running on port ${port}`);
      if (callback) callback();
    });

    return this.server;
  }

  /**
   * Stop the server
   */
  stopServer(): void {
    if (this.server) {
      this.server.close();
      this.server = null;
      console.log("🛑 eSSL Mock Server stopped");
    }
  }

  /**
   * Get the Express app instance
   */
  getApp(): express.Application | null {
    return this.app;
  }

  setupRoutes(app: express.Application, deviceHandler: DeviceHandler): void {
    // Device polling endpoint - device requests commands
    app.get("/iclock/getrequest.aspx", (req, res) => {
      const { SN, rawBody } = req.query;
      console.log("rawBody from get", rawBody);
      const result = deviceHandler.handlePolling(SN as string);
      res.type("text/plain").send(result);
    });

    // Device data GET endpoint - device requests configuration/data
    app.get("/iclock/cdata.aspx", (req, res) => {
      const { table, SN, rawBody } = req.query;

      console.log("rawBody from cdata get", req.query);
      const result = deviceHandler.handleDataRequest(
        table as string,
        SN as string,
        req.query
      );
      res.type("text/plain").send(result);
    });

    // Device data submission endpoint - device sends data
    app.post("/iclock/cdata.aspx", (req, res) => {
      const { table, SN } = req.query;
      const rawBody = typeof req.body === "string" ? req.body : "";
      console.log("rawBody from cdata post", rawBody);
      const result = deviceHandler.handleDataSubmission(
        table as string,
        SN as string,
        rawBody
      );
      res.type("text/plain").send(result);
    });

    // Device command acknowledgment endpoint
    app.post("/iclock/devicecmd.aspx", (req, res) => {
      deviceHandler.handleCommandAck(req.body);
      res.type("text/plain").send("OK");
    });

    // Fallback for unknown requests
    app.all("*", (req, res) => {
      console.log(`❓ Unknown request: ${req.method} ${req.url}`);
      res.type("text/plain").send("OK");
    });
  }
}
