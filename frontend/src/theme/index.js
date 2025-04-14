// src/theme/themeConfig.js
import { createTheme } from '@mui/material/styles';

// Define color palettes for different themes
const palettes = {
  dark: {
    primary: {
      main: '#3B82F6',
      light: '#60A5FA',
      dark: '#2563EB',
      contrastText: '#FFFFFF'
    },
    secondary: {
      main: '#FACC15',
      light: '#FDE68A',
      dark: '#D97706',
      contrastText: '#000000'
    },
    background: {
      default: '#0F172A',
      paper: '#1E293B',
      darker: '#0F172A'
    },
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.7)',
      disabled: 'rgba(255, 255, 255, 0.5)'
    },
    error: {
      main: '#EF4444',
      light: '#F87171',
      dark: '#DC2626'
    },
    warning: {
      main: '#F59E0B',
      light: '#FBBF24',
      dark: '#D97706'
    },
    success: {
      main: '#10B981',
      light: '#34D399',
      dark: '#059669'
    },
    divider: 'rgba(255, 255, 255, 0.12)'
  },
  light: {
    primary: {
      main: '#2563EB',
      light: '#3B82F6',
      dark: '#1D4ED8',
      contrastText: '#FFFFFF'
    },
    secondary: {
      main: '#D97706',
      light: '#FBBF24',
      dark: '#B45309',
      contrastText: '#FFFFFF'
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
      darker: '#F1F5F9'
    },
    text: {
      primary: '#1E293B',
      secondary: 'rgba(15, 23, 42, 0.7)',
      disabled: 'rgba(15, 23, 42, 0.5)'
    },
    error: {
      main: '#DC2626',
      light: '#EF4444',
      dark: '#B91C1C'
    },
    warning: {
      main: '#D97706',
      light: '#F59E0B',
      dark: '#B45309'
    },
    success: {
      main: '#059669',
      light: '#10B981',
      dark: '#047857'
    },
    divider: 'rgba(0, 0, 0, 0.12)'
  },
  // You can add more themes here (e.g., 'highContrast', 'sepia', etc.)
};

// Common typography settings
const typography = {
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  h1: {
    fontWeight: 700,
  },
  h2: {
    fontWeight: 700,
  },
  h3: {
    fontWeight: 600,
  },
  h4: {
    fontWeight: 600,
  },
  h5: {
    fontWeight: 500,
  },
  h6: {
    fontWeight: 500,
  },
  button: {
    fontWeight: 500,
    textTransform: 'none' // Prevents all caps buttons
  }
};

// Function to get component overrides based on the theme mode
const getComponentOverrides = (mode, palette) => ({
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: '50px', // Rounded buttons
        textTransform: 'none',
        boxShadow: 'none',
        '&:hover': {
          boxShadow: `0 4px 8px ${mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.15)'}`,
        },
      },
      contained: {
        '&:hover': {
          boxShadow: `0 4px 8px ${mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.15)'}`,
        },
      },
      outlined: {
        borderWidth: '1px',
        '&:hover': {
          borderWidth: '1px',
        },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: 'none', // Remove default gradient
        backgroundColor: palette.background.paper,
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        boxShadow: mode === 'dark' 
          ? '0 4px 6px rgba(0, 0, 0, 0.2)' 
          : '0 2px 4px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  MuiInputBase: {
    styleOverrides: {
      root: {
        backgroundColor: mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.05)' 
          : 'rgba(0, 0, 0, 0.03)',
        '&.Mui-disabled': {
          backgroundColor: mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.03)' 
            : 'rgba(0, 0, 0, 0.06)',
        },
      },
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.23)' 
            : 'rgba(0, 0, 0, 0.23)',
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.5)' 
            : 'rgba(0, 0, 0, 0.5)',
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: palette.primary.main,
        },
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: {
        borderBottom: `1px solid ${palette.divider}`,
      },
      head: {
        fontWeight: 600,
        backgroundColor: palette.background.paper,
      },
    },
  },
  MuiDialogTitle: {
    styleOverrides: {
      root: {
        backgroundColor: palette.background.paper,
        color: palette.text.primary,
      },
    },
  },
  MuiDialogContent: {
    styleOverrides: {
      root: {
        backgroundColor: palette.background.darker,
        color: palette.text.primary,
      },
    },
  },
  MuiDialogActions: {
    styleOverrides: {
      root: {
        backgroundColor: palette.background.paper,
      },
    },
  },
  MuiSwitch: {
    styleOverrides: {
      root: {
        width: 42,
        height: 26,
        padding: 0,
        margin: 8,
      },
      switchBase: {
        padding: 1,
        '&.Mui-checked': {
          transform: 'translateX(16px)',
          color: '#fff',
          '& + .MuiSwitch-track': {
            backgroundColor: palette.primary.main,
            opacity: 1,
            border: 0,
          },
        },
        '&.Mui-disabled + .MuiSwitch-track': {
          opacity: 0.5,
        },
      },
      thumb: {
        width: 24,
        height: 24,
      },
      track: {
        borderRadius: 13,
        backgroundColor: mode === 'dark' ? '#39393D' : '#E9E9EA',
        opacity: 1,
      },
    },
  },
});

// Create theme with the given mode
export const createAppTheme = (mode = 'dark') => {
  const selectedPalette = palettes[mode] || palettes.dark;
  
  return createTheme({
    palette: {
      mode,
      ...selectedPalette
    },
    typography,
    shape: {
      borderRadius: 8, // Default border radius throughout the app
    },
    components: getComponentOverrides(mode, selectedPalette),
  });
};

// Export default themes
export const darkTheme = createAppTheme('dark');
export const lightTheme = createAppTheme('light');