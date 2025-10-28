import React, { useState, useEffect } from 'react';
import { useTheme } from './ThemeProvider';

const PrivateRoomModal = ({ isVisible, onClose, onJoinRoom, onCreateRoom }) => {
  const [roomKey, setRoomKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('join');
  const { theme } = useTheme();

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!roomKey.trim()) {
      console.error('Room key is empty');
      return;
    }
    if (roomKey.length !== 6) {
      console.error('Room key must be exactly 6 digits, got:', roomKey.length);
      return;
    }
    if (!/^\d{6}$/.test(roomKey)) {
      console.error('Room key must contain only digits, got:', roomKey);
      return;
    }
    
    setIsLoading(true);
    console.log('Joining room with key:', roomKey, 'Length:', roomKey.length);
    onJoinRoom(roomKey);
    setTimeout(() => {
      setIsLoading(false);
      console.log('Join room timeout, closing modal');
      handleClose();
    }, 5000);
  };

  const handleCreateRoom = () => {
    setIsLoading(true);
    const newRoomKey = generateRoomKey();
    console.log('Creating room with key:', newRoomKey);
    onCreateRoom(newRoomKey);
    setTimeout(() => {
      setIsLoading(false);
      console.log('Create room timeout, closing modal');
      handleClose();
    }, 3000);
  };

  const generateRoomKey = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleClose = () => {
    setRoomKey('');
    setActiveTab('join');
    onClose();
  };

  const handleKeyInput = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setRoomKey(value);
  };

  // ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isVisible) {
        handleClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscKey);
      return () => document.removeEventListener('keydown', handleEscKey);
    }
  }, [isVisible]);

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
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div style={{
        background: 'white',
        borderRadius: '20px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 32px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              🔐
            </div>
            <div>
              <h2 style={{ margin: '0 0 4px 0', fontSize: '20px' }}>Private Chat Room</h2>
              <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>Create or join a secure private room</p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: '#f8f9fa', borderBottom: '1px solid #e0e0e0' }}>
          <button 
            onClick={() => setActiveTab('join')}
            style={{
              flex: 1,
              padding: '16px 20px',
              background: activeTab === 'join' ? 'white' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              color: activeTab === 'join' ? '#667eea' : '#666',
              borderBottom: activeTab === 'join' ? '3px solid #667eea' : 'none'
            }}
          >
            👥 Join Room
          </button>
          <button 
            onClick={() => setActiveTab('create')}
            style={{
              flex: 1,
              padding: '16px 20px',
              background: activeTab === 'create' ? 'white' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              color: activeTab === 'create' ? '#667eea' : '#666',
              borderBottom: activeTab === 'create' ? '3px solid #667eea' : 'none'
            }}
          >
            ➕ Create Room
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '32px' }}>
          {activeTab === 'join' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>Join Private Room</h3>
                <p style={{ margin: 0, color: '#666' }}>Enter a 6-digit room key to join an existing private chat room</p>
              </div>
              
              <form onSubmit={handleJoinRoom} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>Room Key</label>
                  <input
                    type="text"
                    value={roomKey}
                    onChange={handleKeyInput}
                    placeholder="000000"
                    maxLength={6}
                    disabled={isLoading}
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '20px 24px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '16px',
                      fontSize: '28px',
                      fontWeight: '700',
                      fontFamily: 'SF Mono, Monaco, Inconsolata, Roboto Mono, monospace',
                      textAlign: 'center',
                      letterSpacing: '6px',
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
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>6 digits required</div>
                </div>
                
                <button 
                  type="submit" 
                  disabled={roomKey.length !== 6 || isLoading}
                  style={{
                    padding: '16px 24px',
                    background: (roomKey.length !== 6 || isLoading) ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: (roomKey.length !== 6 || isLoading) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isLoading ? '🔄 Joining...' : '🚪 Join Room'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'create' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>Create Private Room</h3>
                <p style={{ margin: 0, color: '#666' }}>Generate a new secure room with a unique 6-digit key</p>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  background: '#f8f9fa',
                  borderRadius: '12px',
                  border: '1px solid #e0e0e0'
                }}>
                  <div style={{ fontSize: '20px' }}>🔒</div>
                  <div>
                    <div style={{ fontWeight: '600', color: '#333' }}>Secure & Private</div>
                    <div style={{ fontSize: '14px', color: '#666' }}>End-to-end encrypted messages</div>
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  background: '#f8f9fa',
                  borderRadius: '12px',
                  border: '1px solid #e0e0e0'
                }}>
                  <div style={{ fontSize: '20px' }}>📤</div>
                  <div>
                    <div style={{ fontWeight: '600', color: '#333' }}>Easy Sharing</div>
                    <div style={{ fontSize: '14px', color: '#666' }}>Share the 6-digit key with friends</div>
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  background: '#f8f9fa',
                  borderRadius: '12px',
                  border: '1px solid #e0e0e0'
                }}>
                  <div style={{ fontSize: '20px' }}>👥</div>
                  <div>
                    <div style={{ fontWeight: '600', color: '#333' }}>Invite Only</div>
                    <div style={{ fontSize: '14px', color: '#666' }}>Only users with the key can join</div>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={handleCreateRoom}
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '16px 24px',
                  background: isLoading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {isLoading ? '🔄 Creating Room...' : '➕ Create Private Room'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrivateRoomModal;