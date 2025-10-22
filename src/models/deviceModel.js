

class DeviceModel {
  constructor() {
    this.deviceCommands = new Map();
    this.deviceSeq = new Map();
  }

  nextCommandIdFor(sn) {
    const last = this.deviceSeq.get(sn) || 0;
    const next = last + 1;
    this.deviceSeq.set(sn, next);
    return next;
  }

  queueCommand(sn, commandText) {
    const id = this.nextCommandIdFor(sn);
    const now = new Date().toISOString();
    const cmd = { id, command: commandText, status: "pending", queuedAt: now };
    const arr = this.deviceCommands.get(sn) || [];
    arr.push(cmd);
    this.deviceCommands.set(sn, arr);
    console.log(`📋 Queued command for ${sn}: C:${id}:${commandText}`);
    return cmd;
  }

  getPendingCommands(sn) {
    const all = this.deviceCommands.get(sn) || [];
    return all.filter((c) => c.status === "pending");
  }

  markCommandsAsSent(sn, commands) {
    const all = this.deviceCommands.get(sn) || [];
    const now = new Date().toISOString();
    commands.forEach((c) => {
      c.status = "sent";
      c.sentAt = now;
    });
    this.deviceCommands.set(sn, all);
  }

  acknowledgeCommand(sn, cmdId, deviceAck) {
    const arr = this.deviceCommands.get(sn) || [];
    const idx = arr.findIndex((c) => c.id === cmdId);
    if (idx !== -1) {
      arr[idx].status = "done";
      arr[idx].doneAt = new Date().toISOString();
      arr[idx].deviceAck = deviceAck;
      arr.splice(idx, 1);
      if (arr.length === 0) {
        this.deviceCommands.delete(sn);
      } else {
        this.deviceCommands.set(sn, arr);
      }
      return true;
    }
    return false;
  }

  getCommands(sn) {
    return this.deviceCommands.get(sn) || [];
  }
}

export default new DeviceModel();