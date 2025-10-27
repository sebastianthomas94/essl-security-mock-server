import { ESSLServer } from "./index.js";
// Create ESSLServer instance with custom port and logging
const esslServer = new ESSLServer({
    port: 1337,
    logRequests: true,
    deviceSN: "JNP2253300426",
});
// ✨ TYPE-SAFE Event listeners for ESSL server events
// Now you get IntelliSense and autocomplete for event names and their data!
esslServer.on("server.started", (data) => {
    console.log(`🚀 Server started successfully on port ${data.port}`);
});
esslServer.on("user.deleted", (data) => {
    console.log("❌ User deleted from server:", data);
});
esslServer.on("attendace", (data) => {
    console.log("📋 Attendance recorded:", data);
    console.log("Device:", data.deviceSN);
});
esslServer.on("command.acknowledged", (data) => {
    // Full type information available
    console.log(`✅ Device acknowledged command ID ${data.commandId}: ${data.command} (Status: ${data.returnCode})`);
    if (data.command.includes("DELETE USERINFO")) {
        console.log("🎉 USER SUCCESSFULLY DELETED FROM PHYSICAL DEVICE!");
    }
});
esslServer.on("device.connected", (data) => {
    // console.log(`🔗 Device connected: ${data.deviceSN} at ${data.timestamp}`);
});
// ✨ Example: One-time listener with type safety
esslServer.once("server.started", (data) => {
    console.log(`🎉 Server initialization complete on port ${data.port}!`);
});
esslServer.on("fingerprint.added", (data) => {
    console.log("Fingerprint added event triggered", data);
});
esslServer.on("userInfo.changed", (data) => {
    console.log("User info changed event triggered", data);
});
esslServer.startServer(() => {
    console.log("🚀 ESSL Mock Server started on port 1337");
});
esslServer.on("user.info", (data) => {
    console.log("User info event triggered", data);
});
esslServer.on("fingerprint.info", (data) => {
    console.log("Fingerprint information", data);
});
// Add a user - will trigger 'user.added' event
// esslServer.addUser({
//   pin: "1001",
//   Name: "Alice Johnson ",
//   deviceSN: "JNP2253300426",
//   privilege: "0",
//   password: "12345",
// });
esslServer.on("query.users", (data) => {
    console.log(`🔍 Querying users from device ${data.deviceSN}`);
});
// esslServer.getUserByPin("1001");
// esslServer.deleteUser("9999");
// esslServer.deleteAllUsers();
// esslServer.updateUser("1001", { Name: "Updated Name" });
// esslServer.addAttendance({
//   PIN: "1001",
//   DateTime: new Date().toISOString(),
//   Status: "3",
//   SN: "JNP2253300426",
// });
// esslServer.queryAttendance();
// Connect and fetch data from device
esslServer.addUser({
    pin: "1002",
    Name: "Bob Smith",
    deviceSN: "JNP2253300426",
    privilege: "0",
    password: "67890",
});
//# sourceMappingURL=test.js.map