import React, { useState, useContext, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Divider, 
  Stack,
  TextField,
  Button,
  Avatar,
  CircularProgress,
  Snackbar,
  Alert,
  Fade
} from '@mui/material';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;

const ProfileSettings = () => {
  const { user, token, updateUserInfo } = useContext(AuthContext);
  const { mode, primaryColor } = useTheme();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isReady, setIsReady] = useState(false);
  
  // Theme-based colors
  const textColor = mode === 'dark' ? "white" : "#1E293B";
  const secondaryTextColor = mode === 'dark' ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)";
  const dividerColor = mode === 'dark' ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)";
  const inputBgColor = mode === 'dark' ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)";
  const accentColor = primaryColor || (mode === 'dark' ? '#FACC15' : '#3B82F6');
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    userName: '',
    currentPin: '',
    newPin: '',
    confirmPin: ''
  });
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Initialize form data when user is available
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.fullName || '',
        userName: user.userName || '',
      }));
      setIsReady(true);
    }
  }, [user]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate PIN if trying to change it
    if (formData.newPin) {
      if (formData.newPin !== formData.confirmPin) {
        setSnackbar({
          open: true,
          message: 'New PINs do not match',
          severity: 'error'
        });
        return;
      }
      
      if (formData.newPin.length !== 4 || !/^\d+$/.test(formData.newPin)) {
        setSnackbar({
          open: true,
          message: 'PIN must be exactly 4 digits',
          severity: 'error'
        });
        return;
      }
      
      if (!formData.currentPin) {
        setSnackbar({
          open: true,
          message: 'Current PIN is required to set a new PIN',
          severity: 'error'
        });
        return;
      }
    }
    
    setSaving(true);
    
    try {
      const payload = {
        fullName: formData.fullName,
        userName: formData.userName
      };
      
      // Only include PIN fields if changing PIN
      if (formData.newPin && formData.currentPin) {
        payload.currentPin = formData.currentPin;
        payload.newPin = formData.newPin;
      }
      
      // Send the update request to the profile endpoint
      const { data } = await axios.put(
        `${BASE_URL}/users/profile`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Clear PIN fields after update
      setFormData(prev => ({
        ...prev,
        currentPin: '',
        newPin: '',
        confirmPin: ''
      }));
      
      // Update user info in auth context
      if (data.user && typeof updateUserInfo === 'function') {
        updateUserInfo(data.user);
      }
      
      setSnackbar({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success'
      });
    } catch (error) {
      // Handle specific error cases
      let errorMessage = 'Error updating profile';
      
      if (error.response) {
        if (error.response.status === 401 && error.response.data?.message?.includes('PIN')) {
          errorMessage = 'Current PIN is incorrect';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  // Generate avatar from user name 
  const getAvatarLetters = (name) => {
    if (!name) return '';
    const nameParts = name.split(' ');
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return nameParts[0].substring(0, 2).toUpperCase();
  };
  
  if (loading || !isReady) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300 }}>
        <CircularProgress sx={{ color: accentColor }} />
      </Box>
    );
  }
  
  // Input field styling
  const inputSx = {
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)'
      },
      '&:hover fieldset': {
        borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'
      },
      '&.Mui-focused fieldset': {
        borderColor: accentColor
      },
      'input': {
        color: textColor
      }
    },
    '& .MuiInputLabel-root': {
      color: secondaryTextColor,
      '&.Mui-focused': {
        color: accentColor
      }
    },
    '& .MuiFormHelperText-root': {
      color: secondaryTextColor
    },
    bgcolor: inputBgColor
  };
  
  return (
    <Fade in={isReady} timeout={500}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ color: textColor }}>
          Profile Settings
        </Typography>
        <Divider sx={{ mb: 3, borderColor: dividerColor }} />
        
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="flex-start">
          {/* Profile Picture */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            minWidth: { xs: '100%', md: '200px' }
          }}>
            <Avatar
              sx={{ 
                width: 100, 
                height: 100, 
                fontSize: '2rem',
                bgcolor: accentColor,
                mb: 2
              }}
            >
              {getAvatarLetters(user?.fullName)}
            </Avatar>
            <Typography variant="body1" sx={{ mb: 1, color: textColor }}>
              {user?.fullName}
            </Typography>
            <Typography variant="body2" sx={{ color: secondaryTextColor, mb: 2 }}>
              {user?.role === 'admin' ? 'Administrator' : 'Staff'}
            </Typography>
          </Box>
          
          {/* Profile Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ flexGrow: 1 }}>
            <Stack spacing={3}>
              <TextField
                name="fullName"
                label="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                fullWidth
                required
                sx={inputSx}
              />
              
              <TextField
                name="userName"
                label="Username"
                value={formData.userName}
                onChange={handleChange}
                fullWidth
                required
                sx={inputSx}
              />
              
              <Typography variant="h6" sx={{ mt: 2, color: textColor }}>
                Change PIN
              </Typography>
              <Divider sx={{ borderColor: dividerColor }} />
              
              <TextField
                name="currentPin"
                label="Current PIN"
                type="password"
                inputProps={{ maxLength: 4, inputMode: 'numeric' }}
                value={formData.currentPin}
                onChange={handleChange}
                fullWidth
                helperText="Enter current PIN only if you want to change it"
                sx={inputSx}
              />
              
              <TextField
                name="newPin"
                label="New PIN"
                type="password"
                inputProps={{ maxLength: 4, inputMode: 'numeric' }}
                value={formData.newPin}
                onChange={handleChange}
                fullWidth
                disabled={!formData.currentPin}
                helperText="PIN must be 4 digits"
                sx={inputSx}
              />
              
              <TextField
                name="confirmPin"
                label="Confirm New PIN"
                type="password"
                inputProps={{ maxLength: 4, inputMode: 'numeric' }}
                value={formData.confirmPin}
                onChange={handleChange}
                fullWidth
                disabled={!formData.currentPin || !formData.newPin}
                sx={inputSx}
              />
              
              <Button 
                type="submit" 
                variant="contained" 
                disabled={saving}
                sx={{ 
                  mt: 2, 
                  alignSelf: 'flex-end',
                  bgcolor: accentColor,
                  color: mode === 'dark' ? "black" : "white",
                  '&:hover': {
                    bgcolor: mode === 'dark' ? `${accentColor}E6` : `${accentColor}CC`
                  }
                }}
              >
                {saving ? <CircularProgress size={24} sx={{ color: 'inherit' }} /> : 'Save Changes'}
              </Button>
            </Stack>
          </Box>
        </Stack>
        
        {/* Notifications */}
        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={6000} 
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity}
            sx={{ 
              width: '100%', 
              bgcolor: snackbar.severity === 'success' 
                ? (mode === 'dark' ? 'rgba(46, 125, 50, 0.9)' : 'rgba(46, 125, 50, 0.8)') 
                : (mode === 'dark' ? 'rgba(211, 47, 47, 0.9)' : 'rgba(211, 47, 47, 0.8)'),
              color: 'white'
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Fade>
  );
};

export default ProfileSettings;