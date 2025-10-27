/**
 * Command Manager
 * Handles device command queuing and tracking
 */
import type { Command } from "../../index.js";
export declare class CommandManager {
    private commands;
    private commandSeq;
    constructor();
    /**
     * Queue a command for device
     */
    queueCommand(deviceSN: string, commandText: string): Command;
    /**
     * Get pending commands for device
     */
    getPendingCommands(deviceSN: string): any[];
    /**
     * Mark commands as sent
     */
    markCommandsAsSent(deviceSN: string, commands: any[]): void;
    /**
     * Acknowledge command completion
     */
    acknowledgeCommand(deviceSN: string, commandId: string, returnCode: string): boolean;
    /**
     * Get next command ID for device
     */
    private getNextCommandId;
    /**
     * Get all commands for device
     */
    getCommands(deviceSN: string): Command[];
}
//# sourceMappingURL=CommandManager.d.ts.map