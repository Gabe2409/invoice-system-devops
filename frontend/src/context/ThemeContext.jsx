// src/context/ThemeContext.jsx
import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createAppTheme } from '../theme/themeConfig';
import { AuthContext } from './AuthContext';
import useAppSettings from '../hooks/useAppSettings';

// Create context
export const ThemeContext = createContext();

// Theme setting keys for localStorage (for consistency)
export const THEME_SETTINGS = {
  MODE: 'theme_mode',
  PRIMARY_COLOR: 'theme_primary_color', 
  FONT_SIZE: 'theme_font_size'
};

// Setting name variations to check in user settings
const MODE_KEYS = ['mode', 'theme_mode'];
const COLOR_KEYS = ['primary_color', 'theme_primary_color'];
const FONT_SIZE_KEYS = ['font_size', 'theme_font_size'];

// Default theme settings
const DEFAULT_THEME = {
  mode: 'dark',
  primaryColor: '#3B82F6',
  fontSize: 'medium'
};

export const ThemeProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  
  // Use the app settings hook for database integration
  const { 
    settings, 
    updateSetting,
    loading: settingsLoading,
    fetchAppSettings
  } = useAppSettings();
  
  // Set up local state for theme settings with defaults
  const [themeMode, setThemeMode] = useState(DEFAULT_THEME.mode);
  const [themePrimaryColor, setThemePrimaryColor] = useState(DEFAULT_THEME.primaryColor);
  const [themeFontSize, setThemeFontSize] = useState(DEFAULT_THEME.fontSize);
  
  // Loading state
  const [loading, setLoading] = useState(true);
  
  // Utility function to find settings with multiple possible key variations
  const findSettingValue = (settingsObject, keyVariations) => {
    if (!settingsObject || typeof settingsObject !== 'object') return undefined;
    
    // Try each key variation
    for (const key of keyVariations) {
      if (settingsObject[key] !== undefined) {
        return settingsObject[key];
      }
    }
    
    return undefined;
  };
  
  // Step 1: Load initial theme preferences from localStorage (for quick initial render)
  useEffect(() => {
    try {
      // Get values from localStorage
      const savedMode = localStorage.getItem(THEME_SETTINGS.MODE);
      const savedColor = localStorage.getItem(THEME_SETTINGS.PRIMARY_COLOR);
      const savedFontSize = localStorage.getItem(THEME_SETTINGS.FONT_SIZE);
      
      // Update state with values that exist
      if (savedMode) setThemeMode(savedMode);
      if (savedColor) setThemePrimaryColor(savedColor);
      if (savedFontSize) setThemeFontSize(savedFontSize);
      
      // If we loaded from localStorage, show the UI while waiting for DB
      if (savedMode || savedColor || savedFontSize) {
        setLoading(false);
      }
    } catch (error) {
      // Continue with defaults on error
      setLoading(false);
    }
  }, []);
  
  // Step 2: Fetch settings from database whenever user changes
  useEffect(() => {
    if (user) {
      fetchAppSettings();
    } else {
      // No user, just use localStorage values
      setLoading(false);
    }
  }, [user, fetchAppSettings]);
  
  // Step 3: Update theme settings when database values are loaded
  useEffect(() => {
    if (!settingsLoading && settings.user) {
      // Check for theme mode with multiple possible keys
      const serverMode = findSettingValue(settings.user, MODE_KEYS);
      if (serverMode !== undefined && serverMode !== themeMode) {
        setThemeMode(serverMode);
        localStorage.setItem(THEME_SETTINGS.MODE, serverMode);
      }
      
      // Check for primary color with multiple possible keys
      const serverColor = findSettingValue(settings.user, COLOR_KEYS);
      if (serverColor !== undefined && serverColor !== themePrimaryColor) {
        setThemePrimaryColor(serverColor);
        localStorage.setItem(THEME_SETTINGS.PRIMARY_COLOR, serverColor);
      }
      
      // Check for font size with multiple possible keys
      const serverFontSize = findSettingValue(settings.user, FONT_SIZE_KEYS);
      if (serverFontSize !== undefined && serverFontSize !== themeFontSize) {
        setThemeFontSize(serverFontSize);
        localStorage.setItem(THEME_SETTINGS.FONT_SIZE, serverFontSize);
      }
      
      // Done loading
      setLoading(false);
    }
  }, [settingsLoading, settings, themeMode, themePrimaryColor, themeFontSize]);
  
  // Function to toggle theme mode
  const toggleThemeMode = async () => {
    const newMode = themeMode === 'dark' ? 'light' : 'dark';
    
    try {
      // Step 1: Update local state immediately for responsive UI
      setThemeMode(newMode);
      
      // Step 2: Update localStorage for persistence
      localStorage.setItem(THEME_SETTINGS.MODE, newMode);
      
      // Step 3: Save to database using the settings service
      if (user) {
        // Try to save with plain 'mode' first
        const result = await updateSetting('user', 'mode', newMode);
        
        if (!result) {
          // If failed, try with theme_ prefix
          await updateSetting('user', 'theme_mode', newMode);
        }
      }
      
      return true;
    } catch (error) {
      // Don't revert the UI - keep it responsive and try to reconnect later
      return false;
    }
  };
  
  // Function to set primary color
  const setPrimaryColor = async (color) => {
    try {
      // Step 1: Update local state immediately
      setThemePrimaryColor(color);
      
      // Step 2: Update localStorage for persistence
      localStorage.setItem(THEME_SETTINGS.PRIMARY_COLOR, color);
      
      // Step 3: Save to database using the settings service
      if (user) {
        // Try to save with plain 'primary_color' first
        const result = await updateSetting('user', 'primary_color', color);
        
        if (!result) {
          // If failed, try with theme_ prefix
          await updateSetting('user', 'theme_primary_color', color);
        }
      }
      
      return true;
    } catch (error) {
      // Don't revert the UI - keep it responsive
      return false;
    }
  };
  
  // Function to set font size
  const setFontSize = async (size) => {
    try {
      // Step 1: Update local state immediately
      setThemeFontSize(size);
      
      // Step 2: Update localStorage for persistence
      localStorage.setItem(THEME_SETTINGS.FONT_SIZE, size);
      
      // Step 3: Save to database using the settings service
      if (user) {
        // Try to save with plain 'font_size' first
        const result = await updateSetting('user', 'font_size', size);
        
        if (!result) {
          // If failed, try with theme_ prefix
          await updateSetting('user', 'theme_font_size', size);
        }
      }
      
      return true;
    } catch (error) {
      // Don't revert the UI - keep it responsive
      return false;
    }
  };
  
  // Generate the current theme based on settings
  const theme = useMemo(() => createAppTheme(
    themeMode, 
    themePrimaryColor,
    themeFontSize
  ), [themeMode, themePrimaryColor, themeFontSize]);
  
  // Context value with all theme functionality
  const contextValue = {
    mode: themeMode,
    primaryColor: themePrimaryColor,
    fontSize: themeFontSize,
    toggleThemeMode, 
    setThemeMode: (mode) => {
      if (mode === themeMode) return Promise.resolve(true);
      
      const newMode = mode === 'dark' ? 'dark' : 'light';
      setThemeMode(newMode);
      localStorage.setItem(THEME_SETTINGS.MODE, newMode);
      
      if (user) {
        return updateSetting('user', 'mode', newMode);
      }
      
      return Promise.resolve(true);
    },
    setPrimaryColor,
    setFontSize,
    loading
  };
  
  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

// Custom hook for using the theme context
export const useTheme = () => useContext(ThemeContext);

export default ThemeProvider;