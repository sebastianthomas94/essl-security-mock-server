const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 1337;

// Middleware to parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Enable CORS for all routes
app.use(cors());

// Custom middleware to log all request information
app.use((req, res, next) => {
  console.log('\n' + '='.repeat(80));
  console.log(`📥 INCOMING REQUEST - ${new Date().toISOString()}`);
  console.log('='.repeat(80));
  
  // Basic request info
  console.log(`🔗 Method: ${req.method}`);
  console.log(`🌐 URL: ${req.url}`);
  console.log(`📍 Path: ${req.path}`);
  console.log(`🏠 Host: ${req.get('host')}`);
  console.log(`🔍 User-Agent: ${req.get('user-agent') || 'Not provided'}`);
  console.log(`📱 IP Address: ${req.ip || req.connection.remoteAddress}`);
  
  // Headers
  console.log('\n📋 HEADERS:');
  console.log('-'.repeat(40));
  Object.keys(req.headers).forEach(header => {
    console.log(`  ${header}: ${req.headers[header]}`);
  });
  
  // Query parameters
  if (Object.keys(req.query).length > 0) {
    console.log('\n🔍 QUERY PARAMETERS:');
    console.log('-'.repeat(40));
    Object.keys(req.query).forEach(param => {
      console.log(`  ${param}: ${req.query[param]}`);
    });
  } else {
    console.log('\n🔍 QUERY PARAMETERS: None');
  }
  
  // URL parameters (route params)
  if (Object.keys(req.params).length > 0) {
    console.log('\n🛣️  URL PARAMETERS:');
    console.log('-'.repeat(40));
    Object.keys(req.params).forEach(param => {
      console.log(`  ${param}: ${req.params[param]}`);
    });
  } else {
    console.log('\n🛣️  URL PARAMETERS: None');
  }
  
  // Request body
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('\n📦 REQUEST BODY:');
    console.log('-'.repeat(40));
    console.log(JSON.stringify(req.body, null, 2));
  } else {
    console.log('\n📦 REQUEST BODY: Empty or not JSON');
  }
  
  // Cookies
  if (req.headers.cookie) {
    console.log('\n🍪 COOKIES:');
    console.log('-'.repeat(40));
    console.log(`  ${req.headers.cookie}`);
  } else {
    console.log('\n🍪 COOKIES: None');
  }
  
  console.log('\n' + '='.repeat(80));
  
  next();
});

// Catch-all route for any HTTP method and path
app.all('*', (req, res) => {
  const response = {
    message: 'Request received and logged',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    headers: req.headers,
    query: req.query,
    params: req.params,
    body: req.body,
    ip: req.ip || req.connection.remoteAddress
  };
  
  console.log(`\n✅ RESPONSE SENT: ${JSON.stringify(response, null, 2)}\n`);
  
  res.status(200).json(response);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('\n❌ ERROR:');
  console.error('-'.repeat(40));
  console.error(err.stack);
  console.error('='.repeat(80));
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// Start the server
app.listen(PORT, () => {
  console.log('\n' + '🚀'.repeat(20));
  console.log(`🔥 ESSL Mock Server is running on port ${PORT}`);
  console.log(`📍 Server URL: http://localhost:${PORT}`);
  console.log(`📊 All request information will be logged to console`);
  console.log('🚀'.repeat(20) + '\n');
  
  console.log('💡 Try making requests to test the logging:');
  console.log(`   GET  http://localhost:${PORT}/test`);
  console.log(`   POST http://localhost:${PORT}/api/data`);
  console.log(`   Any method to any endpoint will be logged!\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n📴 Server shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n📴 Server shutting down gracefully...');
  process.exit(0);
});
