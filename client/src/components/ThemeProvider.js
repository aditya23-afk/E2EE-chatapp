import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const themes = {
  default: {
    name: 'Ocean Blue',
    primary: '#667eea',
    secondary: '#764ba2',
    accent: '#28a745',
    background: '#ffffff',
    surface: '#f8f9fa',
    text: '#333333',
    textSecondary: '#666666',
    border: '#e9ecef',
    shadow: 'rgba(0, 0, 0, 0.1)',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    surfaceGradient: 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)',
  },
  sunset: {
    name: 'Sunset Orange',
    primary: '#ff6b6b',
    secondary: '#ee5a24',
    accent: '#feca57',
    background: '#ffffff',
    surface: '#fff5f5',
    text: '#2d3436',
    textSecondary: '#636e72',
    border: '#fab1a0',
    shadow: 'rgba(238, 90, 36, 0.1)',
    gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
    surfaceGradient: 'linear-gradient(180deg, #fff5f5 0%, #fab1a0 100%)',
  },
  forest: {
    name: 'Forest Green',
    primary: '#00b894',
    secondary: '#00a085',
    accent: '#fdcb6e',
    background: '#ffffff',
    surface: '#f0fff4',
    text: '#2d3436',
    textSecondary: '#636e72',
    border: '#81ecec',
    shadow: 'rgba(0, 184, 148, 0.1)',
    gradient: 'linear-gradient(135deg, #00b894 0%, #00a085 100%)',
    surfaceGradient: 'linear-gradient(180deg, #f0fff4 0%, #81ecec 100%)',
  },
  purple: {
    name: 'Royal Purple',
    primary: '#a29bfe',
    secondary: '#6c5ce7',
    accent: '#fd79a8',
    background: '#ffffff',
    surface: '#f8f7ff',
    text: '#2d3436',
    textSecondary: '#636e72',
    border: '#e17055',
    shadow: 'rgba(108, 92, 231, 0.1)',
    gradient: 'linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)',
    surfaceGradient: 'linear-gradient(180deg, #f8f7ff 0%, #e17055 100%)',
  },
  dark: {
    name: 'Dark Mode',
    primary: '#4f46e5',
    secondary: '#7c3aed',
    accent: '#10b981',
    background: '#1f2937',
    surface: '#374151',
    text: '#f9fafb',
    textSecondary: '#d1d5db',
    border: '#4b5563',
    shadow: 'rgba(0, 0, 0, 0.3)',
    gradient: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    surfaceGradient: 'linear-gradient(180deg, #374151 0%, #4b5563 100%)',
  },
  cyberpunk: {
    name: 'Cyberpunk',
    primary: '#ff0080',
    secondary: '#00ffff',
    accent: '#ffff00',
    background: '#0a0a0a',
    surface: '#1a1a2e',
    text: '#00ffff',
    textSecondary: '#ff0080',
    border: '#16213e',
    shadow: 'rgba(255, 0, 128, 0.2)',
    gradient: 'linear-gradient(135deg, #ff0080 0%, #00ffff 100%)',
    surfaceGradient: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
  }
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('default');
  const [customSettings, setCustomSettings] = useState({
    animations: true,
    sounds: false,
    compactMode: false,
    showTimestamps: true,
    showAvatars: true,
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem('secureChat_theme');
    const savedSettings = localStorage.getItem('secureChat_settings');
    
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
    
    if (savedSettings) {
      try {
        setCustomSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('Failed to parse saved settings');
      }
    }
  }, []);

  const changeTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
      localStorage.setItem('secureChat_theme', themeName);
      
      // Apply CSS custom properties
      const root = document.documentElement;
      const theme = themes[themeName];
      
      Object.entries(theme).forEach(([key, value]) => {
        if (key !== 'name') {
          root.style.setProperty(`--theme-${key}`, value);
        }
      });
    }
  };

  const updateSettings = (newSettings) => {
    setCustomSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('secureChat_settings', JSON.stringify(updated));
      return updated;
    });
  };

  // Apply theme on mount and theme change
  useEffect(() => {
    changeTheme(currentTheme);
  }, [currentTheme]);

  const value = {
    currentTheme,
    theme: themes[currentTheme],
    themes,
    changeTheme,
    customSettings,
    updateSettings,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};