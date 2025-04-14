import { useContext } from 'react';
import { AuthContext } from './AuthContext';
import { useTheme } from '../context/ThemeContext'; // Import your theme context
import { Fade, Paper, IconButton, Typography, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const Snackbar = () => {
  const { showSnackbar, snackbarMessage, setShowSnackbar } = useContext(AuthContext);
  const { mode, primaryColor } = useTheme(); // Get theme settings
  
  // Theme-based colors
  const bgColor = mode === 'dark' ? "#1E293B" : "#334155";
  const textColor = "white"; // White text works well on both dark and light backgrounds
  const accentColor = primaryColor || (mode === 'dark' ? '#FACC15' : '#3B82F6');
  const shadowColor = mode === 'dark' 
    ? '0 4px 8px rgba(0, 0, 0, 0.4)' 
    : '0 2px 8px rgba(0, 0, 0, 0.25)';
  
  if (!showSnackbar) return null;

  return (
    <Fade in={showSnackbar}>
      <Paper
        elevation={4}
        sx={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: bgColor,
          color: textColor,
          borderRadius: '8px',
          boxShadow: shadowColor,
          zIndex: 1500,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 1.5,
          px: 2,
          minWidth: '280px',
          maxWidth: '90vw',
          border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
          '& .MuiTypography-root': {
            fontSize: '0.95rem',
          }
        }}
      >
        <Typography 
          sx={{ 
            pr: 2,
            wordBreak: 'break-word',
            maxWidth: 'calc(100% - 40px)',
            '& strong': { color: accentColor }
          }}
        >
          {snackbarMessage}
        </Typography>
        <IconButton
          onClick={() => setShowSnackbar(false)}
          size="small"
          edge="end"
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            p: 0.5,
            '&:hover': {
              color: 'white',
              bgcolor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Paper>
    </Fade>
  );
};

export default Snackbar;