import { TableBody, TableRow, TableCell, CircularProgress, Typography } from "@mui/material";
import PropTypes from "prop-types";
import { useTheme } from "../../../context/ThemeContext"; // Import your theme context

const LoadingState = ({ colSpan }) => {
  const { mode, primaryColor } = useTheme(); // Get theme settings
  
  // Theme-based colors
  const textColor = mode === 'dark' ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)";
  const accentColor = primaryColor || (mode === 'dark' ? '#FACC15' : '#3B82F6');
  
  return (
    <TableBody>
      <TableRow>
        <TableCell colSpan={colSpan} sx={{ height: '200px', textAlign: 'center' }}>
          <CircularProgress size={40} sx={{ color: accentColor }} />
          <Typography variant="body2" sx={{ mt: 1, color: textColor }}>
            Loading transactions...
          </Typography>
        </TableCell>
      </TableRow>
    </TableBody>
  );
};

LoadingState.propTypes = {
  colSpan: PropTypes.number.isRequired
};

export default LoadingState;