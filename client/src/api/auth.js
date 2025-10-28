const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://e2ee-chatapp.onrender.com/api'  // Your live server URL
  : 'http://localhost:3001/api';

class AuthClient {
  constructor() {
    this.sessionId = localStorage.getItem('chatSessionId');
  }

  async register(username, password, email = null) {
    try {
      console.log('Attempting registration to:', `${API_BASE_URL}/register`);
      console.log('NODE_ENV:', process.env.NODE_ENV);
      
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, email }),
      });

      console.log('Registration response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Registration result:', result);
      return result;
    } catch (error) {
      console.error('Registration error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      return { success: false, error: `Network error: ${error.message}` };
    }
  }

  async login(username, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Store session ID
        this.sessionId = result.sessionId;
        localStorage.setItem('chatSessionId', result.sessionId);
        localStorage.setItem('chatUsername', result.username);
      }
      
      return result;
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error during login' };
    }
  }

  async validateSession() {
    if (!this.sessionId) {
      return { success: false, error: 'No session found' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/validate-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId: this.sessionId }),
      });

      const result = await response.json();
      
      if (!result.success) {
        // Clear invalid session
        this.clearSession();
      }
      
      return result;
    } catch (error) {
      console.error('Session validation error:', error);
      return { success: false, error: 'Network error during session validation' };
    }
  }

  async logout() {
    if (!this.sessionId) {
      return { success: true };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId: this.sessionId }),
      });

      const result = await response.json();
      this.clearSession();
      return result;
    } catch (error) {
      console.error('Logout error:', error);
      this.clearSession();
      return { success: false, error: 'Network error during logout' };
    }
  }

  clearSession() {
    this.sessionId = null;
    localStorage.removeItem('chatSessionId');
    localStorage.removeItem('chatUsername');
  }

  getSessionId() {
    return this.sessionId;
  }

  isLoggedIn() {
    return !!this.sessionId;
  }

  async getUserProfile(username) {
    try {
      const response = await fetch(`${API_BASE_URL}/profile/${username}`);
      return await response.json();
    } catch (error) {
      console.error('Get profile error:', error);
      return { success: false, error: 'Network error' };
    }
  }

  async updateUserProfile(username, profileUpdates) {
    try {
      const response = await fetch(`${API_BASE_URL}/profile/${username}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileUpdates),
      });

      return await response.json();
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: 'Network error' };
    }
  }
}

export default AuthClient;
