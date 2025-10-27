/**
 * Command Manager
 * Handles device command queuing and tracking
 */

import type { Command } from "../../index.js";

export class CommandManager {
  private commands: Map<string, any[]>;
  private commandSeq: Map<string, number>;

  constructor() {
    this.commands = new Map();
    this.commandSeq = new Map();
  }

  /**
   * Queue a command for device
   */
  queueCommand(deviceSN: string, commandText: string): Command {
    const id = this.getNextCommandId(deviceSN);
    const command: any = {
      id: id.toString(),
      type: "device_command",
      data: commandText,
      deviceSN,
      command: commandText,
      status: "pending",
      queuedAt: new Date(),
      timestamp: new Date(),
    };

    if (!this.commands.has(deviceSN)) {
      this.commands.set(deviceSN, []);
    }
    this.commands.get(deviceSN)!.push(command);

    return command;
  }

  /**
   * Get pending commands for device
   */
  getPendingCommands(deviceSN: string): any[] {
    const deviceCommands = this.commands.get(deviceSN) || [];
    return deviceCommands.filter((cmd) => cmd.status === "pending");
  }

  /**
   * Mark commands as sent
   */
  markCommandsAsSent(deviceSN: string, commands: any[]): void {
    commands.forEach((cmd) => {
      cmd.status = "sent";
      cmd.sentAt = new Date();
    });
  }

  /**
   * Acknowledge command completion
   */
  acknowledgeCommand(
    deviceSN: string,
    commandId: string,
    returnCode: string
  ): boolean {
    const deviceCommands = this.commands.get(deviceSN) || [];
    const cmdIndex = deviceCommands.findIndex((cmd) => cmd.id === commandId);

    if (cmdIndex !== -1) {
      deviceCommands[cmdIndex].status = "acknowledged";
      deviceCommands[cmdIndex].acknowledgedAt = new Date();
      deviceCommands[cmdIndex].returnCode = returnCode;
      return true;
    }

    return false;
  }

  /**
   * Get next command ID for device
   */
  private getNextCommandId(deviceSN: string): number {
    const current = this.commandSeq.get(deviceSN) || 0;
    const next = current + 1;
    this.commandSeq.set(deviceSN, next);
    return next;
  }

  /**
   * Get all commands for device
   */
  getCommands(deviceSN: string): Command[] {
    return this.commands.get(deviceSN) || [];
  }
}
