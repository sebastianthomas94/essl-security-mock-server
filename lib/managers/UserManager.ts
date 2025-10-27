/**
 * UserManager - Handles all user-related operations
 * NO LOCAL STORAGE - users exist only on devices
 */

import type {
  UserData,
  Command,
  ServerResponse,
} from "../../types/interfaces.js";
import type { CommandManager } from "./CommandManager.js";
import type { DataParser } from "../utils/DataParser.js";
import type { EventManager } from "../utils/EventManager.js";

export class UserManager {
  constructor(
    private commandManager: CommandManager,
    private dataParser: DataParser,
    private eventManager: EventManager,
    private defaultDeviceSN: string,
    private logRequests: boolean
  ) {}

  /**
   * Add a user to device
   * NO LOCAL STORAGE - user exists only on device
   */
  addUser(userData: Partial<UserData> & { pin: string }): ServerResponse {
    const pin = userData.pin;
    if (!pin) {
      throw new Error("pin is required for user");
    }

    const user: UserData & { deviceSN: string } = {
      PIN: pin,
      Name: userData.Name || userData.name || "",
      Passwd: userData.Passwd || userData.password || "",
      Card: userData.Card || userData.card || "",
      Grp: userData.Grp || userData.group || "1",
      TZ: userData.TZ || userData.timezone || "1",
      Pri: userData.Pri || userData.privilege || "0",
      deviceSN: userData.deviceSN || "DEFAULT",
    };

    const command = this.commandManager.queueCommand(
      this.defaultDeviceSN,
      `DATA UPDATE USERINFO ${this.dataParser.formatUserForDevice(user)}`
    );
    this.commandManager.queueCommand(
      this.defaultDeviceSN,
      "DATA QUERY USERINFO"
    );

    if (this.logRequests) {
      console.log(
        `👤 User ${user.Name} (PIN: ${user.PIN}) added to device ${user.deviceSN} - stored on device only`
      );
    }

    return { success: true, data: { user, command } };
  }

  addUsers(
    usersData: Array<Partial<UserData> & { pin: string }>,
    defaultDeviceSN: string = "DEFAULT"
  ): ServerResponse {
    try {
      const addedUsers: Array<UserData & { deviceSN: string }> = [];
      const commands: Command[] = [];
      const deviceCommands: Record<string, Command[]> = {};

      // Process each user (no local storage)
      usersData.forEach((userData) => {
        const user: UserData & { deviceSN: string } = {
          PIN: userData.pin,
          Name: userData.Name || userData.name || "",
          Passwd: userData.Passwd || userData.password || "",
          Card: userData.Card || userData.card || "",
          Grp: userData.Grp || userData.group || "1",
          TZ: userData.TZ || userData.timezone || "1",
          Pri: userData.Pri || userData.privilege || "0",
          deviceSN: userData.deviceSN || defaultDeviceSN,
        };

        addedUsers.push(user);

        // Queue command for device
        const command = this.commandManager.queueCommand(
          this.defaultDeviceSN,
          `DATA UPDATE USERINFO ${this.dataParser.formatUserForDevice(user)}`
        );
        commands.push(command);

        if (!deviceCommands[user.deviceSN]) {
          deviceCommands[user.deviceSN] = [];
        }
        deviceCommands[user.deviceSN].push(command);
      });

      this.commandManager.queueCommand(
        this.defaultDeviceSN,
        "DATA QUERY USERINFO"
      );

      if (this.logRequests) {
        console.log(
          `👥 ${addedUsers.length} users added to devices - stored on devices only`
        );
      }

      return {
        success: true,
        data: {
          users: addedUsers,
          commands: deviceCommands,
          count: addedUsers.length,
        },
      };
    } catch (error: any) {
      if (this.logRequests) {
        console.error(`❌ Failed to add users: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get user by PIN - NO LOCAL STORAGE
   * Users exist only on device, this would query device directly
   */
  getUserByPin(pin: string, deviceSN: string = "DEFAULT"): UserData | null {
    this.commandManager.queueCommand(
      this.defaultDeviceSN,
      `DATA QUERY USERINFO PIN=${pin}`
    );
    console.log(
      `Query user PIN ${pin} from device ${deviceSN} - no local storage`
    );

    return null;
  }

  getUsers(deviceSN: string = "DEFAULT"): UserData[] {
    this.commandManager.queueCommand(
      this.defaultDeviceSN,
      `DATA QUERY USERINFO *`
    );
    console.log(`Query all users from device ${deviceSN} `);

    return [];
  }

  /**
   * Update user - NO LOCAL STORAGE
   * Updates user directly on device
   */
  updateUser(
    pin: string,
    updateData: Partial<UserData>,
    deviceSN: string = "DEFAULT"
  ): ServerResponse {
    // Create updated user object (no local storage)
    const user: UserData & { deviceSN: string } = {
      PIN: pin,
      Name: updateData.Name || "",
      Passwd: updateData.Passwd || "",
      Card: updateData.Card || "",
      Grp: updateData.Grp || "1",
      TZ: updateData.TZ || "1",
      Pri: updateData.Pri || "0",
      deviceSN: deviceSN,
    };

    const command = this.commandManager.queueCommand(
      this.defaultDeviceSN,
      `C:${pin}:DATA UPDATE USERINFO  PIN=${pin}\tName=${updateData.Name}`
    );

    if (this.logRequests) {
      console.log(
        `👤 User PIN ${pin} updated on device ${deviceSN} - no local storage`
      );
    }

    return { success: true, data: { user, command } };
  }

  /**
   * Delete user - NO LOCAL STORAGE
   * Deletes user directly from device
   */
  deleteUser(pin: string): ServerResponse {
    const command = this.commandManager.queueCommand(
      this.defaultDeviceSN,
      `DATA DELETE USERINFO PIN=${pin}`
    );
    this.commandManager.queueCommand(
      this.defaultDeviceSN,
      "DATA QUERY USERINFO"
    );

    return { success: true, data: { deletedPin: pin, command } };
  }

  /**
   * Delete all users from a specific device - NO LOCAL STORAGE
   */
  deleteAllUsers(): ServerResponse {
    // Queue command to clear all users on the device
    const command = this.commandManager.queueCommand(
      this.defaultDeviceSN,
      "DATA DELETE USERINFO"
    );

    this.commandManager.queueCommand(
      this.defaultDeviceSN,
      "DATA QUERY USERINFO"
    );
    if (this.logRequests) {
      console.log(
        `👥 All users deleted from device ${this.defaultDeviceSN} - no local storage`
      );
    }

    return {
      success: true,
      data: { deviceSN: this.defaultDeviceSN, command },
    };
  }

  /**
   * Delete all users from all devices - NO LOCAL STORAGE
   */
  deleteAllUsersFromAllDevices(deviceSN: string): ServerResponse {
    // This would need a list of known devices in a real implementation
    // For now, just delete from DEFAULT device
    const command = this.commandManager.queueCommand(
      deviceSN,
      "DATA DELETE USERINFO"
    );

    this.eventManager.emit("users.allDeletedFromAllDevices", { command });

    if (this.logRequests) {
      console.log(
        `👥 Delete all users command sent to all devices - no local storage`
      );
    }

    return {
      success: true,
      data: { command },
    };
  }

  /**
   * Get user management summary - NO LOCAL STORAGE
   */
  getUsersSummary(): ServerResponse {
    return {
      success: true,
      data: {
        message: "No local user storage - users exist only on devices",
        totalUsers: 0, // No local storage
        devices: {}, // No local tracking
      },
    };
  }
}
