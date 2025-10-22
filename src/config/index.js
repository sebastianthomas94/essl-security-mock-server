const config = {
  port: process.env.PORT || 1337,
  endpoints: {
    devicePolling: "/iclock/getrequest.aspx",
    deviceData: "/iclock/cdata.aspx",
    deviceCommand: "/iclock/devicecmd.aspx",
    queueCommand: "/queue-command",
    requestUsers: "/request-users",
    requestAttendance: "/request-attendance",
    viewCommands: "/commands/:sn",
    viewData: "/data",
  },
};

export default config;