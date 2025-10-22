import express from "express";
import deviceController from "../controllers/deviceController.js";

const router = express.Router();


// Device communication endpoints
router.get("/iclock/cdata.aspx", deviceController.getDeviceData);
router.post("/iclock/cdata.aspx", deviceController.postDeviceData);
router.get("/iclock/getrequest.aspx", deviceController.getRequest);
router.post(
  "/iclock/devicecmd.aspx",
  express.urlencoded({ extended: true }),
  deviceController.deviceCommand
);



// Command management endpoints
router.post("/queue-command", deviceController.queueCommand);
router.get("/request-users", deviceController.requestUsers);
router.get("/request-attendance", deviceController.requestAttendance);
router.post("/user-info", deviceController.requestUserInfo);
router.post("/add-user", deviceController.addUser);
router.post("/sync-users", deviceController.syncUsersFromFile);
router.post('/attendance-log',deviceController.requestAttendance)
router.post('/check-users',deviceController.requestUsers)

// Data viewing endpoints
router.get("/commands/:sn", deviceController.getCommands);
router.get("/data", deviceController.getData);

// Fallback for unknown requests
router.all("*", deviceController.handleUnknownRequest);

export default router;