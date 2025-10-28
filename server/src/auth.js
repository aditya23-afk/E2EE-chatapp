const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

// User database file path
const USERS_DB_PATH = path.join(__dirname, '../data/users.json');
const SESSIONS_DB_PATH = path.join(__dirname, '../data/sessions.json');

// In-memory storage for active sessions
const activeSessions = new Map(); // sessionId -> { userId, username, loginTime }

// Ensure data directory exists
const ensureDataDirectory = async () => {
  const dataDir = path.dirname(USERS_DB_PATH);
  try {
    await fs.access(dataDir);
  } catch (error) {
    await fs.mkdir(dataDir, { recursive: true });
  }
};

// Load users from file
const loadUsers = async () => {
  try {
    await ensureDataDirectory();
    const data = await fs.readFile(USERS_DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist or is empty, return empty object
    return {};
  }
};

// Save users to file
const saveUsers = async (users) => {
  await ensureDataDirectory();
  await fs.writeFile(USERS_DB_PATH, JSON.stringify(users, null, 2));
};

// Load sessions from file
const loadSessions = async () => {
  try {
    await ensureDataDirectory();
    const data = await fs.readFile(SESSIONS_DB_PATH, 'utf8');
    const sessions = JSON.parse(data);
    
    // Load sessions into memory and clean expired ones
    const now = Date.now();
    const validSessions = {};
    
    for (const [sessionId, sessionData] of Object.entries(sessions)) {
      // Sessions expire after 30 days
      if (now - sessionData.loginTime < 30 * 24 * 60 * 60 * 1000) {
        activeSessions.set(sessionId, sessionData);
        validSessions[sessionId] = sessionData;
      }
    }
    
    // Save cleaned sessions back to file
    await fs.writeFile(SESSIONS_DB_PATH, JSON.stringify(validSessions, null, 2));
    
    return validSessions;
  } catch (error) {
    return {};
  }
};

// Save sessions to file
const saveSessions = async () => {
  await ensureDataDirectory();
  const sessionsObj = Object.fromEntries(activeSessions);
  await fs.writeFile(SESSIONS_DB_PATH, JSON.stringify(sessionsObj, null, 2));
};

// Hash password with salt
const hashPassword = (password, salt = null) => {
  if (!salt) {
    salt = crypto.randomBytes(16).toString('hex');
  }
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt };
};

// Verify password
const verifyPassword = (password, hash, salt) => {
  const { hash: newHash } = hashPassword(password, salt);
  return newHash === hash;
};

// Generate session ID
const generateSessionId = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Register new user
const registerUser = async (username, password, email = null) => {
  try {
    const users = await loadUsers();
    
    // Check if username already exists
    if (users[username.toLowerCase()]) {
      return { success: false, error: 'Username already exists' };
    }
    
    // Validate username
    if (!username || username.length < 3 || username.length > 20) {
      return { success: false, error: 'Username must be 3-20 characters long' };
    }
    
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return { success: false, error: 'Username can only contain letters, numbers, underscore, and dash' };
    }
    
    // Validate password
    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long' };
    }
    
    // Hash password
    const { hash, salt } = hashPassword(password);
    
    // Create user record
    const userRecord = {
      username: username,
      passwordHash: hash,
      passwordSalt: salt,
      email: email,
      createdAt: new Date().toISOString(),
      lastLogin: null,
      profile: {
        avatar: null,
        bio: '',
        status: 'Available'
      }
    };
    
    // Save user
    users[username.toLowerCase()] = userRecord;
    await saveUsers(users);
    
    console.log(`User registered: ${username}`);
    return { success: true, message: 'User registered successfully' };
    
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: 'Registration failed' };
  }
};

// Login user
const loginUser = async (username, password) => {
  try {
    const users = await loadUsers();
    const userRecord = users[username.toLowerCase()];
    
    if (!userRecord) {
      return { success: false, error: 'Invalid username or password' };
    }
    
    // Verify password
    if (!verifyPassword(password, userRecord.passwordHash, userRecord.passwordSalt)) {
      return { success: false, error: 'Invalid username or password' };
    }
    
    // Generate session
    const sessionId = generateSessionId();
    const sessionData = {
      userId: username.toLowerCase(),
      username: userRecord.username,
      loginTime: Date.now()
    };
    
    // Store session
    activeSessions.set(sessionId, sessionData);
    await saveSessions();
    
    // Update last login
    userRecord.lastLogin = new Date().toISOString();
    users[username.toLowerCase()] = userRecord;
    await saveUsers(users);
    
    console.log(`User logged in: ${username}`);
    return { 
      success: true, 
      sessionId: sessionId,
      username: userRecord.username,
      profile: userRecord.profile
    };
    
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Login failed' };
  }
};

// Validate session
const validateSession = async (sessionId) => {
  try {
    const sessionData = activeSessions.get(sessionId);
    
    if (!sessionData) {
      return { success: false, error: 'Invalid session' };
    }
    
    // Check if session is expired (30 days)
    const now = Date.now();
    if (now - sessionData.loginTime > 30 * 24 * 60 * 60 * 1000) {
      activeSessions.delete(sessionId);
      await saveSessions();
      return { success: false, error: 'Session expired' };
    }
    
    return { 
      success: true, 
      userId: sessionData.userId,
      username: sessionData.username 
    };
    
  } catch (error) {
    console.error('Session validation error:', error);
    return { success: false, error: 'Session validation failed' };
  }
};

// Logout user
const logoutUser = async (sessionId) => {
  try {
    const sessionData = activeSessions.get(sessionId);
    if (sessionData) {
      console.log(`User logged out: ${sessionData.username}`);
    }
    
    activeSessions.delete(sessionId);
    await saveSessions();
    
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: 'Logout failed' };
  }
};

// Get user profile
const getUserProfile = async (username) => {
  try {
    const users = await loadUsers();
    const userRecord = users[username.toLowerCase()];
    
    if (!userRecord) {
      return { success: false, error: 'User not found' };
    }
    
    return {
      success: true,
      profile: {
        username: userRecord.username,
        email: userRecord.email,
        createdAt: userRecord.createdAt,
        lastLogin: userRecord.lastLogin,
        ...userRecord.profile
      }
    };
  } catch (error) {
    console.error('Get profile error:', error);
    return { success: false, error: 'Failed to get profile' };
  }
};

// Update user profile
const updateUserProfile = async (username, profileUpdates) => {
  try {
    const users = await loadUsers();
    const userRecord = users[username.toLowerCase()];
    
    if (!userRecord) {
      return { success: false, error: 'User not found' };
    }
    
    // Update profile fields
    userRecord.profile = {
      ...userRecord.profile,
      ...profileUpdates
    };
    
    users[username.toLowerCase()] = userRecord;
    await saveUsers(users);
    
    return { success: true, profile: userRecord.profile };
  } catch (error) {
    console.error('Update profile error:', error);
    return { success: false, error: 'Failed to update profile' };
  }
};

// Initialize auth system
const initAuth = async () => {
  try {
    await loadSessions();
    console.log('Authentication system initialized');
  } catch (error) {
    console.error('Auth initialization error:', error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  validateSession,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  initAuth
};