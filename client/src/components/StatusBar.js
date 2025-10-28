import React from 'react';
import { useTheme } from './ThemeProvider';

const StatusBar = ({ isConnected, userCount, currentRoom, isTyping }) => {
  const { theme } = useTheme();

  return (
    <div className="status-bar">
      <div className="status-left">
        <div className={`connection-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
          <div className="connection-dot"></div>
          <span>{isConnected ? 'Connected' : 'Connecting...'}</span>
        </div>
        
        {userCount > 0 && (
          <div className="user-count">
            <span className="count-icon">👥</span>
            <span>{userCount} online</span>
          </div>
        )}
      </div>

      <div className="status-center">
        {currentRoom && (
          <div className="current-room">
            <span className="room-icon">🔐</span>
            <span>Room #{currentRoom}</span>
          </div>
        )}
        
        {isTyping && (
          <div className="typing-status">
            <div className="typing-animation">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
            <span>Typing...</span>
          </div>
        )}
      </div>

      <div className="status-right">
        <div className="encryption-status">
          <span className="encryption-icon">🔒</span>
          <span>E2E Encrypted</span>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;