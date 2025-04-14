import { useState } from "react";
import { Box, Typography, Card, CardContent, Button, useMediaQuery, Fade } from "@mui/material";
import { useTheme as useMuiTheme } from "@mui/material/styles";
import RefreshIcon from "@mui/icons-material/Refresh";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { useTheme } from "../../context/ThemeContext";
import UsersTable from "../../components/admin/user/UsersTable";
import PageHeader from "../../components/common/PageHeader";

const Users = () => {
  const muiTheme = useMuiTheme();
  const { mode, primaryColor } = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  
  // State
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Theme-based colors
  const backgroundColor = mode === 'dark' ? "#0F172A" : "#F8FAFC";
  const cardBgColor = mode === 'dark' ? "#1E293B" : "#FFFFFF";
  const textColor = mode === 'dark' ? "white" : "#1E293B";
  const secondaryTextColor = mode === 'dark' ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)";
  const accentColor = primaryColor || (mode === 'dark' ? '#FACC15' : '#3B82F6');
  
  // Handlers
  const handleRefresh = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };
  
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
            title="User Management" 
            subtitle="Create, view, edit, and manage system users"
            icon={<PersonAddIcon sx={{ fontSize: 24, color: accentColor }} />}
          />
          
          {/* Action Buttons */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              sx={{ 
                borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)',
                color: textColor,
                '&:hover': { 
                  borderColor: mode === 'dark' ? 'white' : 'rgba(0, 0, 0, 0.7)'
                }
              }}
            >
              Refresh
            </Button>
          </Box>
          
          {/* Main Content */}
          <Card sx={{ 
            mb: 3, 
            bgcolor: cardBgColor,
            borderRadius: 2,
            boxShadow: mode === 'dark' 
              ? '0 4px 8px rgba(0, 0, 0, 0.25)' 
              : '0 2px 4px rgba(0, 0, 0, 0.08)',
            border: mode === 'dark' 
              ? '1px solid rgba(255, 255, 255, 0.05)' 
              : '1px solid rgba(0, 0, 0, 0.05)'
          }}>
            <CardContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ color: textColor, fontWeight: "medium" }}>
                  System Users
                </Typography>
                <Typography variant="body2" sx={{ color: secondaryTextColor }}>
                  Manage user accounts and access permissions
                </Typography>
              </Box>
              
              <Typography variant="body2" sx={{ color: secondaryTextColor, mb: 3 }}>
                Only admin users can create new user accounts. Staff users can view their own account details only.
              </Typography>
              
              <UsersTable 
                search={search}
                refreshKey={refreshKey}
              />
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Fade>
  );
};

export default Users;