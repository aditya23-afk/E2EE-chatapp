const express = require('express');
const http = require('http');
const cors = require('cors');
const { initWebSocket } = require('./websocket');
const { initAuth, registerUser, loginUser, validateSession, logoutUser, getUserProfile, updateUserProfile } = require('./auth');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Initialize authentication system
initAuth();

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

// Initialize WebSocket server
initWebSocket(server);

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('WebSocket server is ready for connections');
  console.log('Authentication system is active');
});

module.exports = { app, server };