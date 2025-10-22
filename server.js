/**
 * eSSL / ZKTeco Mock Server
 * Clean MVC Architecture with Express Router
 */

import express from "express";
import config from "./src/config/index.js";
import { setupMiddleware } from "./src/middleware/index.js";
import routes from "./src/routes/index.js";

const app = express();

// Setup middleware
setupMiddleware(app);

// Setup routes
app.use("/", routes);

// Start server
app.listen(config.port, () => {
  console.log("\n" + "🚀".repeat(10));
  console.log(`eSSL sync server running on port ${config.port}`);
  console.log("Endpoints:");
  console.log("  GET  /iclock/getrequest.aspx?SN=<sn>   (device polling)");
  console.log("  POST /iclock/cdata.aspx               (device data sync)");
  console.log("  POST /iclock/devicecmd.aspx           (device command ack)");
  console.log("  POST /queue-command                   { SN, command }");
  console.log("  GET  /request-users?SN=<sn>          (request user sync)");
  console.log("  GET  /request-attendance?SN=<sn>     (request attendance sync)");
  console.log("  GET  /commands/:sn                   (view queued commands)");
  console.log("  GET  /data                           (view users & attendance)");
  console.log("🚀".repeat(10) + "\n");
});