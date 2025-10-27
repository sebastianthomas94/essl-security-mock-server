# eSSL Node SDK

A clean, modular SDK for eSSL/ZKTeco device communication with in-memory data management and event-driven architecture.

## Features

- 🚀 **Simple API**: `const device = new ESSLServer(options)`
- 💾 **In-memory storage**: No JSON files, direct response returns
- 🎯 **Event-driven**: Real-time event notifications
- 🏗️ **Modular architecture**: Clean, organized code structure
- 👥 **User management**: Add, update, delete, query users
- 📅 **Attendance tracking**: Real-time attendance data
- 🔧 **Command management**: Device command queuing and tracking
- 🌐 **Flexible deployment**: Bring your own server setup

## Installation

```bash
npm install ess-node-sdk
```

## Quick Start

```javascript
import express from 'express';
import cors from 'cors';
import xmlParser from 'express-xml-bodyparser';
import { ESSLServer } from 'ess-node-sdk';

// Create your own Express app
const app = express();

// Setup your middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text());
app.use(xmlParser());

// Create ESSLServer and setup routes
const device = new ESSLServer();
device.setupRoutes(app);

// Start your server
const server = app.listen(3000, () => {
  console.log('eSSL Server running on port 3000');
});

// Add event listeners
device.on('user.added', (data) => {
  console.log('User added:', data.user.Name);
});

device.on('attendance.added', (data) => {
  console.log('Attendance recorded:', data.attendance);
});

// Add a user
const result = device.addUser({
  name: 'John Doe',
  pin: '123',
  deviceSN: 'DEVICE001',
  privilege: 1
});

// Query attendance
const attendance = device.queryAttendance('DEVICE001', {
  pin: '123',
  startDate: '2024-01-01'
});
```

## API Reference

### Constructor

```javascript
const device = new ESSLServer();
```

The `ESSLServer` constructor no longer takes configuration options. You configure your Express app yourself.

### Setup Routes

#### setupRoutes(app)

Setup eSSL device routes on an existing Express application.

```javascript
import express from 'express';
import cors from 'cors';
import xmlParser from 'express-xml-bodyparser';
import { ESSLServer } from 'ess-node-sdk';

// Create and configure your Express app
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text());
app.use(xmlParser());

// Create ESSLServer and setup routes
const device = new ESSLServer();
device.setupRoutes(app);

// Start your server
const server = app.listen(3000);
```

### Integration Examples

#### With Custom Routes

```javascript
const app = express();

// Your middleware and routes
app.use(cors());
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Setup eSSL routes
const device = new ESSLServer();
device.setupRoutes(app);

app.listen(3000);
```

#### Multiple Devices

```javascript
const app = express();
const deviceA = new ESSLServer();
const deviceB = new ESSLServer();

// Create separate routers for different devices
const routerA = express.Router();
const routerB = express.Router();

deviceA.setupRoutes(routerA);
deviceB.setupRoutes(routerB);

app.use('/device-a', routerA);
app.use('/device-b', routerB);
```

### User Management

#### addUser(userData)

Add a new user to the device.

```javascript
const result = device.addUser({
  name: 'User Name',       // Required
  pin: '123',             // Required
  deviceSN: 'DEVICE001',  // Optional (default: 'DEFAULT')
  privilege: 1,           // Optional (default: 0)
  password: '',           // Optional
  card: '',              // Optional
  fingerprint: ''        // Optional
});
```

#### getUserByPin(pin, deviceSN)

Get user by PIN number.

```javascript
const user = device.getUserByPin('123', 'DEVICE001');
```

#### updateUser(pin, updateData, deviceSN)

Update existing user.

```javascript
const result = device.updateUser('123', {
  name: 'Updated Name',
  privilege: 2
}, 'DEVICE001');
```

#### deleteUser(pin, deviceSN)

Delete user from device.

```javascript
const result = device.deleteUser('123', 'DEVICE001');
```

#### getUsers(deviceSN)

Get all users for a device.

```javascript
const users = device.getUsers('DEVICE001');
```

### Attendance Management

#### queryAttendance(deviceSN, filters)

Query attendance records with optional filters.

```javascript
const attendance = device.queryAttendance('DEVICE001', {
  pin: '123',                    // Optional: specific user
  startDate: '2024-01-01',      // Optional: start date
  endDate: '2024-01-31'         // Optional: end date
});
```

#### addAttendance(attendanceData)

Manually add attendance record.

```javascript
const result = device.addAttendance({
  pin: '123',
  deviceSN: 'DEVICE001',
  timestamp: new Date(),
  verifyMode: '1',
  inOutMode: '0'
});
```

### Server Control

#### start()

Start the server.

```javascript
const result = await device.start();
```

#### stop()

Stop the server.

```javascript
const result = await device.stop();
```

## Events

✨ **NEW: Type-Safe Events!** All events are now fully type-safe with TypeScript. Your IDE will autocomplete event names and show you the exact data structure for each event.

See the complete [Events Reference Guide](./EVENTS.md) for all available events and their data structures.

The SDK emits various events for real-time monitoring:

```typescript
// Server events - FULLY TYPE-SAFE!
device.on('server.started', (data) => {
  // TypeScript knows 'data' has a 'port' property
  console.log(`Server started on port ${data.port}`);
});

device.on('server.stopped', () => {
  console.log('Server stopped');
});

// Device events
device.on('device.connected', (data) => {
  // TypeScript knows: data.deviceSN, data.timestamp
  console.log(`Device ${data.deviceSN} connected`);
});

// User events with full type information
device.on('user.added', (data) => {
  // TypeScript knows: data.user, data.command, data.deviceSN
  console.log(`User ${data.user.Name} added to ${data.deviceSN}`);
});

device.on('user.updated', (data) => {
  console.log(`User ${data.user.PIN} updated`);
});

device.on('user.deleted', (data) => {
  console.log(`User deleted from ${data.deviceSN}`);
});

// Attendance events
device.on('attendance.added', (data) => {
  // TypeScript knows: data.attendance, data.deviceSN
  console.log(`Attendance: ${data.attendance.PIN} at ${data.attendance.DateTime}`);
});

// Command events
device.on('command.acknowledged', (data) => {
  // TypeScript knows: data.commandId, data.command, data.returnCode, data.deviceSN
  console.log(`Command ${data.commandId} acknowledged with code ${data.returnCode}`);
});
```

### Available Events

- `server.started` - Server successfully started
- `server.stopped` - Server stopped
- `device.connected` - Device connected to server
- `device.command.sent` - Command sent to device
- `user.added` - Single user added
- `users.added` - Multiple users added in bulk
- `user.updated` - User information updated
- `user.deleted` - User deleted
- `users.allDeleted` - All users deleted from a device
- `users.allDeletedFromAllDevices` - All users deleted from all devices
- `users.synced` - Users synced from device
- `command.acknowledged` - Device acknowledged a command
- `attendance.added` - Attendance record received

📖 **For complete details, data structures, and examples, see [EVENTS.md](./EVENTS.md)**

## Project Structure

```
├── index.js                    # Main SDK entry point
├── lib/
│   ├── server/
│   │   └── ServerSetup.js     # Express server setup
│   ├── managers/
│   │   ├── UserManager.js     # User CRUD operations
│   │   ├── AttendanceManager.js # Attendance management
│   │   └── CommandManager.js  # Command queuing
│   ├── handlers/
│   │   └── DeviceHandler.js   # Device communication
│   └── utils/
│       └── DataParser.js      # Data parsing utilities
├── test.js                     # Test suite
└── package.json
```

## Testing

```bash
npm test
```

## License

ISC
