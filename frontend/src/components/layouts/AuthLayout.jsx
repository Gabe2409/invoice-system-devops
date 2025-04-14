import { Box } from "@mui/material";
import { useTheme } from "../../context/ThemeContext"; // Import your theme context

const AuthLayout = ({ children }) => {
  const { mode } = useTheme(); // Get theme mode
  
  // Define background based on theme mode
  const bgColor = mode === 'dark' ? "#0F172A" : "#F8FAFC";
  const textColor = mode === 'dark' ? "#FFFFFF" : "#1E293B";

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: bgColor,
        color: textColor,
      }}
    >
      {children}
    </Box>
  );
};

export default AuthLayout;