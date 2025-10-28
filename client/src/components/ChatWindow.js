import React, { useEffect, useRef } from 'react';
import UserAvatar from './UserAvatar';
import TypingIndicator from './TypingIndicator';
import { useTheme } from './ThemeProvider';

const ChatWindow = ({ messages, currentUser, typingUsers = [] }) => {
  const messagesEndRef = useRef(null);
  const { customSettings } = useTheme();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="chat-window">
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%', 
          color: '#6c757d',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>💬</div>
          <h3 style={{ marginBottom: '10px', color: '#495057' }}>Welcome to Secure Chat!</h3>
          <p>Start a conversation by sending a message below.</p>
          <p style={{ fontSize: '14px', marginTop: '10px', opacity: '0.7' }}>
            Messages are encrypted end-to-end for your privacy.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      {messages.map((msg, index) => (
        <div 
          key={index} 
          className={`message ${msg.isSelf ? 'self' : 'other'} ${msg.isPrivate ? 'private' : 'public'} ${customSettings.animations ? 'fade-in' : ''} ${customSettings.compactMode ? 'compact' : ''}`}
        >
          {!msg.isSelf && customSettings.showAvatars && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
              <UserAvatar username={msg.from} isOnline={true} size="small" />
              <div>
                <div className="message-header">
                  <strong>{msg.from}</strong>
                  {msg.isPrivate && <span className="private-indicator">🔒 Private</span>}
                  {!msg.isPrivate && <span className="public-indicator">📢 Public</span>}
                  {customSettings.showTimestamps && (
                    <span className="timestamp">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {msg.isSelf && (
            <div className="message-header">
              {customSettings.showTimestamps && (
                <span className="timestamp">{new Date(msg.timestamp).toLocaleTimeString()}</span>
              )}
              {msg.isPrivate && <span className="private-indicator">🔒 Private</span>}
              {!msg.isPrivate && <span className="public-indicator">📢 Public</span>}
              <strong>You</strong>
            </div>
          )}
          
          <div className="message-content">{msg.message}</div>
        </div>
      ))}
      
      {typingUsers.length > 0 && (
        <TypingIndicator users={typingUsers} />
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatWindow;