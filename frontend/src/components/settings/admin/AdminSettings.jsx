import React, { useContext, useState } from 'react';
import { 
  Box, 
  Typography, 
  Divider,
  Alert,
  Fade
} from '@mui/material';
import { AuthContext } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import Settings from './Settings'; // Your existing settings component

const AdminSettings = () => {
  const { user } = useContext(AuthContext);
  const { mode, primaryColor } = useTheme();
  const [isReady, setIsReady] = useState(true);
  
  // Theme-based colors
  const textColor = mode === 'dark' ? "white" : "#1E293B";
  const dividerColor = mode === 'dark' ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)";
  const alertBgColor = mode === 'dark' ? 'rgba(211, 47, 47, 0.15)' : 'rgba(211, 47, 47, 0.05)';
  const alertTextColor = mode === 'dark' ? '#FCA5A5' : '#B91C1C';
  
  // Only admins should be able to see this content
  const isAdmin = user?.role === 'admin';
  
  if (!isAdmin) {
    return (
      <Alert 
        severity="error"
        sx={{
          backgroundColor: alertBgColor,
          color: alertTextColor,
          '& .MuiAlert-icon': {
            color: alertTextColor
          }
        }}
      >
        You don't have permission to access these settings.
      </Alert>
    );
  }
  
  return (
    <Fade in={isReady} timeout={500}>
      <Box>
        <Typography variant="h6" gutterBottom sx={{ color: textColor }}>
          Advanced Settings
        </Typography>
        <Divider sx={{ mb: 3, borderColor: dividerColor }} />
        <Typography variant="body2" paragraph sx={{ color: textColor }}>
          These settings provide advanced configuration options for the application. 
          Please exercise caution when modifying these values as they can significantly 
          affect system behavior.
        </Typography>
        
        {/* Wrap your existing Settings component */}
        <Settings />
      </Box>
    </Fade>
  );
};

export default AdminSettings;