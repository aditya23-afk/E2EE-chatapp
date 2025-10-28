import React, { useState } from 'react';
import { useTheme } from './ThemeProvider';

const LoginModal = ({ onLogin, onRegister, isVisible }) => {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { theme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim() || !password.trim()) {
      setError('Username and password are required');
      return;
    }
    
    if (mode === 'register' && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (mode === 'login') {
        await onLogin(username.trim(), password);
      } else {
        await onRegister(username.trim(), password, email.trim() || null);
      }
    } catch (error) {
      setError(error.message || 'An error occurred');
    }
    
    setIsLoading(false);
  };

  const generateRandomUsername = () => {
    const adjectives = ['Cool', 'Smart', 'Fast', 'Bright', 'Happy', 'Swift', 'Bold', 'Calm', 'Zen', 'Epic'];
    const nouns = ['Tiger', 'Eagle', 'Shark', 'Wolf', 'Fox', 'Bear', 'Lion', 'Hawk', 'Dragon', 'Phoenix'];
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNum = Math.floor(Math.random() * 100);
    return `${randomAdj}${randomNoun}${randomNum}`;
  };

  if (!isVisible) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={(e) => {
        // LoginModal doesn't have onClose prop, so we can't close it by clicking backdrop
        // This is intentional as users must enter a username to proceed
      }}
    >
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '32px',
        maxWidth: '450px',
        width: '90%',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: '0 0 8px 0', color: '#333' }}>
            🔐 {mode === 'login' ? 'Welcome Back' : 'Join Secure Chat'}
          </h2>
          <p style={{ margin: 0, color: '#666' }}>
            {mode === 'login' ? 'Sign in to your account' : 'Create your secure chat account'}
          </p>
        </div>

        {/* Mode Toggle */}
        <div style={{ 
          display: 'flex', 
          background: '#f8f9fa', 
          borderRadius: '12px', 
          padding: '4px',
          marginBottom: '24px'
        }}>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
            }}
            style={{
              flex: 1,
              padding: '12px',
              background: mode === 'login' ? 'white' : 'transparent',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              color: mode === 'login' ? '#667eea' : '#666',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError('');
            }}
            style={{
              flex: 1,
              padding: '12px',
              background: mode === 'register' ? 'white' : 'transparent',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              color: mode === 'register' ? '#667eea' : '#666',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Sign Up
          </button>
        </div>
        
        {error && (
          <div style={{
            padding: '12px 16px',
            background: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#dc2626',
            fontSize: '14px',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              maxLength={20}
              disabled={isLoading}
              autoFocus
              style={{
                width: '100%',
                padding: '16px 20px',
                border: '2px solid #e0e0e0',
                borderRadius: '16px',
                fontSize: '16px',
                fontWeight: '500',
                outline: 'none',
                boxSizing: 'border-box',
                background: '#f8f9fa',
                color: '#333',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1), 0 8px 24px rgba(0, 0, 0, 0.1)';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.background = 'white';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e0e0e0';
                e.target.style.boxShadow = 'none';
                e.target.style.transform = 'translateY(0)';
                e.target.style.background = '#f8f9fa';
              }}
            />
          </div>

          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '16px 20px',
                border: '2px solid #e0e0e0',
                borderRadius: '16px',
                fontSize: '16px',
                fontWeight: '500',
                outline: 'none',
                boxSizing: 'border-box',
                background: '#f8f9fa',
                color: '#333',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1), 0 8px 24px rgba(0, 0, 0, 0.1)';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.background = 'white';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e0e0e0';
                e.target.style.boxShadow = 'none';
                e.target.style.transform = 'translateY(0)';
                e.target.style.background = '#f8f9fa';
              }}
            />
          </div>

          {mode === 'register' && (
            <>
              <div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '16px',
                    fontSize: '16px',
                    fontWeight: '500',
                    outline: 'none',
                    boxSizing: 'border-box',
                    background: '#f8f9fa',
                    color: '#333',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1), 0 8px 24px rgba(0, 0, 0, 0.1)';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.background = 'white';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e0e0e0';
                    e.target.style.boxShadow = 'none';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.background = '#f8f9fa';
                  }}
                />
              </div>
              
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email (optional)"
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '16px',
                    fontSize: '16px',
                    fontWeight: '500',
                    outline: 'none',
                    boxSizing: 'border-box',
                    background: '#f8f9fa',
                    color: '#333',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1), 0 8px 24px rgba(0, 0, 0, 0.1)';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.background = 'white';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e0e0e0';
                    e.target.style.boxShadow = 'none';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.background = '#f8f9fa';
                  }}
                />
              </div>
            </>
          )}

          {mode === 'login' && (
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setUsername(generateRandomUsername())}
                disabled={isLoading}
                style={{
                  padding: '16px 20px',
                  background: '#f8f9fa',
                  border: '2px solid #e0e0e0',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#333',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseOver={(e) => {
                  if (!isLoading) {
                    e.target.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                    e.target.style.borderColor = '#667eea';
                    e.target.style.color = 'white';
                    e.target.style.transform = 'translateY(-2px) scale(1.05)';
                    e.target.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.3)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isLoading) {
                    e.target.style.background = '#f8f9fa';
                    e.target.style.borderColor = '#e0e0e0';
                    e.target.style.color = '#333';
                    e.target.style.transform = 'translateY(0) scale(1)';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              >
                🎲 Random Username
              </button>
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={!username.trim() || isLoading}
            style={{
              padding: '16px 24px',
              background: isLoading || !username.trim() ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isLoading || !username.trim() ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Connecting...' : '🚀 Join Chat'}
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>💡 Your messages are encrypted end-to-end</p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;