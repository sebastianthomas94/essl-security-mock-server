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

function createUserDataBuffer(userData: UserData): Buffer {
  // Standard user data packet size (72 bytes for most ESSL devices)
  // Some older devices use 28 bytes, adjust if needed
  const buffer = Buffer.alloc(72);
  buffer.fill(0); // Initialize with zeros

  let offset = 0;

  // 1. User ID / PIN (2 bytes, little endian, offset 0)
  const pin = parseInt(userData.pin);
  buffer.writeUInt16LE(pin, offset);
  offset += 2;

  // 2. Role/Privilege (1 byte, offset 2)
  // 0 = User, 2 = Administrator, 14 = Super Admin
  const privilege = parseInt(userData.privilege || "0");
  buffer.writeUInt8(privilege, offset);
  offset += 1;

  // 3. Password (8 bytes, offset 3, null-terminated ASCII)
  if (userData.password) {
    const password = userData.password.substring(0, 8);
    buffer.write(password, offset, 8, "ascii");
  }
  offset += 8;

  // 4. Name (24 bytes, offset 11, null-terminated UTF-8)
  if (userData.Name) {
    const name = userData.Name.substring(0, 24);
    buffer.write(name, offset, 24, "utf8");
  }
  offset += 24;

  // 5. Card Number (4 bytes, offset 35, little endian)
  if (userData.card) {
    const cardNum = parseInt(userData.card) || 0;
    buffer.writeUInt32LE(cardNum, offset);
  }
  offset += 4;

  // 6. Group (1 byte, offset 39)
  const group = parseInt(userData.group || "0");
  buffer.writeUInt8(group, offset);
  offset += 1;

  // 7. Timezone (2 bytes, offset 40, little endian)
  const timezone = parseInt(userData.timezone || "0");
  buffer.writeUInt16LE(timezone, offset);
  offset += 2;

  // 8. User ID (4 bytes, offset 42, little endian) - for newer firmware
  buffer.writeUInt32LE(pin, offset);
  offset += 4;

  return buffer;
}

// Alternative: Create user data in text format (less common, but some devices use this)
export function createUserDataString(userData: UserData): Buffer {
  // Use null terminators instead of tabs
  const userStr =
    `PIN=${userData.pin}\x00` +
    `Name=${userData.Name}\x00` +
    `Pri=${userData.privilege}\x00` +
    `Passwd=${userData.password || ""}\x00` +
    `Card=${userData.card || ""}\x00`;

  return Buffer.from(userStr, "ascii");
}
