import { useEffect, useState } from "react";
import { Box, Typography, Fade, CircularProgress, Alert, useMediaQuery, Paper, Divider, Button, IconButton } from "@mui/material";
import { useTheme as useMuiTheme } from "@mui/material/styles";
import { useTheme } from "../context/ThemeContext";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountBalances from "../components/dashboard/AccountBalances";
import TransactionsTable from "../components/transactions/transactionTable/TransactionsTable";
import TransactionModal from "../components/transactions/transactionModal/TransactionModal";
import PageHeader from "../components/common/PageHeader";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const Dashboard = () => {
  const muiTheme = useMuiTheme();
  const { mode, primaryColor } = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(muiTheme.breakpoints.down("md"));
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Theme-based colors
  const cardBgColor = mode === 'dark' ? "#1E293B" : "#FFFFFF";
  const textColor = mode === 'dark' ? "#FFFFFF" : "#1E293B";
  const dividerColor = mode === 'dark' ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)";
  const buttonBgColor = mode === 'dark' ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)";
  const buttonHoverColor = mode === 'dark' ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";
  const accentColor = primaryColor || (mode === 'dark' ? '#FACC15' : '#3B82F6');

  useEffect(() => {
    fetchAccounts();
  }, [refreshKey]);

  const fetchAccounts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found, user not authenticated");
      }
      
      const { data } = await axios.get(`${BASE_URL}/accounts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setAccounts(data);
    } catch (error) {
      console.error("Error fetching accounts:", error.response?.data?.message || error.message);
      setError(error.response?.data?.message || "Failed to load account balances");
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionAdded = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  };

  const handleNewTransactionClick = () => {
    setIsModalOpen(true);
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
            title="Dashboard" 
            subtitle="Account Overview"
            icon={<DashboardIcon sx={{ fontSize: 24, color: accentColor }} />}
          />

          {/* Action Buttons */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleNewTransactionClick}
              sx={{ 
                mr: 1, 
                bgcolor: accentColor,
                '&:hover': {
                  bgcolor: mode === 'dark' ? 
                    `${accentColor}E6` : // 90% opacity version for dark mode
                    `${accentColor}CC`   // 80% opacity version for light mode
                }
              }}
            >
              New Transaction
            </Button>
            
            <IconButton 
              onClick={fetchAccounts} 
              disabled={loading}
              sx={{ 
                color: textColor,
                bgcolor: buttonBgColor,
                "&:hover": { bgcolor: buttonHoverColor }
              }}
            >
              {loading ? 
                <CircularProgress size={24} sx={{ color: accentColor }} /> : 
                <RefreshIcon />
              }
            </IconButton>
          </Box>

          {/* Account Balances Section */}
          <Paper 
            elevation={3}
            sx={{ 
              p: isMobile ? 1.5 : 3, 
              mb: 3, 
              bgcolor: cardBgColor,
              borderRadius: 2,
              boxShadow: mode === 'dark' 
                ? '0 4px 8px rgba(0, 0, 0, 0.25)' 
                : '0 2px 4px rgba(0, 0, 0, 0.08)',
              border: mode === 'dark' 
                ? '1px solid rgba(255, 255, 255, 0.05)' 
                : '1px solid rgba(0, 0, 0, 0.05)'
            }}
          >
            {error ? (
              <Alert 
                severity="error"
                sx={{
                  '& .MuiAlert-icon': {
                    color: mode === 'dark' ? '#F87171' : '#B91C1C'
                  }
                }}
                action={
                  <Button 
                    color="inherit" 
                    size="small" 
                    onClick={fetchAccounts}
                    disabled={loading}
                  >
                    Retry
                  </Button>
                }
              >
                {error}
              </Alert>
            ) : (
              <Box>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: "medium", color: textColor }}>
                  Account Balances
                </Typography>
                <Divider sx={{ mb: 2, borderColor: dividerColor }} />
                <AccountBalances accounts={accounts} loading={loading} />
              </Box>
            )}
          </Paper>

          {/* Transactions Table Section */}
          <Paper 
            elevation={3}
            sx={{ 
              p: isMobile ? 1.5 : 3, 
              mb: 3, 
              bgcolor: cardBgColor,
              borderRadius: 2,
              boxShadow: mode === 'dark' 
                ? '0 4px 8px rgba(0, 0, 0, 0.25)' 
                : '0 2px 4px rgba(0, 0, 0, 0.08)',
              border: mode === 'dark' 
                ? '1px solid rgba(255, 255, 255, 0.05)' 
                : '1px solid rgba(0, 0, 0, 0.05)'
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "medium", color: textColor }}>
              Recent Transactions
            </Typography>
            <Divider sx={{ mb: 2, borderColor: dividerColor }} />
            <TransactionsTable 
              refreshKey={refreshKey} 
              onNewTransactionClick={handleNewTransactionClick}
            />
          </Paper>
        </Box>

        {/* Transaction Modal */}
        <TransactionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onTransactionAdded={handleTransactionAdded}
        />
      </Box>
    </Fade>
  );
};

export default Dashboard;