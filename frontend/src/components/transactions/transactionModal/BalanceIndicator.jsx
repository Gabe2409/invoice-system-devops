import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { useTheme as useMuiTheme } from "@mui/material/styles";
import { useTheme } from "../../../context/ThemeContext";
import { formatCurrency, getCurrencyColor, getCurrencySymbol } from "../../../utils/utils";

const BalanceIndicator = ({ currency, accounts }) => {
  const muiTheme = useMuiTheme();
  const { mode, primaryColor } = useTheme();
  
  // Theme-based colors
  const textColor = mode === 'dark' ? "white" : "#1E293B";
  const textSecondaryColor = mode === 'dark' ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)";
  const bgColor = mode === 'dark' ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)";
  const borderColor = mode === 'dark' ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)";
  const accentColor = primaryColor || (mode === 'dark' ? '#FACC15' : '#3B82F6');
  
  // Convert accounts to array if needed
  const accountsArray = Array.isArray(accounts) 
    ? accounts 
    : (accounts && accounts.accounts ? accounts.accounts : []);
  
  // Find the selected currency account
  const account = accountsArray.find(acc => acc.currency === currency);
  
  // If account not found or not selling, don't display
  if (!account) {
    return null;
  }
  
  const balance = account.balance;
  const formattedBalance = formatCurrency(balance, currency);
  
  // Get currency properties for display
  const currencySymbol = getCurrencySymbol(currency);
  const currencyColor = getCurrencyColor(currency);
  
  return (
    <Box 
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: '8px',
        p: 1,
        mb: 2,
        mt: 1
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            backgroundColor: currencyColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 1
          }}
        >
          <Typography sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.8rem' }}>
            {currencySymbol}
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: textSecondaryColor }}>
          Available Balance
        </Typography>
      </Box>
      <Chip
        label={formattedBalance}
        sx={{
          backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.07)',
          color: accentColor,
          fontWeight: 'bold',
          border: `1px solid ${accentColor}20`
        }}
        size="small"
      />
    </Box>
  );
};

export default BalanceIndicator;