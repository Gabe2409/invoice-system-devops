import PropTypes from "prop-types";
import { Box, Typography, Paper } from "@mui/material";
import { useTheme } from "../../context/ThemeContext";

const PageHeader = ({ title, subtitle, icon }) => {
  const { mode, primaryColor } = useTheme();
  
  // Theme-based colors
  const paperBgColor = mode === 'dark' ? "#1E293B" : "#FFFFFF";
  const textColor = mode === 'dark' ? "white" : "#1E293B";
  const secondaryTextColor = mode === 'dark' ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)";
  const accentColor = primaryColor || (mode === 'dark' ? '#FACC15' : '#3B82F6');
  const shadowColor = mode === 'dark' 
    ? '0 4px 8px rgba(0, 0, 0, 0.25)' 
    : '0 2px 4px rgba(0, 0, 0, 0.08)';
  
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 3,
        display: "flex",
        alignItems: "center",
        gap: 2,
        borderRadius: 2,
        bgcolor: paperBgColor,
        boxShadow: shadowColor,
        border: mode === 'dark' 
          ? '1px solid rgba(255, 255, 255, 0.05)' 
          : '1px solid rgba(0, 0, 0, 0.05)'
      }}
    >
      {icon && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 1,
            borderRadius: 2,
            bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
          }}
        >
          {icon}
        </Box>
      )}
      <Box>
        <Typography variant="h5" component="h1" sx={{ fontWeight: "medium", color: textColor }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body1" sx={{ color: secondaryTextColor, mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  icon: PropTypes.node,
};

export default PageHeader;