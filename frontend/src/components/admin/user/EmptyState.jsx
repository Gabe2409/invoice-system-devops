import { TableBody, TableRow, TableCell, Typography, Button } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import PropTypes from "prop-types";
import { useTheme } from "../../../context/ThemeContext"; // Import your theme context

const EmptyState = ({ colSpan, onRefresh }) => {
  const { mode, primaryColor } = useTheme(); // Get theme settings
  
  // Theme-based colors
  const textColor = mode === 'dark' ? "#FFFFFF" : "#1E293B";
  const secondaryTextColor = mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)';
  const accentColor = primaryColor || (mode === 'dark' ? '#FACC15' : '#3B82F6');
  
  return (
    <TableBody>
      <TableRow>
        <TableCell colSpan={colSpan} sx={{ height: '200px', textAlign: 'center', color: textColor }}>
          <Typography variant="h6">No transactions found</Typography>
          <Typography variant="body2" sx={{ color: secondaryTextColor, mt: 1 }}>
            Try adjusting your search criteria
          </Typography>
          <Button 
            startIcon={<RefreshIcon />} 
            variant="outlined" 
            sx={{ 
              mt: 2,
              color: accentColor,
              borderColor: mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)',
              '&:hover': {
                borderColor: accentColor,
                backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
              }
            }} 
            onClick={onRefresh}
          >
            Refresh
          </Button>
        </TableCell>
      </TableRow>
    </TableBody>
  );
};

EmptyState.propTypes = {
  colSpan: PropTypes.number.isRequired,
  onRefresh: PropTypes.func.isRequired
};

export default EmptyState;