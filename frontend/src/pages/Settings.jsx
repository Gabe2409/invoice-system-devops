import { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Paper, Tabs, Tab, Fade } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import PageHeader from "../components/common/PageHeader";

// Setting section components
import ThemeSettings from "../components/settings/ThemeSettings";
import ProfileSettings from "../components/settings/ProfileSettings";
import ApplicationSettings from "../components/settings/admin/ApplicationSettings";
import AdminSettings from "../components/settings/admin/AdminSettings";

// Icons for settings tabs
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PaletteIcon from '@mui/icons-material/Palette';
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';
import SettingsIcon from '@mui/icons-material/Settings';

const SettingsPage = () => {
  const { user, token } = useContext(AuthContext);
  const { mode, primaryColor } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [activeTabContent, setActiveTabContent] = useState(null);
  
  // Theme-based colors
  const textColor = mode === 'dark' ? "white" : "#1E293B";
  const paperBgColor = mode === 'dark' ? "#1E293B" : "#FFFFFF";
  const tabsBgColor = mode === 'dark' ? "#334155" : "#F1F5F9";
  const accentColor = primaryColor || (mode === 'dark' ? '#FACC15' : '#3B82F6');
  
  // Define the settings sections
  const settingsSections = [
    {
      id: 'theme',
      label: 'Theme',
      icon: <PaletteIcon />,
      component: ThemeSettings,
      requiresAuth: true,
      requiresAdmin: false
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <PersonIcon />,
      component: ProfileSettings,
      requiresAuth: true,
      requiresAdmin: false
    },
    {
      id: 'application',
      label: 'Application',
      icon: <SettingsApplicationsIcon />,
      component: ApplicationSettings,
      requiresAuth: true,
      requiresAdmin: true
    },
    {
      id: 'admin',
      label: 'Admin Settings',
      icon: <AdminPanelSettingsIcon />,
      component: AdminSettings,
      requiresAuth: true,
      requiresAdmin: true
    }
  ];
  
  // Filter sections based on user permissions
  const visibleSections = settingsSections.filter(section => {
    if (section.requiresAdmin && (!user || user.role !== 'admin')) {
      return false;
    }
    return true;
  });

  // Handle tab from URL query parameter
  const queryParams = new URLSearchParams(location.search);
  const tabFromUrl = queryParams.get('tab');

  // Find the tab index based on the URL parameter or default to 0 (Theme)
  const findTabIndex = () => {
    if (!tabFromUrl) return 0;
    
    const index = visibleSections.findIndex(
      section => section.id === tabFromUrl || section.id === tabFromUrl.toLowerCase()
    );
    
    return index >= 0 ? index : 0;
  };

  const [activeTab, setActiveTab] = useState(findTabIndex);

  // Update active tab when URL query parameter changes
  useEffect(() => {
    setActiveTab(findTabIndex());
  }, [location.search]);

  // Load component when tab changes with a fade effect
  useEffect(() => {
    if (!loading) {
      setActiveTabContent(null);
      
      // Small delay to allow fade out to happen before new content loads
      const timer = setTimeout(() => {
        if (visibleSections[activeTab]) {
          const SectionComponent = visibleSections[activeTab].component;
          setActiveTabContent(<SectionComponent />);
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [activeTab, loading]);

  useEffect(() => {
    // Check authentication status
    if (!token) {
      navigate("/login");
      return;
    }

    // If user object exists and has loaded
    if (user) {
      const SectionComponent = visibleSections[activeTab].component;
      setActiveTabContent(<SectionComponent />);
      setLoading(false);
    }
  }, [user, token, navigate]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Update URL with the selected tab for bookmarking/sharing
    const tabId = visibleSections[newValue].id;
    navigate(`/settings?tab=${tabId}`, { replace: true });
  };

  // Get current section label for subtitle
  const getCurrentSectionLabel = () => {
    return visibleSections[activeTab]?.label || '';
  };

  if (loading) {
    return (
      <Box sx={{ 
        width: "100%", 
        minHeight: "100%", 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center" 
      }}>
        <CircularProgress sx={{ color: accentColor }} />
      </Box>
    );
  }

  return (
    <Fade in={true} timeout={600}>
      <Box sx={{ 
        width: "100%", 
        minHeight: "100%", 
        display: "flex", 
        flexDirection: "column"
      }}>
        <Box sx={{ width: "100%", px: { xs: 0, sm: 2 } }}>
          {/* Page Header */}
          <PageHeader 
            title="Settings" 
            subtitle={getCurrentSectionLabel()}
            icon={<SettingsIcon sx={{ fontSize: 24, color: accentColor }} />}
          />

          {/* Tabs Navigation */}
          <Paper 
            sx={{ 
              width: '100%', 
              mb: 3, 
              backgroundColor: paperBgColor,
              color: textColor,
              boxShadow: mode === 'dark' ? '0 4px 8px rgba(0, 0, 0, 0.25)' : '0 2px 4px rgba(0, 0, 0, 0.08)',
              border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)',
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              aria-label="settings tabs"
              indicatorColor="primary"
              textColor="primary"
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': { 
                  color: textColor,
                  borderBottom: '2px solid transparent',
                  transition: 'all 0.2s ease',
                  '&:focus': {
                    outline: 'none',
                  },
                  '&:focus-visible': {
                    outline: 'none',
                  }
                },
                '& .Mui-selected': { 
                  color: accentColor,
                  borderBottom: `2px solid ${accentColor}`
                },
                '& .MuiTabs-indicator': { 
                  backgroundColor: 'transparent' // Hide the default indicator
                }
              }}
            >
              {visibleSections.map((section, index) => (
                <Tab 
                  key={section.id}
                  icon={section.icon} 
                  label={section.label}
                  disabled={section.requiresAdmin && user?.role !== 'admin'}
                  iconPosition="start"
                />
              ))}
            </Tabs>
          </Paper>

          {/* Render the active tab content */}
          <Fade in={activeTabContent !== null} timeout={500}>
            <Paper 
              sx={{ 
                p: 3, 
                mb: 4, 
                backgroundColor: paperBgColor,
                color: textColor,
                boxShadow: mode === 'dark' ? '0 4px 8px rgba(0, 0, 0, 0.25)' : '0 2px 4px rgba(0, 0, 0, 0.08)',
                border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)',
                borderRadius: 2,
                minHeight: '300px' // Ensure consistent height during transitions
              }}
            >
              {activeTabContent}
            </Paper>
          </Fade>
        </Box>
      </Box>
    </Fade>
  );
};

export default SettingsPage;