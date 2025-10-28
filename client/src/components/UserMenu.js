import React, { useState } from 'react';
import UserAvatar from './UserAvatar';
import { useTheme } from './ThemeProvider';

const UserMenu = ({ currentUser, isConnected, onLogout, onOpenSettings, onOpenFriends, friendRequestCount = 0 }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme } = useTheme();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    setIsMenuOpen(false);
    onLogout();
  };

  return (
    <div style={{ position: 'relative' }}>
      <button 
        onClick={toggleMenu}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '16px',
          color: 'white',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          backdropFilter: 'blur(10px)',
          minWidth: '200px'
        }}
        onMouseOver={(e) => {
          e.target.style.background = 'rgba(255, 255, 255, 0.15)';
          e.target.style.transform = 'translateY(-2px)';
        }}
        onMouseOut={(e) => {
          e.target.style.background = 'rgba(255, 255, 255, 0.1)';
          e.target.style.transform = 'translateY(0)';
        }}
      >
        <div style={{ position: 'relative' }}>
          <UserAvatar username={currentUser} isOnline={isConnected} size="medium" />
        </div>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ fontWeight: '600', fontSize: '14px' }}>{currentUser}</div>
          <div style={{ 
            fontSize: '12px', 
            opacity: 0.8,
            color: isConnected ? '#4ade80' : '#f87171'
          }}>
            {isConnected ? 'Online' : 'Offline'}
          </div>
        </div>
        <div style={{
          transform: isMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.3s ease'
        }}>
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
            <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </button>
      
      {isMenuOpen && (
        <div 
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            minWidth: '280px',
            zIndex: 1000,
            overflow: 'hidden'
          }}
        >
          {/* Profile Section */}
          <div style={{
            padding: '20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{ position: 'relative' }}>
              <UserAvatar username={currentUser} isOnline={isConnected} size="large" />
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '16px', marginBottom: '4px' }}>
                {currentUser}
              </div>
              <div style={{ 
                fontSize: '14px', 
                opacity: 0.9,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: isConnected ? '#4ade80' : '#f87171'
                }}></div>
                Active now
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div style={{ padding: '8px' }}>
            <div 
              onClick={() => {
                setIsMenuOpen(false);
                // Profile functionality can be added here later
                console.log('Profile clicked');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.background = '#f8f9fa';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'transparent';
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                👤
              </div>
              <div>
                <div style={{ fontWeight: '600', color: '#333', marginBottom: '2px' }}>
                  Profile
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  View and edit profile
                </div>
              </div>
            </div>

            <div 
              onClick={() => {
                setIsMenuOpen(false);
                onOpenFriends();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
              onMouseOver={(e) => {
                e.target.style.background = '#f8f9fa';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'transparent';
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                👥
              </div>
              <div>
                <div style={{ fontWeight: '600', color: '#333', marginBottom: '2px' }}>
                  Friends
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  Manage friend connections
                </div>
              </div>
              {friendRequestCount > 0 && (
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
                  fontWeight: '700',
                  boxShadow: '0 2px 8px rgba(220, 53, 69, 0.3)'
                }}>
                  {friendRequestCount}
                </div>
              )}
            </div>

            <div 
              onClick={() => {
                setIsMenuOpen(false);
                onOpenSettings();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.background = '#f8f9fa';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'transparent';
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                ⚙️
              </div>
              <div>
                <div style={{ fontWeight: '600', color: '#333', marginBottom: '2px' }}>
                  Preferences
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  Customize your experience
                </div>
              </div>
            </div>

            <hr style={{ 
              margin: '8px 0', 
              border: 'none', 
              borderTop: '1px solid #e0e0e0' 
            }} />

            <div 
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.background = '#fef2f2';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'transparent';
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                background: '#fee2e2',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#dc2626'
              }}>
                🚪
              </div>
              <div>
                <div style={{ fontWeight: '600', color: '#dc2626', marginBottom: '2px' }}>
                  Sign Out
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  Log out of your account
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop to close menu when clicking outside */}
      {isMenuOpen && (
        <div 
          onClick={() => setIsMenuOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
        />
      )}
    </div>
  );
};

export default UserMenu;