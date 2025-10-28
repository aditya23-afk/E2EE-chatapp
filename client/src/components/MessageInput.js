import React, { useState, useRef, useCallback } from 'react';

const MessageInput = ({ onSend, onTyping }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage('');
      handleStopTyping();
    }
  };

  const handleStartTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      onTyping?.(true);
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing after 2 seconds
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 2000);
  }, [isTyping, onTyping]);

  const handleStopTyping = useCallback(() => {
    if (isTyping) {
      setIsTyping(false);
      onTyping?.(false);
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [isTyping, onTyping]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    } else {
      handleStartTyping();
    }
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
    if (e.target.value.trim()) {
      handleStartTyping();
    } else {
      handleStopTyping();
    }
  };

  return (
    <div className="message-input">
      <input
        type="text"
        value={message}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        placeholder="Type your message... 💬"
        style={{
          flex: 1,
          padding: '16px 24px',
          border: '2px solid var(--theme-border)',
          borderRadius: '28px',
          fontSize: '15px',
          outline: 'none',
          transition: 'all 0.3s ease',
          background: 'var(--theme-background)',
          color: 'var(--theme-text)',
          fontWeight: '500'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'var(--theme-primary)';
          e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1), 0 8px 24px var(--theme-shadow)';
          e.target.style.transform = 'translateY(-2px)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'var(--theme-border)';
          e.target.style.boxShadow = 'none';
          e.target.style.transform = 'translateY(0)';
        }}
      />
      <button 
        onClick={handleSend}
        disabled={!message.trim()}
        style={{ 
          padding: '16px 28px',
          background: message.trim() ? 'var(--theme-gradient)' : '#ccc',
          color: 'white',
          border: 'none',
          borderRadius: '28px',
          cursor: message.trim() ? 'pointer' : 'not-allowed',
          fontWeight: '600',
          fontSize: '15px',
          transition: 'all 0.3s ease',
          boxShadow: message.trim() ? '0 8px 24px rgba(102, 126, 234, 0.3)' : 'none',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseOver={(e) => {
          if (message.trim()) {
            e.target.style.transform = 'translateY(-3px) scale(1.05)';
            e.target.style.boxShadow = '0 12px 32px rgba(102, 126, 234, 0.4)';
          }
        }}
        onMouseOut={(e) => {
          if (message.trim()) {
            e.target.style.transform = 'translateY(0) scale(1)';
            e.target.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.3)';
          }
        }}
      >
        {isTyping ? '✏️' : '📤'} Send
      </button>
    </div>
  );
};

export default MessageInput;