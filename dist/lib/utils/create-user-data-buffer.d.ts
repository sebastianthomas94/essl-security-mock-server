interface UserData {
    pin: string;
    Name: string;
    deviceSN: string;
    privilege: string;
    password: string;
    card?: string;
    group?: string;
    timezone?: string;
}
export declare function createUserDataString(userData: UserData): Buffer;
export {};
//# sourceMappingURL=create-user-data-buffer.d.ts.map