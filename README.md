# ESSL Mock Server

A simple Express.js server that logs all incoming request information to the console for debugging and testing purposes.

## Features

- 📋 Logs all request headers
- 📦 Displays request body (JSON, XML, and form data)
- 🔍 Shows query parameters
- 🛣️ Displays URL parameters
- 🍪 Shows cookies
- 📱 Logs client IP address
- 🌐 Works with any HTTP method (GET, POST, PUT, DELETE, etc.)
- 🗂️ Supports multiple content types (JSON, XML, form-encoded)
- ✨ Pretty formatted console output with emojis

## Installation

1. Install dependencies:
```bash
npm install
```

## Usage

### Development Mode (with auto-restart)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on port 3000 by default. You can change this by setting the `PORT` environment variable.

## Testing

You can test the server by making requests to any endpoint:

```bash
# GET request
curl http://localhost:3000/test

# POST request with JSON data
curl -X POST http://localhost:3000/api/data \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "age": 30}'

# POST request with XML data
curl -X POST http://localhost:3000/api/data \
  -H "Content-Type: application/xml" \
  -d '<?xml version="1.0"?><user><name>John</name><age>30</age></user>'

# GET request with query parameters
curl "http://localhost:3000/search?q=test&page=1"
```

## Example Console Output

```
================================================================================
📥 INCOMING REQUEST - 2025-10-10T12:00:00.000Z
================================================================================
🔗 Method: POST
🌐 URL: /api/users
📍 Path: /api/users
🏠 Host: localhost:3000
🔍 User-Agent: curl/7.68.0
📱 IP Address: ::1

📋 HEADERS:
----------------------------------------
  host: localhost:3000
  user-agent: curl/7.68.0
  accept: */*
  content-type: application/json
  content-length: 27

🔍 QUERY PARAMETERS: None

🛣️  URL PARAMETERS: None

📦 REQUEST BODY:
----------------------------------------
{
  "name": "John",
  "age": 30
}

🍪 COOKIES: None

================================================================================
```

## Environment Variables

- `PORT`: Server port (default: 3000)

## License

ISC
