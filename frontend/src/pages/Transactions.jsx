import { useEffect, useState } from "react";
import axios from "axios";
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField } from "@mui/material";
import TransactionModal from "../components/TransactionModal";
import ViewTransactionModal from "../components/ViewTransactionModal";
import { useTheme } from "../context/ThemeContext"; // Import your theme context
const BASE_URL = import.meta.env.VITE_BASE_URL; 

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [search, setSearch] = useState("");
  const { mode, primaryColor } = useTheme(); // Get theme settings

  // Theme-based colors
  const cardBgColor = mode === 'dark' ? "#1E293B" : "#FFFFFF";
  const tableHeadBgColor = mode === 'dark' ? "#334155" : "#F1F5F9";
  const tableRowHoverColor = mode === 'dark' ? "#334155" : "#F8FAFC";
  const textColor = mode === 'dark' ? "#FFFFFF" : "#1E293B";
  const accentColor = primaryColor || (mode === 'dark' ? '#FACC15' : '#3B82F6');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found, user not authenticated");
        return;
      }

      const { data } = await axios.get(`${BASE_URL}/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", error.response?.data?.message || error.message);
    }
  };

  const handleTransactionClick = (transaction) => {
    setSelectedTransaction(transaction);
    setIsViewModalOpen(true);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" sx={{ color: textColor }}>Transactions</Typography>
        <Box display="flex" gap={2}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search transactions..."
            onChange={(e) => setSearch(e.target.value.toLowerCase())}
            sx={{ 
              bgcolor: cardBgColor, 
              color: textColor, 
              input: { color: textColor },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
              },
              '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'
              },
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: accentColor
              },
              '& .MuiInputBase-input::placeholder': {
                color: mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                opacity: 1
              }
            }}
          />
          <Button 
            variant="contained" 
            color="secondary" 
            onClick={() => setIsModalOpen(true)}
            sx={{
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
        </Box>
      </Box>

      <TableContainer 
        component={Paper} 
        sx={{ 
          backgroundColor: cardBgColor,
          boxShadow: mode === 'dark' 
            ? '0 4px 8px rgba(0, 0, 0, 0.25)' 
            : '0 2px 4px rgba(0, 0, 0, 0.08)'
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: tableHeadBgColor }}>
              <TableCell sx={{ color: textColor, fontWeight: 'medium' }}>Reference</TableCell>
              <TableCell sx={{ color: textColor, fontWeight: 'medium' }}>Customer</TableCell>
              <TableCell sx={{ color: textColor, fontWeight: 'medium' }}>Type</TableCell>
              <TableCell sx={{ color: textColor, fontWeight: 'medium' }}>Amount</TableCell>
              <TableCell sx={{ color: textColor, fontWeight: 'medium' }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions
              .filter((txn) => txn.customerName.toLowerCase().includes(search) || txn.reference.includes(search))
              .map((txn) => (
                <TableRow 
                  key={txn._id} 
                  sx={{ 
                    cursor: "pointer", 
                    "&:hover": { backgroundColor: tableRowHoverColor },
                    borderBottom: mode === 'dark' 
                      ? '1px solid rgba(255, 255, 255, 0.05)' 
                      : '1px solid rgba(0, 0, 0, 0.05)'
                  }} 
                  onClick={() => handleTransactionClick(txn)}
                >
                  <TableCell sx={{ color: textColor }}>{txn.reference}</TableCell>
                  <TableCell sx={{ color: textColor }}>{txn.customerName}</TableCell>
                  <TableCell sx={{ 
                    color: txn.type.includes("Cash In") 
                      ? mode === 'dark' ? "gold" : "#9F580A" // Gold in dark mode, darker amber in light mode
                      : mode === 'dark' ? "red" : "#B91C1C"  // Red in dark mode, darker red in light mode
                  }}>
                    {txn.type}
                  </TableCell>
                  <TableCell sx={{ color: textColor }}>{txn.amountTTD} TTD</TableCell>
                  <TableCell sx={{ color: textColor }}>{txn.status}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onTransactionAdded={fetchTransactions} />
      <ViewTransactionModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} transaction={selectedTransaction} />
    </Box>
  );
};

export default Transactions;