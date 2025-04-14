import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Link, useLocation } from "react-router-dom";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Collapse,
  IconButton,
} from "@mui/material";
import {
  ExitToApp as LogoutIcon,
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowUp as ArrowUpIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { navigationItems } from "./NavigationConfig";
import { useTheme } from "../../context/ThemeContext";

const APP_NAME = import.meta.env.VITE_APP_NAME || "Default APP";

const SideBar = ({
  isMobile,
  handleNavigation,
  handleLogout,
  user,
}) => {
  const location = useLocation();
  const [expandedMenu, setExpandedMenu] = useState(null);
  const { mode, primaryColor } = useTheme();

  // On component mount, check if there's a stored expanded menu state
  useEffect(() => {
    const storedExpandedMenu = localStorage.getItem("expandedMenu");
    if (storedExpandedMenu) {
      setExpandedMenu(storedExpandedMenu);
    }

    // Find active menu and expand it on initial load
    const currentPath = location.pathname;
    navigationItems.forEach((item) => {
      if (
        item.subItems &&
        item.subItems.some(
          (subItem) =>
            subItem.path === currentPath ||
            (subItem.path.includes("?tab=") &&
              currentPath === "/settings" &&
              location.search.includes(subItem.path.split("?tab=")[1]))
        )
      ) {
        setExpandedMenu(item.title);
        localStorage.setItem("expandedMenu", item.title);
      }
    });
  }, [location.pathname, location.search]);

  // Handle submenu expansion
  const handleExpandMenu = (title) => {
    const newExpandedMenu = expandedMenu === title ? null : title;
    setExpandedMenu(newExpandedMenu);

    // Store expanded menu state in localStorage
    if (newExpandedMenu) {
      localStorage.setItem("expandedMenu", newExpandedMenu);
    } else {
      localStorage.removeItem("expandedMenu");
    }
  };

  // Check if user has access to a route
  const hasAccess = (allowedRoles) => {
    if (!user) return false;
    if (allowedRoles.includes("user")) return true;
    return user.isAdmin && allowedRoles.includes("admin");
  };

  // Check if a route is active
  const isActive = (path) => {
    if (path === "/dashboard" && location.pathname === "/") return true;
    if (path === location.pathname) return true;

    // Special handling for settings paths with query parameters
    if (path.startsWith("/settings?tab=")) {
      const tabParam = path.split("=")[1];
      return (
        location.pathname === "/settings" &&
        location.search.includes(`tab=${tabParam}`)
      );
    }

    if (path !== "/dashboard" && location.pathname.startsWith(path))
      return true;
    return false;
  };

  // Calculate colors based on theme mode
  const sidebarBg =
    mode === "dark"
      ? "linear-gradient(180deg, #1E293B 0%, #0F172A 100%)"
      : "linear-gradient(180deg, #FFFFFF 0%, #F1F5F9 100%)";
  const textColor = mode === "dark" ? "#FFFFFF" : "#1E293B";
  const accentColor = primaryColor || "#FACC15";
  const dividerColor =
    mode === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)";
  const hoverBg =
    mode === "dark" ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.04)";
  const activeBg =
    mode === "dark"
      ? `rgba(${primaryColor ? primaryColor : "250, 204, 21"}, 0.08)`
      : `rgba(${primaryColor ? primaryColor : "250, 204, 21"}, 0.12)`;

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        background: sidebarBg,
        color: textColor,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* App Logo/Title */}
      <Box
        sx={{
          py: 2,
          px: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h6" fontWeight="bold" color={accentColor}>
          {APP_NAME}
        </Typography>
      </Box>

      <Divider sx={{ bgcolor: dividerColor }} />

      {/* Navigation Items */}
      <Box sx={{ flexGrow: 1, overflowY: "auto", overflowX: "hidden", pt: 2 }}>
        <List component="nav" disablePadding>
          {/* Standard navigation items */}
          {navigationItems.map((item) => {
            // Skip items user doesn't have access to
            if (!hasAccess(item.allowedRoles)) return null;

            const active = isActive(item.path);

            return (
              <Box key={item.title}>
                {/* Don't render parent menu if there are no accessible subitems */}
                {item.subItems &&
                item.subItems.filter((subItem) =>
                  hasAccess(subItem.allowedRoles)
                ).length === 0 ? null : item.subItems ? (
                  // Item with submenu
                  <>
                    <ListItem disablePadding sx={{ display: "block" }}>
                      <ListItemButton
                        onClick={() => handleExpandMenu(item.title)}
                        sx={{
                          minHeight: 48,
                          px: 2.5,
                          py: 1,
                          backgroundColor: active ? activeBg : "transparent",
                          "&:hover": { backgroundColor: hoverBg },
                          color: active ? accentColor : textColor,
                          borderLeft: active
                            ? `3px solid ${accentColor}`
                            : "3px solid transparent",
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            color: active ? accentColor : textColor,
                            minWidth: 40,
                            mr: 2,
                          }}
                        >
                          {item.icon}
                        </ListItemIcon>

                        <ListItemText
                          primary={item.title}
                          primaryTypographyProps={{
                            fontWeight: active ? "bold" : "normal",
                          }}
                        />
                        {expandedMenu === item.title ? (
                          <ArrowUpIcon />
                        ) : (
                          <ArrowDownIcon />
                        )}
                      </ListItemButton>
                    </ListItem>

                    {/* Submenu items */}
                    <Collapse
                      in={expandedMenu === item.title}
                      timeout="auto"
                      unmountOnExit
                    >
                      <List component="div" disablePadding>
                        {item.subItems
                          .filter((subItem) =>
                            hasAccess(subItem.allowedRoles)
                          )
                          .map((subItem) => (
                            <ListItemButton
                              key={subItem.title}
                              component={Link}
                              to={subItem.path}
                              onClick={handleNavigation}
                              sx={{
                                pl: 6,
                                py: 0.75,
                                backgroundColor: isActive(subItem.path)
                                  ? activeBg
                                  : "transparent",
                                "&:hover": { backgroundColor: hoverBg },
                                color: isActive(subItem.path)
                                  ? accentColor
                                  : mode === "dark"
                                  ? "rgba(255, 255, 255, 0.8)"
                                  : "rgba(0, 0, 0, 0.8)",
                                borderLeft: isActive(subItem.path)
                                  ? `3px solid ${accentColor}`
                                  : "3px solid transparent",
                              }}
                            >
                              {/* Add icon for submenu items */}
                              {subItem.icon && (
                                <ListItemIcon
                                  sx={{
                                    color: isActive(subItem.path)
                                      ? accentColor
                                      : mode === "dark"
                                      ? "rgba(255, 255, 255, 0.8)"
                                      : "rgba(0, 0, 0, 0.8)",
                                    minWidth: 30,
                                    mr: 1,
                                    "& .MuiSvgIcon-root": {
                                      fontSize: "1.2rem",
                                    },
                                  }}
                                >
                                  {subItem.icon}
                                </ListItemIcon>
                              )}
                              <ListItemText
                                primary={subItem.title}
                                primaryTypographyProps={{
                                  fontSize: "0.9rem",
                                  fontWeight: isActive(subItem.path)
                                    ? "bold"
                                    : "normal",
                                }}
                              />
                            </ListItemButton>
                          ))}
                      </List>
                    </Collapse>
                  </>
                ) : (
                  // Regular navigation item
                  <ListItem disablePadding sx={{ display: "block" }}>
                    <ListItemButton
                      component={Link}
                      to={item.path}
                      onClick={handleNavigation}
                      sx={{
                        minHeight: 48,
                        px: 2.5,
                        py: 1,
                        backgroundColor: active ? activeBg : "transparent",
                        "&:hover": { backgroundColor: hoverBg },
                        color: active ? accentColor : textColor,
                        borderLeft: active
                          ? `3px solid ${accentColor}`
                          : "3px solid transparent",
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          color: active ? accentColor : textColor,
                          minWidth: 40,
                          mr: 2,
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>

                      <ListItemText
                        primary={item.title}
                        primaryTypographyProps={{
                          fontWeight: active ? "bold" : "normal",
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                )}
              </Box>
            );
          })}
        </List>
      </Box>

      {/* Logout Button at Bottom */}
      <Box>
        <Divider sx={{ bgcolor: dividerColor }} />
        <List>
          <ListItem disablePadding>
            <ListItemButton
              onClick={handleLogout}
              sx={{
                px: 2.5,
                py: 1.5,
                "&:hover": { backgroundColor: hoverBg },
              }}
            >
              <ListItemIcon
                sx={{
                  color: textColor,
                  minWidth: 40,
                  mr: 2,
                }}
              >
                <LogoutIcon />
              </ListItemIcon>

              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Box>
  );
};

SideBar.propTypes = {
  isMobile: PropTypes.bool.isRequired,
  handleNavigation: PropTypes.func.isRequired,
  handleLogout: PropTypes.func.isRequired,
  user: PropTypes.object,
};

export default SideBar;