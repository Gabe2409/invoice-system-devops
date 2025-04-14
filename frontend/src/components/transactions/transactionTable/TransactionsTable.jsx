import { useEffect, useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import { Box, Alert, Button, Fade, useMediaQuery } from "@mui/material";
import { useTheme as useMuiTheme } from "@mui/material/styles";
import { useTheme } from "../../../context/ThemeContext"; // Import your theme context

import SearchBar from "./SearchBar";
import FilterPanel from "./FilterPanel";
import TransactionsTableView from "./TransactionsTableView";
import ViewTransactionModal from "../viewTransactionModal/ViewTransactionModal";

const BASE_URL = import.meta.env.VITE_BASE_URL;

/**
 * Helper function to ensure we're working with an array
 * Handles different response formats from the API
 */
const ensureArray = (data) => {
  // If it's already an array, return it
  if (Array.isArray(data)) return data;
  
  // If it's an object with a property that could be an array
  if (data && data.accounts && Array.isArray(data.accounts)) {
    return data.accounts;
  }
  
  // If all else fails, return an empty array
  return [];
};

const TransactionsTable = ({ search: externalSearch, refreshKey, onNewTransactionClick }) => {
  // Get theme settings
  const muiTheme = useMuiTheme();
  const { mode, primaryColor } = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));
  
  // State for transactions and pagination
  const [transactions, setTransactions] = useState([]);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState(null);
  
  // State for modal
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  
  // State for sorting and pagination
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("createdAt");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // State for filters
  const [filters, setFilters] = useState({
    search: externalSearch || "",
    currency: "",
    type: "",
    dateFrom: "", 
    dateTo: ""
  });
  
  // Available currencies (will be fetched from API)
  const [availableCurrencies, setAvailableCurrencies] = useState([]);
  
  // UI state
  const [showFilters, setShowFilters] = useState(false);

  // Transaction types for dropdown
  const transactionTypes = ["Cash In", "Cash Out", "Buy", "Sell"];

  // Theme-based colors
  const alertBgColor = mode === 'dark' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)';
  const alertTextColor = mode === 'dark' ? '#FCA5A5' : '#B91C1C';
  const alertButtonColor = mode === 'dark' ? '#FCA5A5' : '#B91C1C';
  const accentColor = primaryColor || (mode === 'dark' ? '#FACC15' : '#3B82F6');

  useEffect(() => {
    // Update search from external props
    if (externalSearch !== undefined) {
      setFilters(prev => ({ ...prev, search: externalSearch }));
    }
  }, [externalSearch]);

  useEffect(() => {
    fetchTransactions();
    fetchAvailableCurrencies();
  }, [page, rowsPerPage, order, orderBy, refreshKey]);

  const fetchAvailableCurrencies = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found, user not authenticated");
        return;
      }

      // Fetch accounts to get available currencies
      const { data } = await axios.get(`${BASE_URL}/accounts`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Use the helper function to ensure we have an array
      const accountsArray = ensureArray(data);
      
      // Extract unique currencies from accounts
      const currencies = accountsArray.map(account => account.currency);
      setAvailableCurrencies(currencies);
    } catch (error) {
      console.error("Error fetching available currencies:", error);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found, user not authenticated");
      }

      // Build query parameters
      const params = new URLSearchParams({
        page: page + 1, // Backend uses 1-based pagination
        limit: rowsPerPage,
        sortBy: orderBy,
        sortOrder: order === 'asc' ? '1' : '-1',
        search: filters.search || '',
        ...(filters.currency && { currency: filters.currency }),
        ...(filters.type && { type: filters.type }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo })
      });

      const { data } = await axios.get(`${BASE_URL}/transactions?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Handle different response formats
      const transactionsList = data.transactions || [];
      const paginationInfo = data.pagination || { total: 0 };

      setTransactions(transactionsList);
      setTotalTransactions(paginationInfo.total);
    } catch (error) {
      console.error("Error fetching transactions:", error.response?.data?.message || error.message);
      setError(error.response?.data?.message || "Failed to load transactions. Please try again.");
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  const handleTransactionClick = (transaction) => {
    setSelectedTransaction(transaction);
    setIsViewModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsViewModalOpen(false);
    setSelectedTransaction(null);
  };

  const handleSortRequest = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTransactions();
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      currency: "",
      type: "",
      dateFrom: "",
      dateTo: ""
    });
    setPage(0);
    // Fetch with reset filters after state updates
    setTimeout(() => fetchTransactions(), 0);
  };

  const handleToggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <Fade in={true} timeout={500}>
      <Box>
        {/* Search and Filter Controls */}
        <SearchBar 
          search={filters.search}
          onSearchChange={(value) => handleFilterChange('search', value)}
          onSearchSubmit={handleSearchSubmit}
          onToggleFilters={handleToggleFilters}
          showFilters={showFilters}
          loading={loading}
          onRefresh={fetchTransactions}
          onNewTransactionClick={onNewTransactionClick}
        />

        <FilterPanel 
          show={showFilters}
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          onApplyFilters={fetchTransactions}
          availableCurrencies={availableCurrencies}
          transactionTypes={transactionTypes}
          loading={loading}
        />

        {/* Error Alert */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2,
              backgroundColor: alertBgColor,
              color: alertTextColor,
              '& .MuiAlert-icon': {
                color: alertTextColor
              }
            }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={fetchTransactions}
                sx={{ color: alertButtonColor }}
              >
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {/* Transactions Table */}
        <TransactionsTableView 
          transactions={transactions}
          loading={loading}
          initialLoad={initialLoad}
          onTransactionClick={handleTransactionClick}
          order={order}
          orderBy={orderBy}
          onSortRequest={handleSortRequest}
          page={page}
          rowsPerPage={rowsPerPage}
          totalTransactions={totalTransactions}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
          onRefresh={fetchTransactions}
          isMobile={isMobile}
        />

        {/* View Transaction Dialog */}
        <ViewTransactionModal 
          isOpen={isViewModalOpen} 
          onClose={handleCloseModal} 
          transaction={selectedTransaction} 
          onTransactionUpdated={fetchTransactions}
        />
      </Box>
    </Fade>
  );
};

// Define prop types
TransactionsTable.propTypes = {
  search: PropTypes.string,
  refreshKey: PropTypes.number,
  onNewTransactionClick: PropTypes.func
};

// Default props
TransactionsTable.defaultProps = {
  search: "",
  refreshKey: 0,
  onNewTransactionClick: null
};

export default TransactionsTable;