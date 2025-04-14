import { useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const BASE_URL = import.meta.env.VITE_BASE_URL;

/**
 * Custom hook for accessing and managing application settings
 */
const useAppSettings = () => {
  const { user, token } = useContext(AuthContext);
  const userId = user?._id;
  
  const [settings, setSettings] = useState({
    system: {},
    features: {},
    config: {},
    user: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch application settings from the server
   */
  const fetchAppSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const storedToken = localStorage.getItem('token');
      const headers = storedToken ? { Authorization: `Bearer ${storedToken}` } : {};
      
      // Choose endpoint based on authentication status
      const endpoint = storedToken ? '/settings' : '/settings/public';
      
      const response = await axios.get(`${BASE_URL}${endpoint}`, { headers });
      const data = response.data;
      
      // Extract the actual settings object based on API response format
      let settingsData;
      
      if (data && data.settings) {
        settingsData = data.settings;
      } else if (data && data.data && data.data.settings) {
        settingsData = data.data.settings;
      } else if (data && typeof data === 'object' && !Array.isArray(data)) {
        settingsData = data;
      } else {
        settingsData = {};
      }
      
      // Process settings into categories
      const processedSettings = {
        system: {},
        features: {},
        config: {},
        user: {}
      };
      
      // Process all settings and categorize them
      if (settingsData && typeof settingsData === 'object') {
        Object.entries(settingsData).forEach(([key, value]) => {
          // Special handling for user-specific theme settings
          if (userId && key.includes(userId)) {
            // Extract the base key without userId
            let baseKey = key.replace(`_${userId}`, '');
            
            // Further extract category if present (e.g., user_theme_mode_123 -> theme_mode)
            let category = 'user';
            let settingName = baseKey;
            
            if (baseKey.includes('_')) {
              const parts = baseKey.split('_');
              category = parts[0];
              settingName = parts.slice(1).join('_');
            }
            
            // Add to appropriate category
            if (category === 'user') {
              processedSettings.user[settingName] = value;
            }
          } 
          // Handle theme settings without userId (global defaults)
          else if (key.includes('theme') || key.includes('mode') || key.includes('color') || key.includes('font')) {
            // Look for theme settings in different formats
            if (key.startsWith('user_')) {
              // If it's a user theme setting without specific userId
              const settingName = key.replace('user_', '');
              processedSettings.user[settingName] = value;
            } else if (key.startsWith('theme_')) {
              // If it's a direct theme setting
              processedSettings.user[key] = value;
            }
          }
          // Handle regular categorized settings
          else if (key.includes('_')) {
            const parts = key.split('_');
            const category = parts[0];
            const name = parts.slice(1).join('_');
            
            // Map category names
            const targetCategory = 
              category === 'system' ? 'system' :
              category === 'feature' ? 'features' :
              category === 'config' ? 'config' :
              category === 'user' ? 'user' : null;
            
            if (targetCategory && processedSettings[targetCategory]) {
              processedSettings[targetCategory][name] = value;
            }
          }
          // Add any remaining root-level settings to system
          else {
            processedSettings.system[key] = value;
          }
        });
      }
      
      setSettings(processedSettings);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /**
   * Update a specific setting
   * 
   * @param {string} category - Setting category (system, user, feature, config)
   * @param {string} name - Setting name
   * @param {any} value - New setting value
   * @returns {Promise<boolean>} Success status
   */
  const updateSetting = useCallback(async (category, name, value) => {
    try {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        throw new Error('Authentication required');
      }
      
      // Special handling for theme settings - make sure we're using the correct format
      let payloadName = name;
      if (category === 'user' && (name === 'mode' || name === 'primary_color' || name === 'font_size')) {
        // Check if we should prepend 'theme_' for clarity
        if (!name.startsWith('theme_')) {
          payloadName = `theme_${name}`;
        }
      }
      
      const payload = { 
        category, 
        name: payloadName,
        value 
      };
      
      // Send the update request
      await axios.post(
        `${BASE_URL}/settings`, 
        payload, 
        { headers: { Authorization: `Bearer ${storedToken}` } }
      );
      
      // Update local state with the new value
      setSettings(prev => {
        const newSettings = { ...prev };
        if (!newSettings[category]) {
          newSettings[category] = {};
        }
        
        // Update both with and without theme_ prefix for compatibility
        if (category === 'user' && payloadName.startsWith('theme_')) {
          const shortName = payloadName.replace('theme_', '');
          newSettings[category][shortName] = value;
          newSettings[category][payloadName] = value;
        } else {
          newSettings[category][name] = value;
        }
        
        return newSettings;
      });
      
      return true;
    } catch (err) {
      throw err;
    }
  }, []);

  /**
   * Get a single setting value with optional default
   * 
   * @param {string} category - Setting category (system, user, feature, config)
   * @param {string} name - Setting name
   * @param {any} defaultValue - Default value if setting not found
   * @returns {any} Setting value or default
   */
  const getSetting = useCallback((category, name, defaultValue = null) => {
    if (!settings || !settings[category]) {
      return defaultValue;
    }
    
    // Try with exact name first
    if (settings[category][name] !== undefined) {
      return settings[category][name];
    }
    
    // If not found and it's a user theme setting, try with theme_ prefix
    if (category === 'user' && !name.startsWith('theme_')) {
      const themeName = `theme_${name}`;
      if (settings[category][themeName] !== undefined) {
        return settings[category][themeName];
      }
    }
    
    // If not found and it has theme_ prefix, try without it
    if (name.startsWith('theme_')) {
      const shortName = name.replace('theme_', '');
      if (settings[category][shortName] !== undefined) {
        return settings[category][shortName];
      }
    }
    
    return defaultValue;
  }, [settings]);

  // Initialize settings on component mount or when user changes
  useEffect(() => {
    if (token) {
      fetchAppSettings();
    }
  }, [fetchAppSettings, token, userId]);

  return {
    settings,
    loading,
    error,
    fetchAppSettings,
    updateSetting,
    getSetting,
    
    // Convenience getters for common settings
    appName: settings.system?.appName || 'Currency Exchange App',
    isMaintenanceMode: settings.system?.maintenance || false,
    contactEmail: settings.system?.contactEmail || 'support@example.com',
    footerText: settings.system?.footerText || '© 2024 Currency Exchange App',
    supportedCurrencies: settings.config?.supportedCurrencies || ['TTD', 'USD'],
    
    // Feature flags
    features: {
      allowRegistration: settings.features?.allowRegistration !== false,
      enableReports: settings.features?.enableReports !== false,
      enableNotifications: settings.features?.enableNotifications !== false
    }
  };
};

export default useAppSettings;