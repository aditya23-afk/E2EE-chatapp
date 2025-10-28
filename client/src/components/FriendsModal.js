import React, { useState, useEffect } from 'react';

const FriendsModal = ({ 
  isVisible, 
  onClose, 
  onSendFriendRequest, 
  onAcceptFriendRequest, 
  onRejectFriendRequest,
  pendingRequests = [],
  sentRequests = [],
  friends = []
}) => {
  const [activeTab, setActiveTab] = useState('add');
  const [searchUsername, setSearchUsername] = useState('');

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

  if (!isVisible) return null;

  const handleSendRequest = () => {
    if (searchUsername.trim()) {
      onSendFriendRequest(searchUsername.trim());
      setSearchUsername('');
    }
  };

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
          onClose();
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
          justifyContent: 'space-between',
          position: 'relative'
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
              👥
            </div>
            <div>
              <h2 style={{ margin: '0 0 4px 0', fontSize: '20px' }}>Friends</h2>
              <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>Manage your friend connections</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'rgba(220, 53, 69, 0.8)';
              e.target.style.transform = 'scale(1.1) rotate(90deg)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.2)';
              e.target.style.transform = 'scale(1) rotate(0deg)';
            }}
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: '#f8f9fa', borderBottom: '1px solid #e0e0e0' }}>
          <button 
            onClick={() => setActiveTab('add')}
            style={{
              flex: 1,
              padding: '16px 20px',
              background: activeTab === 'add' ? 'white' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              color: activeTab === 'add' ? '#667eea' : '#666',
              borderBottom: activeTab === 'add' ? '3px solid #667eea' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            ➕ Add Friends
          </button>
          <button 
            onClick={() => setActiveTab('requests')}
            style={{
              flex: 1,
              padding: '16px 20px',
              background: activeTab === 'requests' ? 'white' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              color: activeTab === 'requests' ? '#667eea' : '#666',
              borderBottom: activeTab === 'requests' ? '3px solid #667eea' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              position: 'relative'
            }}
          >
            📬 Requests
            {pendingRequests.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                background: '#dc3545',
                color: 'white',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: '700'
              }}>
                {pendingRequests.length}
              </div>
            )}
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '32px', maxHeight: '60vh', overflowY: 'auto' }}>
          {activeTab === 'add' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>Add New Friend</h3>
                <p style={{ margin: 0, color: '#666' }}>Enter a username to send a friend request</p>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <input
                  type="text"
                  value={searchUsername}
                  onChange={(e) => setSearchUsername(e.target.value)}
                  placeholder="Enter username..."
                  style={{
                    flex: 1,
                    padding: '16px 20px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '16px',
                    fontSize: '16px',
                    fontWeight: '500',
                    outline: 'none',
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
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSendRequest();
                    }
                  }}
                />
                <button 
                  onClick={handleSendRequest}
                  disabled={!searchUsername.trim()}
                  style={{
                    padding: '16px 24px',
                    background: searchUsername.trim() ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#ccc',
                    border: 'none',
                    borderRadius: '16px',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: searchUsername.trim() ? 'pointer' : 'not-allowed',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.3s ease',
                    boxShadow: searchUsername.trim() ? '0 8px 24px rgba(102, 126, 234, 0.3)' : 'none'
                  }}
                  onMouseOver={(e) => {
                    if (searchUsername.trim()) {
                      e.target.style.transform = 'translateY(-2px) scale(1.02)';
                      e.target.style.boxShadow = '0 12px 32px rgba(102, 126, 234, 0.4)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (searchUsername.trim()) {
                      e.target.style.transform = 'translateY(0) scale(1)';
                      e.target.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.3)';
                    }
                  }}
                >
                  Send Request
                </button>
              </div>

              {/* Sent Requests */}
              {sentRequests.length > 0 && (
                <div>
                  <h4 style={{ margin: '0 0 16px 0', color: '#333' }}>Sent Requests</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {sentRequests.map((username) => (
                      <div key={username} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px',
                        background: '#f8f9fa',
                        borderRadius: '12px',
                        border: '1px solid #e0e0e0'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: '600'
                          }}>
                            {username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: '600', color: '#333' }}>{username}</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>Request sent</div>
                          </div>
                        </div>
                        <div style={{
                          padding: '6px 12px',
                          background: '#ffc107',
                          color: 'white',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          Pending
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div>
              {/* Incoming Requests */}
              {pendingRequests.length > 0 ? (
                <div style={{ marginBottom: '32px' }}>
                  <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>Friend Requests</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {pendingRequests.map((username) => (
                      <div key={username} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '20px',
                        background: '#f8f9fa',
                        borderRadius: '16px',
                        border: '1px solid #e0e0e0'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{
                            width: '48px',
                            height: '48px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: '700',
                            fontSize: '18px'
                          }}>
                            {username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: '600', color: '#333', fontSize: '16px' }}>{username}</div>
                            <div style={{ fontSize: '14px', color: '#666' }}>Wants to be your friend</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={() => onAcceptFriendRequest(username)}
                            style={{
                              padding: '10px 18px',
                              background: '#28a745',
                              border: 'none',
                              borderRadius: '12px',
                              color: 'white',
                              fontSize: '14px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)'
                            }}
                            onMouseOver={(e) => {
                              e.target.style.transform = 'translateY(-2px) scale(1.05)';
                              e.target.style.boxShadow = '0 6px 16px rgba(40, 167, 69, 0.4)';
                            }}
                            onMouseOut={(e) => {
                              e.target.style.transform = 'translateY(0) scale(1)';
                              e.target.style.boxShadow = '0 4px 12px rgba(40, 167, 69, 0.3)';
                            }}
                          >
                            Accept
                          </button>
                          <button 
                            onClick={() => onRejectFriendRequest(username)}
                            style={{
                              padding: '10px 18px',
                              background: '#dc3545',
                              border: 'none',
                              borderRadius: '12px',
                              color: 'white',
                              fontSize: '14px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              boxShadow: '0 4px 12px rgba(220, 53, 69, 0.3)'
                            }}
                            onMouseOver={(e) => {
                              e.target.style.transform = 'translateY(-2px) scale(1.05)';
                              e.target.style.boxShadow = '0 6px 16px rgba(220, 53, 69, 0.4)';
                            }}
                            onMouseOut={(e) => {
                              e.target.style.transform = 'translateY(0) scale(1)';
                              e.target.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.3)';
                            }}
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
                  <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>No Friend Requests</h3>
                  <p style={{ margin: 0, color: '#666' }}>You don't have any pending friend requests</p>
                </div>
              )}

              {/* Current Friends */}
              {friends.length > 0 && (
                <div>
                  <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>Your Friends ({friends.length})</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {friends.map((username) => (
                      <div key={username} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        padding: '16px',
                        background: '#f8f9fa',
                        borderRadius: '12px',
                        border: '1px solid #e0e0e0'
                      }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: '600'
                        }}>
                          {username.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '600', color: '#333' }}>{username}</div>
                          <div style={{ fontSize: '12px', color: '#28a745' }}>Online</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendsModal;