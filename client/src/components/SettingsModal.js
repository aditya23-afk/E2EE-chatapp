import React, { useState, useEffect } from 'react';
import { useTheme } from './ThemeProvider';

const SettingsModal = ({ isVisible, onClose }) => {
  const { currentTheme, themes, changeTheme, customSettings, updateSettings } = useTheme();
  const [activeTab, setActiveTab] = useState('appearance');

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

  const handleThemeChange = (themeName) => {
    changeTheme(themeName);
  };

  const handleSettingChange = (setting, value) => {
    updateSettings({ [setting]: value });
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
        maxWidth: '600px',
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
              ⚙️
            </div>
            <div>
              <h2 style={{ margin: '0 0 4px 0', fontSize: '20px' }}>Settings</h2>
              <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>Customize your chat experience</p>
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
            onClick={() => setActiveTab('appearance')}
            style={{
              flex: 1,
              padding: '16px 20px',
              background: activeTab === 'appearance' ? 'white' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              color: activeTab === 'appearance' ? '#667eea' : '#666',
              borderBottom: activeTab === 'appearance' ? '3px solid #667eea' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            🎨 Appearance
          </button>
          <button 
            onClick={() => setActiveTab('preferences')}
            style={{
              flex: 1,
              padding: '16px 20px',
              background: activeTab === 'preferences' ? 'white' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              color: activeTab === 'preferences' ? '#667eea' : '#666',
              borderBottom: activeTab === 'preferences' ? '3px solid #667eea' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            🔧 Preferences
          </button>
          <button 
            onClick={() => setActiveTab('about')}
            style={{
              flex: 1,
              padding: '16px 20px',
              background: activeTab === 'about' ? 'white' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              color: activeTab === 'about' ? '#667eea' : '#666',
              borderBottom: activeTab === 'about' ? '3px solid #667eea' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            ℹ️ About
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '32px', maxHeight: '60vh', overflowY: 'auto' }}>
          {activeTab === 'appearance' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>Color Themes</h3>
                <p style={{ margin: 0, color: '#666' }}>Choose your preferred color scheme</p>
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px'
              }}>
                {Object.entries(themes).map(([key, theme]) => (
                  <div 
                    key={key}
                    onClick={() => handleThemeChange(key)}
                    style={{
                      padding: '20px',
                      background: currentTheme === key ? '#f0f8ff' : '#f8f9fa',
                      border: `2px solid ${currentTheme === key ? '#667eea' : '#e0e0e0'}`,
                      borderRadius: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      position: 'relative'
                    }}
                    onMouseOver={(e) => {
                      if (currentTheme !== key) {
                        e.target.style.borderColor = '#667eea';
                        e.target.style.transform = 'translateY(-2px)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (currentTheme !== key) {
                        e.target.style.borderColor = '#e0e0e0';
                        e.target.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        backgroundColor: theme.primary,
                        borderRadius: '6px'
                      }}></div>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        backgroundColor: theme.secondary,
                        borderRadius: '6px'
                      }}></div>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        backgroundColor: theme.accent,
                        borderRadius: '6px'
                      }}></div>
                    </div>
                    <div style={{ fontWeight: '600', color: '#333' }}>{theme.name}</div>
                    {currentTheme === key && (
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: '#667eea',
                        color: 'white',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px'
                      }}>
                        ✓
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>Chat Preferences</h3>
                <p style={{ margin: 0, color: '#666' }}>Customize your chat experience</p>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {[
                  { key: 'animations', label: 'Animations', desc: 'Enable smooth animations and transitions', icon: '🎭' },
                  { key: 'sounds', label: 'Sound Effects', desc: 'Play sounds for notifications and actions', icon: '🔊' },
                  { key: 'compactMode', label: 'Compact Mode', desc: 'Use smaller UI elements for more content', icon: '📱' },
                  { key: 'showTimestamps', label: 'Show Timestamps', desc: 'Display message timestamps', icon: '⏰' },
                  { key: 'showAvatars', label: 'Show Avatars', desc: 'Display user avatars in chat', icon: '👤' }
                ].map((setting) => (
                  <div key={setting.key} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '20px',
                    background: '#f8f9fa',
                    borderRadius: '12px',
                    border: '1px solid #e0e0e0'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ fontSize: '24px' }}>{setting.icon}</div>
                      <div>
                        <div style={{ fontWeight: '600', color: '#333', marginBottom: '4px' }}>
                          {setting.label}
                        </div>
                        <div style={{ fontSize: '14px', color: '#666' }}>
                          {setting.desc}
                        </div>
                      </div>
                    </div>
                    <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}>
                      <input
                        type="checkbox"
                        checked={customSettings[setting.key]}
                        onChange={(e) => handleSettingChange(setting.key, e.target.checked)}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span style={{
                        position: 'absolute',
                        cursor: 'pointer',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: customSettings[setting.key] ? '#667eea' : '#ccc',
                        transition: '0.4s',
                        borderRadius: '24px'
                      }}>
                        <span style={{
                          position: 'absolute',
                          content: '',
                          height: '18px',
                          width: '18px',
                          left: customSettings[setting.key] ? '26px' : '3px',
                          bottom: '3px',
                          backgroundColor: 'white',
                          transition: '0.4s',
                          borderRadius: '50%'
                        }}></span>
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                margin: '0 auto 20px',
                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)'
              }}>
                🔐
              </div>
              
              <h3 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '24px' }}>Secure Chat</h3>
              <div style={{
                display: 'inline-block',
                padding: '4px 12px',
                background: '#28a745',
                color: 'white',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600',
                marginBottom: '16px'
              }}>
                Version 1.0.0
              </div>
              <p style={{ margin: '0 0 32px 0', color: '#666' }}>Privacy-first messaging for everyone</p>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '32px'
              }}>
                {[
                  { icon: '🔒', title: 'End-to-End Encryption', desc: 'Your messages are encrypted and secure' },
                  { icon: '🏠', title: 'Private Rooms', desc: 'Create secure spaces for conversations' },
                  { icon: '💬', title: 'Real-time Messaging', desc: 'Instant communication with WebSocket' },
                  { icon: '🎨', title: 'Customizable Themes', desc: 'Personalize your chat experience' }
                ].map((feature, index) => (
                  <div key={index} style={{
                    padding: '20px',
                    background: '#f8f9fa',
                    borderRadius: '12px',
                    border: '1px solid #e0e0e0'
                  }}>
                    <div style={{ fontSize: '24px', marginBottom: '12px' }}>{feature.icon}</div>
                    <div style={{ fontWeight: '600', color: '#333', marginBottom: '8px' }}>{feature.title}</div>
                    <div style={{ fontSize: '14px', color: '#666' }}>{feature.desc}</div>
                  </div>
                ))}
              </div>
              
              <div style={{ color: '#666', fontSize: '14px' }}>
                <p>Built with React & WebSocket</p>
                <p>Designed for privacy and security</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;