/**
 * Express Server Setup
 * Handles complete server configuration for eSSL device communication
 */
import express from "express";
import cors from "cors";
// @ts-ignore
import xmlParser from "express-xml-bodyparser";
export class ServerSetup {
    constructor() {
        this.app = null;
        this.server = null;
    }
    /**
     * Create and configure Express app with middleware
     */
    createApp() {
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
    startServer(port = 3000, callback) {
        if (!this.app) {
            throw new Error("App not created. Call createApp() first.");
        }
        this.server = this.app.listen(port, () => {
            console.log(`🚀 eSSL Mock Server running on port ${port}`);
            if (callback)
                callback();
        });
        return this.server;
    }
    /**
     * Stop the server
     */
    stopServer() {
        if (this.server) {
            this.server.close();
            this.server = null;
            console.log("🛑 eSSL Mock Server stopped");
        }
    }
    /**
     * Get the Express app instance
     */
    getApp() {
        return this.app;
    }
    setupRoutes(app, deviceHandler) {
        // Device polling endpoint - device requests commands
        app.get("/iclock/getrequest.aspx", (req, res) => {
            const { SN, rawBody } = req.query;
            console.log("rawBody from get", rawBody);
            const result = deviceHandler.handlePolling(SN);
            res.type("text/plain").send(result);
        });
        // Device data GET endpoint - device requests configuration/data
        app.get("/iclock/cdata.aspx", (req, res) => {
            const { table, SN, rawBody } = req.query;
            console.log("rawBody from cdata get", req.query);
            const result = deviceHandler.handleDataRequest(table, SN, req.query);
            res.type("text/plain").send(result);
        });
        // Device data submission endpoint - device sends data
        app.post("/iclock/cdata.aspx", (req, res) => {
            const { table, SN } = req.query;
            const rawBody = typeof req.body === "string" ? req.body : "";
            console.log("rawBody from cdata post", rawBody);
            const result = deviceHandler.handleDataSubmission(table, SN, rawBody);
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
//# sourceMappingURL=ServerSetup.js.map