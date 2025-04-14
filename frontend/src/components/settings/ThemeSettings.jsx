// src/components/settings/ThemeSettings.jsx
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Switch, 
  FormControlLabel, 
  Divider, 
  Card, 
  CardContent,
  Grid,
  RadioGroup,
  Radio,
  FormControl,
  FormLabel,
  useTheme as useMuiTheme,
  Snackbar,
  Alert,
  CircularProgress,
  Fade
} from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import FormatSizeIcon from '@mui/icons-material/FormatSize';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import { useTheme } from '../../context/ThemeContext';
import ThemePreview from '../../theme/ThemePreview';

// Predefined color options
const colorOptions = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Amber', value: '#F59E0B' },
  { name: 'Pink', value: '#EC4899' },
];

// Font size options
const fontSizeOptions = [
  { name: 'Small', value: 'small' },
  { name: 'Medium', value: 'medium' },
  { name: 'Large', value: 'large' },
  { name: 'Extra Large', value: 'extra-large' },
];

const ThemeSettings = () => {
  const { 
    mode, 
    toggleThemeMode, 
    primaryColor, 
    setPrimaryColor,
    fontSize,
    setFontSize,
    loading 
  } = useTheme();
  const muiTheme = useMuiTheme();
  
  // State to prevent flickering
  const [isReady, setIsReady] = useState(false);
  
  // Local state for UI feedback
  const [saving, setSaving] = useState(false);
  const [savingField, setSavingField] = useState(null); // Track which field is saving
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  
  // Set initial ready state once theme settings are loaded
  useEffect(() => {
    if (!loading) {
      setIsReady(true);
    }
  }, [loading]);
  
  // Handlers with loading states and error handling
  const handleToggleTheme = async () => {
    try {
      // Set saving state for theme mode
      setSaving(true);
      setSavingField('theme_mode');
      
      // Toggle theme mode
      await toggleThemeMode();
      
      // Show success notification
      showNotification('Theme mode updated successfully', 'success');
    } catch (error) {
      console.error('Error toggling theme:', error);
      showNotification('Failed to update theme mode', 'error');
    } finally {
      setSaving(false);
      setSavingField(null);
    }
  };
  
  const handleSetPrimaryColor = async (color) => {
    if (primaryColor === color) return; // No change needed
    
    try {
      // Set saving state for primary color
      setSaving(true);
      setSavingField('theme_primaryColor');
      
      // Update primary color
      await setPrimaryColor(color);
      
      // Show success notification
      showNotification('Primary color updated successfully', 'success');
    } catch (error) {
      console.error('Error setting primary color:', error);
      showNotification('Failed to update primary color', 'error');
    } finally {
      setSaving(false);
      setSavingField(null);
    }
  };
  
  const handleSetFontSize = async (event) => {
    try {
      const newSize = event.target.value;
      if (fontSize === newSize) return; // No change needed
      
      // Set saving state for font size
      setSaving(true);
      setSavingField('theme_fontSize');
      
      // Update font size
      await setFontSize(newSize);
      
      // Show success notification
      showNotification('Font size updated successfully', 'success');
    } catch (error) {
      console.error('Error setting font size:', error);
      showNotification('Failed to update font size', 'error');
    } finally {
      setSaving(false);
      setSavingField(null);
    }
  };
  
  // Helper for notifications
  const showNotification = (message, severity) => {
    setNotification({ open: true, message, severity });
  };
  
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };
  
  // Show loading state for the whole component when initializing
  if (loading || !isReady) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4} height={300}>
        <CircularProgress />
        <Typography ml={2}>Loading theme settings...</Typography>
      </Box>
    );
  }
  
  return (
    <Fade in={isReady} timeout={500}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Theme Settings
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          {/* Left column - Theme Controls */}
          <Grid item xs={12} md={5}>
            <Card sx={{ mb: 3, height: '100%' }}>
              <CardContent>
                {/* Theme Mode Toggle */}
                <Box sx={{ mb: 4 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={mode === 'dark'}
                        onChange={handleToggleTheme}
                        name="themeToggle"
                        color="primary"
                        disabled={saving}
                      />
                    }
                    label={
                      <Box display="flex" alignItems="center">
                        {mode === 'dark' ? (
                          <>
                            <DarkModeIcon sx={{ mr: 1, color: muiTheme.palette.primary.main }} />
                            <Typography>
                              Dark Mode
                              {savingField === 'theme_mode' && (
                                <CircularProgress size={14} sx={{ ml: 1 }} />
                              )}
                            </Typography>
                          </>
                        ) : (
                          <>
                            <LightModeIcon sx={{ mr: 1, color: muiTheme.palette.warning.main }} />
                            <Typography>
                              Light Mode
                              {savingField === 'theme_mode' && (
                                <CircularProgress size={14} sx={{ ml: 1 }} />
                              )}
                            </Typography>
                          </>
                        )}
                      </Box>
                    }
                  />
                </Box>
                
                {/* Primary Color Selection */}
                <FormControl component="fieldset" sx={{ mb: 4, width: '100%' }}>
                  <FormLabel component="legend" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <ColorLensIcon sx={{ mr: 1 }} />
                    <Typography>
                      Primary Color
                      {savingField === 'theme_primaryColor' && (
                        <CircularProgress size={14} sx={{ ml: 1 }} />
                      )}
                    </Typography>
                  </FormLabel>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {colorOptions.map((color) => (
                      <Box
                        key={color.value}
                        onClick={() => saving ? null : handleSetPrimaryColor(color.value)}
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          bgcolor: color.value,
                          cursor: saving ? 'not-allowed' : 'pointer',
                          border: primaryColor === color.value 
                            ? `2px solid ${muiTheme.palette.text.primary}` 
                            : '2px solid transparent',
                          '&:hover': {
                            opacity: saving ? 1 : 0.8,
                          },
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative'
                        }}
                        title={color.name}
                      />
                    ))}
                  </Box>
                </FormControl>
                
                {/* Font Size Selection */}
                <FormControl component="fieldset" sx={{ width: '100%' }}>
                  <FormLabel component="legend" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <FormatSizeIcon sx={{ mr: 1 }} />
                    <Typography>
                      Font Size
                      {savingField === 'theme_fontSize' && (
                        <CircularProgress size={14} sx={{ ml: 1 }} />
                      )}
                    </Typography>
                  </FormLabel>
                  <RadioGroup
                    aria-label="font-size"
                    name="font-size"
                    value={fontSize}
                    onChange={handleSetFontSize}
                  >
                    {fontSizeOptions.map((option) => (
                      <FormControlLabel
                        key={option.value}
                        value={option.value}
                        control={<Radio disabled={saving} />}
                        label={option.name}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Right column - Preview */}
          <Grid item xs={12} md={7}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                  Preview
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <ThemePreview />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Notification */}
        <Snackbar 
          open={notification.open} 
          autoHideDuration={4000} 
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseNotification} 
            severity={notification.severity} 
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </Fade>
  );
};

export default ThemeSettings;