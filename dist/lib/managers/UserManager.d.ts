/**
 * UserManager - Handles all user-related operations
 * NO LOCAL STORAGE - users exist only on devices
 */
import type { UserData, ServerResponse } from "../../types/interfaces.js";
import type { CommandManager } from "./CommandManager.js";
import type { DataParser } from "../utils/DataParser.js";
import type { EventManager } from "../utils/EventManager.js";
export declare class UserManager {
    private commandManager;
    private dataParser;
    private eventManager;
    private defaultDeviceSN;
    private logRequests;
    constructor(commandManager: CommandManager, dataParser: DataParser, eventManager: EventManager, defaultDeviceSN: string, logRequests: boolean);
    /**
     * Add a user to device
     * NO LOCAL STORAGE - user exists only on device
     */
    addUser(userData: Partial<UserData> & {
        pin: string;
    }): ServerResponse;
    addUsers(usersData: Array<Partial<UserData> & {
        pin: string;
    }>, defaultDeviceSN?: string): ServerResponse;
    /**
     * Get user by PIN - NO LOCAL STORAGE
     * Users exist only on device, this would query device directly
     */
    getUserByPin(pin: string, deviceSN?: string): UserData | null;
    getUsers(deviceSN?: string): UserData[];
    /**
     * Update user - NO LOCAL STORAGE
     * Updates user directly on device
     */
    updateUser(pin: string, updateData: Partial<UserData>, deviceSN?: string): ServerResponse;
    /**
     * Delete user - NO LOCAL STORAGE
     * Deletes user directly from device
     */
    deleteUser(pin: string): ServerResponse;
    /**
     * Delete all users from a specific device - NO LOCAL STORAGE
     */
    deleteAllUsers(): ServerResponse;
    /**
     * Delete all users from all devices - NO LOCAL STORAGE
     */
    deleteAllUsersFromAllDevices(deviceSN: string): ServerResponse;
    /**
     * Get user management summary - NO LOCAL STORAGE
     */
    getUsersSummary(): ServerResponse;
}
//# sourceMappingURL=UserManager.d.ts.map