const express = require('express');
const http = require('http');

console.log('Starting server...');

try {
  const { initWebSocket } = require('./websocket');
  const { initAuth, registerUser, loginUser, validateSession, logoutUser, getUserProfile, updateUserProfile } = require('./auth');
  console.log('Modules loaded successfully');
} catch (error) {
  console.error('Error loading modules:', error);
  process.exit(1);
}

const { initWebSocket } = require('./websocket');
const { initAuth, registerUser, loginUser, validateSession, logoutUser, getUserProfile, updateUserProfile } = require('./auth');

const app = express();
const server = http.createServer(app);

// Manual CORS middleware (instead of cors package)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());

// Authentication routes
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password are required' });
    }
    
    const result = await registerUser(username, password, email);
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Register route error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password are required' });
    }
    
    const result = await loginUser(username, password);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(401).json(result);
    }
  } catch (error) {
    console.error('Login route error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.post('/api/validate-session', async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'Session ID is required' });
    }
    
    const result = await validateSession(sessionId);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(401).json(result);
    }
  } catch (error) {
    console.error('Validate session route error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.post('/api/logout', async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'Session ID is required' });
    }
    
    const result = await logoutUser(sessionId);
    res.status(200).json(result);
  } catch (error) {
    console.error('Logout route error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.get('/api/profile/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const result = await getUserProfile(username);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Get profile route error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.put('/api/profile/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const profileUpdates = req.body;
    
    const result = await updateUserProfile(username, profileUpdates);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Update profile route error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;

// Add error handling for server startup
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

try {
  // Initialize WebSocket server
  console.log('Initializing WebSocket server...');
  initWebSocket(server);
  console.log('WebSocket server initialized');

  // Initialize authentication system
  console.log('Initializing authentication system...');
  initAuth();
  console.log('Authentication system initialized');

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('WebSocket server is ready for connections');
    console.log('Authentication system is active');
  });
} catch (error) {
  console.error('Server startup error:', error);
  process.exit(1);
}

module.exports = { app, server };
