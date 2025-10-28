import React, { useState } from 'react';

const RoomKeyModal = ({ isVisible, onClose, roomKey, isNewRoom = false }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyKey = async () => {
    try {
      await navigator.clipboard.writeText(roomKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = roomKey;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isVisible || !roomKey) return null;

  return (
    <div style={{
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
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        maxWidth: '450px',
        width: '90%',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '24px 32px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h2 style={{ margin: 0, fontSize: '20px' }}>
            {isNewRoom ? '🎉 Room Created!' : '🔐 Room Key'}
          </h2>
          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            ✕
          </button>
        </div>
        
        <div style={{ padding: '32px' }}>
          {isNewRoom ? (
            <div style={{
              textAlign: 'center',
              marginBottom: '24px',
              padding: '20px',
              background: '#f0f8ff',
              borderRadius: '12px'
            }}>
              <p style={{ margin: '0 0 8px 0', color: '#333' }}>Your private room has been created successfully!</p>
              <p style={{ margin: 0, color: '#666' }}>Share this key with others to invite them:</p>
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              marginBottom: '24px'
            }}>
              <p style={{ margin: 0, color: '#666' }}>Room key for Room #{roomKey}:</p>
            </div>
          )}
          
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '16px',
            padding: '24px',
            textAlign: 'center',
            marginBottom: '16px'
          }}>
            <div style={{
              fontSize: '28px',
              fontWeight: '700',
              color: 'white',
              letterSpacing: '4px',
              fontFamily: 'monospace',
              marginBottom: '16px'
            }}>
              {roomKey}
            </div>
            <button 
              onClick={handleCopyKey}
              style={{
                padding: '12px 20px',
                background: copied ? '#28a745' : 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                boxShadow: copied ? '0 4px 12px rgba(40, 167, 69, 0.3)' : '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}
              onMouseOver={(e) => {
                if (!copied) {
                  e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                  e.target.style.transform = 'translateY(-2px) scale(1.05)';
                  e.target.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.15)';
                }
              }}
              onMouseOut={(e) => {
                if (!copied) {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                }
              }}
            >
              {copied ? '✓ Copied!' : '📋 Copy'}
            </button>
          </div>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            marginBottom: '24px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              background: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <span style={{ fontSize: '20px' }}>📤</span>
              <span style={{ color: '#333' }}>Share this 6-digit key with friends</span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              background: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <span style={{ fontSize: '20px' }}>🔒</span>
              <span style={{ color: '#333' }}>Only users with this key can join</span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              background: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <span style={{ fontSize: '20px' }}>💬</span>
              <span style={{ color: '#333' }}>Messages in this room are private</span>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            style={{
              width: '100%',
              padding: '16px 24px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '16px',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px) scale(1.02)';
              e.target.style.boxShadow = '0 12px 32px rgba(102, 126, 234, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0) scale(1)';
              e.target.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.3)';
            }}
          >
            {isNewRoom ? '🚀 Start Chatting' : '✅ Done'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomKeyModal;