import React, { useState, useEffect } from 'react';

const RoomCreatedModal = ({ isVisible, onClose, roomKey, isNewRoom = false }) => {
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

  // ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isVisible) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscKey);
      return () => document.removeEventListener('keydown', handleEscKey);
    }
  }, [isVisible, onClose]);

  if (!isVisible || !roomKey) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        animation: 'fadeIn 0.3s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div style={{
        background: 'white',
        borderRadius: '24px',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 32px 64px rgba(0, 0, 0, 0.3)',
        overflow: 'hidden',
        animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}>
        {/* Header */}
        <div style={{
          padding: '32px 40px 24px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          textAlign: 'center',
          position: 'relative'
        }}>
          <button 
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.3)';
              e.target.style.transform = 'scale(1.1)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.2)';
              e.target.style.transform = 'scale(1)';
            }}
          >
            ✕
          </button>
          
          <div style={{
            fontSize: '48px',
            marginBottom: '16px',
            animation: 'bounce 1s infinite'
          }}>
            🎉
          </div>
          
          <h2 style={{
            margin: '0 0 8px 0',
            fontSize: '28px',
            fontWeight: '700'
          }}>
            {isNewRoom ? 'Room Created Successfully!' : 'Room Key'}
          </h2>
          
          <p style={{
            margin: 0,
            opacity: 0.9,
            fontSize: '16px'
          }}>
            {isNewRoom ? 'Your private room is ready to use!' : `Key for Room #${roomKey}`}
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: '40px' }}>
          {isNewRoom && (
            <div style={{
              textAlign: 'center',
              marginBottom: '32px',
              padding: '24px',
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              borderRadius: '16px',
              border: '1px solid #e0e0e0'
            }}>
              <h3 style={{
                margin: '0 0 12px 0',
                color: '#333',
                fontSize: '20px'
              }}>
                🎊 Congratulations!
              </h3>
              <p style={{
                margin: 0,
                color: '#666',
                lineHeight: '1.5'
              }}>
                Your private room has been created successfully. Share the key below to invite others to join your secure conversation.
              </p>
            </div>
          )}

          {/* Room Key Display */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{
              marginBottom: '12px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#333',
              textAlign: 'center'
            }}>
              Room Key
            </div>
            
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '20px',
              padding: '32px',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              marginBottom: '16px'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                animation: 'shimmer 3s infinite'
              }}></div>
              
              <div style={{
                fontSize: '36px',
                fontWeight: '700',
                color: 'white',
                letterSpacing: '8px',
                fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                position: 'relative',
                zIndex: 1
              }}>
                {roomKey}
              </div>
            </div>

            <button 
              onClick={handleCopyKey}
              style={{
                width: '100%',
                padding: '16px 24px',
                background: copied ? '#28a745' : '#f8f9fa',
                border: `2px solid ${copied ? '#28a745' : '#e0e0e0'}`,
                borderRadius: '16px',
                cursor: 'pointer',
                fontWeight: '600',
                color: copied ? 'white' : '#333',
                fontSize: '16px',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onMouseOver={(e) => {
                if (!copied) {
                  e.target.style.background = '#667eea';
                  e.target.style.borderColor = '#667eea';
                  e.target.style.color = 'white';
                  e.target.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseOut={(e) => {
                if (!copied) {
                  e.target.style.background = '#f8f9fa';
                  e.target.style.borderColor = '#e0e0e0';
                  e.target.style.color = '#333';
                  e.target.style.transform = 'translateY(0)';
                }
              }}
            >
              {copied ? (
                <>
                  <span>✓</span>
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <span>📋</span>
                  <span>Copy Room Key</span>
                </>
              )}
            </button>
          </div>

          {/* Instructions */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '16px',
            marginBottom: '32px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '20px',
              background: '#f8f9fa',
              borderRadius: '16px',
              border: '1px solid #e0e0e0',
              transition: 'all 0.3s ease'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px'
              }}>
                📤
              </div>
              <div>
                <div style={{ fontWeight: '600', color: '#333', marginBottom: '4px' }}>
                  Share Securely
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  Send this key to friends via secure channels
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '20px',
              background: '#f8f9fa',
              borderRadius: '16px',
              border: '1px solid #e0e0e0',
              transition: 'all 0.3s ease'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px'
              }}>
                🔒
              </div>
              <div>
                <div style={{ fontWeight: '600', color: '#333', marginBottom: '4px' }}>
                  Private Access
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  Only users with this key can join
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '20px',
              background: '#f8f9fa',
              borderRadius: '16px',
              border: '1px solid #e0e0e0',
              transition: 'all 0.3s ease'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px'
              }}>
                💬
              </div>
              <div>
                <div style={{ fontWeight: '600', color: '#333', marginBottom: '4px' }}>
                  Encrypted Messages
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  All conversations are end-to-end encrypted
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button 
            onClick={onClose}
            style={{
              width: '100%',
              padding: '18px 32px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '16px',
              color: 'white',
              fontSize: '18px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-3px) scale(1.02)';
              e.target.style.boxShadow = '0 12px 32px rgba(102, 126, 234, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0) scale(1)';
              e.target.style.boxShadow = 'none';
            }}
          >
            <span style={{ fontSize: '20px' }}>🚀</span>
            <span>{isNewRoom ? 'Start Chatting' : 'Done'}</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default RoomCreatedModal;