import { Box, Switch, FormControlLabel, Typography, useTheme as useMuiTheme } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { mode, toggleTheme } = useTheme();
  const muiTheme = useMuiTheme();
  
  return (
    <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
      <FormControlLabel
        control={
          <Switch
            checked={mode === 'dark'}
            onChange={toggleTheme}
            name="themeToggle"
            color="primary"
          />
        }
        label={
          <Box display="flex" alignItems="center">
            {mode === 'dark' ? (
              <>
                <DarkModeIcon sx={{ mr: 1, color: muiTheme.palette.primary.main }} />
                <Typography>Dark Mode</Typography>
              </>
            ) : (
              <>
                <LightModeIcon sx={{ mr: 1, color: muiTheme.palette.warning.main }} />
                <Typography>Light Mode</Typography>
              </>
            )}
          </Box>
        }
      />
    </Box>
  );
};

export default ThemeToggle;