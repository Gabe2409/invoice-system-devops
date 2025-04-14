import { format } from "date-fns";
import { TableRow, TableCell, Chip, Typography, Box, Avatar, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PropTypes from "prop-types";
import { stringAvatar } from "../../../utils/utils";
import { useTheme } from "../../../context/ThemeContext"; 

const UserRow = ({ user, onClick, isMobile }) => {
  const { mode, primaryColor, fontSize } = useTheme();
  
  // Theme-based colors
  const textColor = mode === 'dark' ? "white" : "#1E293B";
  const hoverColor = mode === 'dark' ? "#334155" : "#F8FAFC";
  const accentColor = primaryColor || (mode === 'dark' ? '#FACC15' : '#3B82F6');
  
  // Role chip colors
  const getRoleColor = (role) => {
    if (role === 'admin') {
      return mode === 'dark' 
        ? { bgcolor: 'rgba(239, 68, 68, 0.2)', color: '#FCA5A5' }  // Red-toned for admin in dark mode
        : { bgcolor: 'rgba(220, 38, 38, 0.1)', color: '#991B1B' }; // Red-toned for admin in light mode
    }
    return mode === 'dark'
      ? { bgcolor: 'rgba(16, 185, 129, 0.2)', color: '#6EE7B7' }  // Green-toned for staff in dark mode
      : { bgcolor: 'rgba(5, 150, 105, 0.1)', color: '#065F46' };  // Green-toned for staff in light mode
  };
  
  // Determine font size based on theme setting
  const getFontSize = () => {
    switch (fontSize) {
      case 'small':
        return '0.9rem';
      case 'large':
        return '1.1rem';
      case 'extra-large':
        return '1.25rem';
      case 'medium':
      default:
        return '1rem';
    }
  };
  
  return (
    <TableRow
      sx={{
        cursor: "pointer",
        "&:hover": { backgroundColor: hoverColor },
        borderBottom: mode === 'dark' 
          ? '1px solid rgba(255, 255, 255, 0.05)' 
          : '1px solid rgba(0, 0, 0, 0.05)'
      }}
    >
      <TableCell 
        sx={{ 
          color: textColor,
          fontSize: getFontSize() 
        }}
        onClick={() => onClick(user)}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Avatar {...stringAvatar(user.fullName)} />
          <Typography 
            sx={{
              fontSize: getFontSize(),
              fontWeight: "medium"
            }}
          >
            {user.userName}
          </Typography>
        </Box>
      </TableCell>
      
      <TableCell 
        sx={{ 
          color: textColor,
          fontSize: getFontSize() 
        }}
        onClick={() => onClick(user)}
      >
        {user.fullName}
      </TableCell>
      
      <TableCell onClick={() => onClick(user)}>
        <Chip
          label={user.role}
          sx={{
            ...getRoleColor(user.role),
            fontWeight: "medium",
            textTransform: "capitalize",
            fontSize: fontSize === 'small' ? '0.75rem' : 
                     fontSize === 'large' ? '0.875rem' : 
                     fontSize === 'extra-large' ? '0.95rem' : '0.8125rem',
          }}
        />
      </TableCell>
      
      {!isMobile && (
        <>
          <TableCell 
            sx={{ 
              color: textColor,
              fontSize: getFontSize() 
            }}
            onClick={() => onClick(user)}
          >
            {user.lastLogin ? format(new Date(user.lastLogin), "dd MMM yyyy HH:mm") : "Never"}
          </TableCell>
          
          <TableCell 
            sx={{ 
              color: textColor,
              fontSize: getFontSize() 
            }}
            onClick={() => onClick(user)}
          >
            {user.createdAt ? format(new Date(user.createdAt), "dd MMM yyyy") : "N/A"}
          </TableCell>
        </>
      )}
      
      <TableCell>
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton 
            size="small" 
            onClick={(e) => {
              e.stopPropagation();
              onClick(user);
            }}
            sx={{ 
              color: textColor,
              bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
              '&:hover': {
                bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              }
            }}
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Box>
      </TableCell>
    </TableRow>
  );
};

UserRow.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    userName: PropTypes.string.isRequired,
    fullName: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
    lastLogin: PropTypes.string,
    createdAt: PropTypes.string,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
  isMobile: PropTypes.bool.isRequired
};

export default UserRow;