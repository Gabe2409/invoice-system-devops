import { useState, useRef, useEffect } from "react";
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Box, 
  IconButton,
  Alert,
  useMediaQuery,
  CircularProgress,
  Stack
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import { useTheme as useMuiTheme } from "@mui/material/styles";
import { useTheme } from "../../../context/ThemeContext";
import TransactionTypeSelector from "./TransactionTypeSelector";
import TransactionForm from "./TransactionForm";
import SignaturePad from "./SignaturePad";
import handleApiError from "../../utils/ErrorHandler";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const TransactionModal = ({ isOpen, onClose, onTransactionAdded }) => {
  const muiTheme = useMuiTheme();
  const { mode, primaryColor } = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  
  // Theme-based colors
  const dialogBgColor = mode === 'dark' ? "#0F172A" : "#FFFFFF";
  const headerBgColor = mode === 'dark' ? "#1E293B" : "#F1F5F9";
  const textColor = mode === 'dark' ? "white" : "#1E293B";
  const borderColor = mode === 'dark' ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)";
  const buttonBorderColor = mode === 'dark' ? "rgba(255, 255, 255, 0.23)" : "rgba(0, 0, 0, 0.23)";
  const buttonHoverColor = mode === 'dark' ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.04)";
  const alertBgColor = mode === 'dark' ? "rgba(211, 47, 47, 0.1)" : "rgba(211, 47, 47, 0.05)";
  const alertTextColor = mode === 'dark' ? "#FCA5A5" : "#B91C1C";
  const accentColor = primaryColor || (mode === 'dark' ? '#FACC15' : '#3B82F6');
  
  const sigCanvas = useRef(null);
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    type: "Cash In",
    amount: "",
    currency: "TTD",
    exchangeRate: "",
    amountTTD: "",
    notes: "",
  });
  const [currencies, setCurrencies] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch available currencies and account balances on modal open
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        
        // Fetch accounts data
        const { data } = await axios.get(`${BASE_URL}/accounts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // Handle both data formats (array or object with accounts property)
        const accountsArray = Array.isArray(data) 
          ? data 
          : (data && data.accounts ? data.accounts : []);
          
        // Set accounts for balance display
        setAccounts(accountsArray);
        
        // Extract currencies from accounts
        setCurrencies(accountsArray.map((account) => account.currency));
      } catch (err) {
        handleApiError(err, setError);
      }
    };

    if (isOpen) {
      fetchData();
      resetForm();
    }
  }, [isOpen]);

  // Reset form when opening modal
  const resetForm = () => {
    setFormData({
      customerName: "",
      customerEmail: "",
      type: "Cash In",
      amount: "",
      currency: "TTD",
      exchangeRate: "",
      amountTTD: "",
      notes: "",
    });
    sigCanvas.current?.clear();
    setError("");
    setFieldErrors({});
    setLoading(false);
  };

  // Frontend validation before submission
  const validateForm = () => {
    let errors = {};

    if (!formData.customerName) errors.customerName = "Customer Name is required";
    if (!formData.customerEmail) errors.customerEmail = "Customer Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.customerEmail)) {
      errors.customerEmail = "Email address is invalid";
    }
    
    if (!formData.amount || formData.amount <= 0) errors.amount = "Valid amount is required";
    
    // Buy/Sell transactions require an exchange rate
    if (["Buy", "Sell"].includes(formData.type)) {
      if (!formData.exchangeRate || formData.exchangeRate <= 0) errors.exchangeRate = "Exchange Rate is required";
    }
    
    // For SELL transactions, verify against available balance
    if (formData.type === "Sell") {
      const selectedAccount = accounts.find(acc => acc.currency === formData.currency);
      if (selectedAccount && parseFloat(formData.amount) > selectedAccount.balance) {
        errors.amount = `Insufficient balance. Available: ${selectedAccount.balance} ${formData.currency}`;
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0; // Returns true if no errors
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return; // Stop submission if validation fails
    
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }

      const signatureData = sigCanvas.current?.isEmpty() ? "" : sigCanvas.current.toDataURL();

      const response = await axios.post(
        `${BASE_URL}/transactions`,
        { ...formData, customerSignature: signatureData },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 201) {
        onTransactionAdded();
        onClose();
      }
    } catch (err) {
      handleApiError(err, setError);
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={loading ? null : onClose} 
      fullWidth 
      maxWidth="sm"
      PaperProps={{
        sx: { 
          bgcolor: dialogBgColor, 
          backgroundImage: "none",
          maxHeight: "90vh"
        }
      }}
    >
      {/* Dialog Title with Close Button */}
      <DialogTitle 
        sx={{ 
          bgcolor: headerBgColor, 
          color: textColor, 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          px: isMobile ? 2 : 3,
          py: 2
        }}
      >
        New Transaction
        <IconButton 
          onClick={loading ? null : onClose} 
          disabled={loading}
          sx={{ 
            color: textColor,
            "&.Mui-disabled": { 
              color: mode === 'dark' ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)" 
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent 
        dividers 
        sx={{ 
          bgcolor: dialogBgColor, 
          color: textColor, 
          p: isMobile ? 2 : 3,
          borderColor: borderColor
        }}
      >
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2, 
              bgcolor: alertBgColor, 
              color: alertTextColor,
              "& .MuiAlert-icon": { color: alertTextColor }
            }}
          >
            {error}
          </Alert>
        )}
        
        <form id="transaction-form" onSubmit={handleSubmit}>
          <TransactionTypeSelector type={formData.type} setType={(type) => setFormData({ ...formData, type })} />
          <TransactionForm 
            formData={formData} 
            setFormData={setFormData} 
            currencies={currencies} 
            fieldErrors={fieldErrors}
            accounts={accounts}
          />
          <SignaturePad sigCanvas={sigCanvas} />
        </form>
      </DialogContent>

      <DialogActions 
        sx={{ 
          bgcolor: headerBgColor, 
          px: isMobile ? 2 : 3,
          py: 2,
          display: "flex",
          justifyContent: "space-between"
        }}
      >
        <Stack direction="row" spacing={1}>
          <Button 
            onClick={loading ? null : onClose}
            color="inherit"
            variant="outlined"
            disabled={loading}
            sx={{ 
              borderColor: buttonBorderColor,
              color: textColor,
              "&:hover": { 
                borderColor: mode === 'dark' ? "white" : "black", 
                bgcolor: buttonHoverColor 
              }
            }}
          >
            Cancel
          </Button>
          
          <Button 
            type="submit"
            form="transaction-form"
            variant="contained"
            disabled={loading}
            sx={{ 
              bgcolor: accentColor,
              color: mode === 'dark' ? "black" : "white",
              "&:hover": { 
                bgcolor: mode === 'dark' ? `${accentColor}E6` : `${accentColor}CC`
              }
            }}
          >
            {loading ? (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <CircularProgress size={16} sx={{ mr: 1, color: "inherit" }} />
                Processing...
              </Box>
            ) : (
              "Add Transaction"
            )}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default TransactionModal;