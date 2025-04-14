import { useState, useContext, useEffect } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import {
  Box,
  CssBaseline,
  Drawer,
  Toolbar,
  useMediaQuery
} from "@mui/material";
import { useTheme as useMuiTheme } from "@mui/material/styles";
import { AuthContext } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

// Import separated components
import Header from "./Header";
import SideBar from "./SideBar";

// Drawer width
const drawerWidth = 260;

const Layout = ({ children }) => {
  const { logout, user } = useContext(AuthContext);
  const muiTheme = useMuiTheme();
  const { mode } = useTheme();
  const navigate = useNavigate();
  
  // Responsive states
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerMinimized, setDrawerMinimized] = useState(false);

  // Initialize drawer state from localStorage when component mounts
  useEffect(() => {
    const savedDrawerState = localStorage.getItem('drawerMinimized');
    // Only set if it exists and is a boolean value
    if (savedDrawerState !== null) {
      setDrawerMinimized(savedDrawerState === 'true');
    }
  }, []);

  // Toggle drawer for mobile view
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  // Toggle drawer minimized state for desktop
  const handleDrawerMinimize = () => {
    const newState = !drawerMinimized;
    setDrawerMinimized(newState);
    // Save to localStorage
    localStorage.setItem('drawerMinimized', newState.toString());
  };
  
  // Close mobile drawer after navigation
  const handleNavigation = () => {
    if (isMobile) {
      setMobileOpen(false);
    }
  };
  
  // Handle logout
  const handleLogout = () => {
    logout(navigate);
  };

  // Define base colors based on theme mode
  const baseBackgroundColor = mode === 'dark' ? "#0F172A" : "#F8FAFC";
  const gradientBackground = mode === 'dark' 
    ? 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)'
    : 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)';

  return (
    <Box 
      sx={{ 
        display: "flex", 
        minHeight: "100vh",
        width: "100%", 
        maxWidth: "100vw", 
        overflow: "hidden",
        bgcolor: baseBackgroundColor
      }}
    >
      <CssBaseline />

      {/* Header */}
      <Header 
        isMobile={isMobile}
        drawerMinimized={drawerMinimized}
        drawerWidth={drawerWidth}
        handleDrawerToggle={handleDrawerToggle}
        handleLogout={handleLogout}
        theme={muiTheme}
        user={user}
      />

      {/* Sidebar (Permanent for large screens, Temporary for Mobile) */}
      <Box
        component="nav"
        sx={{
          width: { md: drawerMinimized ? 64 : drawerWidth },
          flexShrink: { md: 0 }
        }}
      >
        {/* Mobile Drawer (Temporary) */}
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': { 
                width: drawerWidth, 
                boxSizing: 'border-box'
              }
            }}
          >
            <SideBar 
              isMobile={isMobile}
              drawerMinimized={false}
              handleDrawerMinimize={handleDrawerMinimize}
              handleNavigation={handleNavigation}
              handleLogout={handleLogout}
              user={user}
            />
          </Drawer>
        ) : (
          // Desktop Drawer (Permanent)
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', md: 'block' },
              '& .MuiDrawer-paper': { 
                width: drawerMinimized ? 64 : drawerWidth,
                boxSizing: 'border-box',
                borderRight: 'none',
                transition: muiTheme.transitions.create('width', {
                  easing: muiTheme.transitions.easing.sharp,
                  duration: muiTheme.transitions.duration.enteringScreen,
                }),
                overflowX: 'hidden'
              }
            }}
            open
          >
            <SideBar 
              isMobile={isMobile}
              drawerMinimized={drawerMinimized}
              handleDrawerMinimize={handleDrawerMinimize}
              handleNavigation={handleNavigation}
              handleLogout={handleLogout}
              user={user}
            />
          </Drawer>
        )}
      </Box>

      {/* Main Content Area */}
      <Box
            component="main"
            sx={{
              flexGrow: 1,
              background: gradientBackground,
              display: 'flex',
              flexDirection: 'column',
              color: mode === 'dark' ? "white" : "#1E293B",
              width: { 
                xs: '100%',
                md: `calc(100% - ${drawerMinimized ? 64 : drawerWidth}px)`
              },
              overflowX: "hidden",
              overflowY: "auto",
              transition: muiTheme.transitions.create(['width', 'margin'], {
                easing: muiTheme.transitions.easing.sharp,
                duration: muiTheme.transitions.duration.enteringScreen,
              }),
            }}
          >
        <Toolbar /> {/* Pushes content below AppBar */}
        <Box 
          sx={{ 
            p: { xs: 1, sm: 3 },
            flexGrow: 1,
            width: '100%',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: mode === 'dark' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.05)',
            }
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired
};

export default Layout;