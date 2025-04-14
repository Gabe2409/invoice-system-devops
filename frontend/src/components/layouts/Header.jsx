import { useState } from "react";
import PropTypes from "prop-types";
import { useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Badge,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
  Fade,
} from "@mui/material";
import {
  Menu as MenuIcon,
  ExpandMore as ExpandMoreIcon,
  Notifications as NotificationsIcon,
  AccountCircle as ProfileIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
} from "@mui/icons-material";
import { navigationItems } from "./NavigationConfig";
import { stringAvatar } from "../../utils/utils";
import { useTheme } from "../../context/ThemeContext"; // Import your theme context

const Header = ({
  isMobile,
  drawerMinimized,
  drawerWidth,
  handleDrawerToggle,
  handleLogout,
  theme,
  user,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, toggleThemeMode, primaryColor } = useTheme(); // Get theme functions

  // User profile menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // Handle user profile menu
  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setAnchorEl(null);
  };

  // Get current section title
  const getCurrentPageTitle = () => {
    if (location.pathname === "/") return "Dashboard";

    // First check direct matches
    const matchedItem = navigationItems.find(
      (item) => item.path === location.pathname
    );
    if (matchedItem) return matchedItem.title;

    // Then check for parent routes
    for (const item of navigationItems) {
      if (
        location.pathname.startsWith(item.path) &&
        item.path !== "/dashboard"
      ) {
        // If it has subitems, check for more specific match
        if (item.subItems) {
          const matchedSubItem = item.subItems.find(
            (subItem) => subItem.path === location.pathname
          );
          if (matchedSubItem) return `${item.title} / ${matchedSubItem.title}`;
        }
        return item.title;
      }
    }

    return "Dashboard";
  };

  // Set background color based on theme mode
  const headerBgColor = mode === "dark" ? "#1E293B" : "#FFFFFF";
  const textColor = mode === "dark" ? "#FFFFFF" : "#1E293B";

  return (
    <AppBar
      position="fixed"
      elevation={1}
      sx={{
        width: {
          xs: "100%",
          md: `calc(100% - ${drawerMinimized ? 64 : drawerWidth}px)`,
        },
        ml: {
          xs: 0,
          md: `${drawerMinimized ? 64 : drawerWidth}px`,
        },
        transition: theme.transitions.create(["width", "margin"], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.standard,
        }),
      }}
    >
      <Toolbar>
        {/* Mobile Menu Toggle */}
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* App Title (only on mobile) */}
        {isMobile && (
          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              fontWeight: "bold",
              color: primaryColor || "#FACC15",
            }}
          >
            {import.meta.env.VITE_APP_NAME || "Default APP"}
          </Typography>
        )}

        {/* Title / Breadcrumb (desktop) */}
        {!isMobile && (
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {getCurrentPageTitle()}
          </Typography>
        )}

        {/* Right side items */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Theme Toggle */}
          <Tooltip
            title={
              mode === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"
            }
          >
            <IconButton onClick={toggleThemeMode} color="inherit" size="small">
              {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          {/* <Tooltip title="Notifications">
            <IconButton color="inherit" size="small">
              <Badge badgeContent={3} color="secondary">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip> */}

          {/* User Profile */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              cursor: "pointer",
              "&:hover": { opacity: 0.9 },
            }}
            onClick={handleProfileClick}
          >
            <Avatar
              {...stringAvatar(user?.fullName || "User")}
              sx={{
                width: 38,
                height: 38,
                border: `2px solid ${
                  mode === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)"
                }`,
              }}
            />
            {/* Only show name on larger screens */}
            {!isMobile && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  flexDirection: "column",
                }}
              >
                <Typography variant="body2" fontWeight="bold">
                  {user?.fullName || "User"}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  {user?.isAdmin ? "Administrator" : "User"}
                </Typography>
              </Box>
            )}
            <ExpandMoreIcon sx={{ fontSize: 20, opacity: 0.7 }} />
          </Box>

          {/* User Menu */}
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleProfileClose}
            TransitionComponent={Fade}
            PaperProps={{
              elevation: 3,
              sx: {
                minWidth: 180,
                borderRadius: 2,
                mt: 1,
                backgroundColor: mode === "dark" ? "#1E293B" : "#FFFFFF",
                color: mode === "dark" ? "white" : "#1E293B",
                "& .MuiMenuItem-root": {
                  px: 2,
                  py: 1,
                  "&:hover": {
                    backgroundColor:
                      mode === "dark"
                        ? "rgba(255, 255, 255, 0.08)"
                        : "rgba(0, 0, 0, 0.04)",
                  },
                },
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {user?.fullName}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                {user?.email}
              </Typography>
            </Box>

            <Divider
              sx={{
                borderColor:
                  mode === "dark"
                    ? "rgba(255, 255, 255, 0.08)"
                    : "rgba(0, 0, 0, 0.08)",
              }}
            />

            <MenuItem
              onClick={() => {
                handleProfileClose();
                navigate("/profile");
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <ProfileIcon fontSize="small" />
                <Typography variant="body2">My Profile</Typography>
              </Box>
            </MenuItem>

            <MenuItem
              onClick={() => {
                handleProfileClose();
                navigate("/settings");
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <SettingsIcon fontSize="small" />
                <Typography variant="body2">Settings</Typography>
              </Box>
            </MenuItem>

            <Divider
              sx={{
                borderColor:
                  mode === "dark"
                    ? "rgba(255, 255, 255, 0.08)"
                    : "rgba(0, 0, 0, 0.08)",
              }}
            />

            <MenuItem
              onClick={handleLogout}
              sx={{ color: primaryColor || "#FACC15" }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <LogoutIcon fontSize="small" />
                <Typography variant="body2">Logout</Typography>
              </Box>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

Header.propTypes = {
  isMobile: PropTypes.bool.isRequired,
  drawerMinimized: PropTypes.bool.isRequired,
  drawerWidth: PropTypes.number.isRequired,
  handleDrawerToggle: PropTypes.func.isRequired,
  handleLogout: PropTypes.func.isRequired,
  theme: PropTypes.object.isRequired,
  user: PropTypes.object,
};

export default Header;
