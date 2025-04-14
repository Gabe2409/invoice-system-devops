import { TextField, Box, Button, Typography, useMediaQuery } from "@mui/material";
import NoteAltIcon from "@mui/icons-material/NoteAlt";
import { useEffect, useState } from "react";
import { useTheme as useMuiTheme } from "@mui/material/styles";
import { useTheme } from "../../../context/ThemeContext"; 
import BalanceIndicator from "./BalanceIndicator";

const TransactionForm = ({ formData, setFormData, currencies, fieldErrors, accounts }) => {
  const [showNotes, setShowNotes] = useState(true); // Auto-expanded notes
  const muiTheme = useMuiTheme();
  const { mode, primaryColor } = useTheme(); // Get theme settings
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  
  // Theme-based colors
  const textColor = mode === 'dark' ? "white" : "#1E293B";
  const inputLabelColor = mode === 'dark' ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)";
  const inputBorderColor = mode === 'dark' ? "rgba(255, 255, 255, 0.23)" : "rgba(0, 0, 0, 0.23)";
  const inputHoverColor = mode === 'dark' ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)";
  const disabledBgColor = mode === 'dark' ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)";
  const disabledTextColor = mode === 'dark' ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)";
  const accentColor = primaryColor || (mode === 'dark' ? '#FACC15' : '#3B82F6');
  const buttonHoverColor = mode === 'dark' ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.04)";

  // Shared text field styles
  const textFieldStyles = {
    input: { color: textColor },
    "& .MuiInputBase-root": { color: textColor }, 
    "& .MuiOutlinedInput-root": {
      "& fieldset": { borderColor: inputBorderColor },
      "&:hover fieldset": { borderColor: inputHoverColor },
      "&.Mui-focused fieldset": { borderColor: accentColor },
    },
    "& .MuiInputLabel-root": { 
      color: inputLabelColor 
    },
    "& .MuiInputLabel-root.Mui-focused": { 
      color: accentColor 
    },
    "& .MuiFormHelperText-root": {
      color: "error.main"
    }
  };

  // Auto-calculate TTD amount when exchangeRate or amount changes
  useEffect(() => {
    if (["Buy", "Sell"].includes(formData.type) && formData.amount && formData.exchangeRate) {
      setFormData((prev) => ({
        ...prev,
        amountTTD: (parseFloat(prev.amount) * parseFloat(prev.exchangeRate)).toFixed(2),
      }));
    }
  }, [formData.amount, formData.exchangeRate, formData.type, setFormData]);

  // Handle input change and prevent appending values as strings
  const handleChange = (e) => {
    let { name, value } = e.target;

    // Ensure numbers don't concatenate as strings
    if (["amount", "exchangeRate", "amountTTD"].includes(name)) {
      value = value ? parseFloat(value) || "" : "";
      
      // Validate amount doesn't exceed 100 million
      if (name === "amount" && value > 100000000) {
        value = 100000000;
      }
      
      // Validate exchange rate is positive and not overly large
      if (name === "exchangeRate" && value < 0) {
        value = 0;
      } else if (name === "exchangeRate" && value > 1000) {
        value = 1000;
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle currency selection update
  const handleCurrencyChange = (currency) => {
    setFormData((prev) => ({ ...prev, currency }));
  };

  // Determine if a currency should be disabled
  const isCurrencyDisabled = (currency) => {
    return ["Buy", "Sell"].includes(formData.type) && currency === "TTD";
  };

  // If current currency is TTD and we switch to Buy/Sell, change to another currency
  useEffect(() => {
    if (["Buy", "Sell"].includes(formData.type) && formData.currency === "TTD") {
      // Find the first non-TTD currency
      const otherCurrency = currencies.find(curr => curr !== "TTD");
      if (otherCurrency) {
        setFormData(prev => ({ ...prev, currency: otherCurrency }));
      }
    }
  }, [formData.type, formData.currency, currencies, setFormData]);

  // Flag to determine if we should show balance (SELL transaction)
  const showBalance = formData.type === "Sell";

  return (
    <>
      {/* Customer Details */}
      <TextField
        label="Customer Name"
        name="customerName"
        value={formData.customerName}
        onChange={handleChange}
        fullWidth
        required
        margin="dense"
        error={!!fieldErrors.customerName}
        helperText={fieldErrors.customerName}
        sx={textFieldStyles}
      />

      <TextField
        label="Customer Email"
        name="customerEmail"
        type="email"
        value={formData.customerEmail}
        onChange={handleChange}
        fullWidth
        required
        margin="dense"
        error={!!fieldErrors.customerEmail}
        helperText={fieldErrors.customerEmail}
        sx={textFieldStyles}
      />

      {/* Currency Selection - Using regular buttons instead of ToggleButtonGroup */}
      <Typography variant="subtitle1" sx={{ color: textColor, mt: 2, mb: 1, fontWeight: "medium" }}>
        Select Currency
      </Typography>
      <Box sx={{ 
        display: "flex", 
        flexWrap: "wrap", 
        gap: 1,
        mb: 2
      }}>
        {currencies.map((currency) => {
          const isDisabled = isCurrencyDisabled(currency);
          return (
            <Button
              key={currency}
              variant={formData.currency === currency ? "contained" : "outlined"}
              onClick={() => !isDisabled && handleCurrencyChange(currency)}
              size="small"
              disabled={isDisabled}
              sx={{
                bgcolor: formData.currency === currency ? accentColor : "transparent",
                color: formData.currency === currency ? 
                  (mode === 'dark' ? "black" : "white") : 
                  (isDisabled ? disabledTextColor : textColor),
                borderColor: formData.currency === currency ? 
                  accentColor : 
                  (isDisabled ? disabledTextColor : inputBorderColor),
                minWidth: "60px",
                py: 0.75,
                opacity: isDisabled ? 0.6 : 1,
                "&:hover": { 
                  bgcolor: formData.currency === currency ? 
                    (mode === 'dark' ? `${accentColor}E6` : `${accentColor}CC`) : 
                    (isDisabled ? "transparent" : buttonHoverColor),
                  borderColor: formData.currency !== currency && !isDisabled ? 
                    (mode === 'dark' ? "white" : "black") : 
                    (isDisabled ? disabledTextColor : accentColor)
                },
              }}
            >
              {currency}
            </Button>
          );
        })}
      </Box>

      {/* Show Balance Indicator for SELL transactions */}
      {showBalance && (
        <BalanceIndicator 
          currency={formData.currency} 
          accounts={accounts}
        />
      )}

      {/* Amount Input - FIXED LAYOUT */}
      {["Buy", "Sell"].includes(formData.type) ? (
        // For Buy/Sell, display Amount and Rate inline
        <Box 
          sx={{ 
            display: "flex", 
            flexDirection: "row", 
            gap: 2, 
            width: "100%",
            alignItems: "flex-start"
          }}
        >
          <Box sx={{ width: "70%" }}>
            <TextField
              label="Amount"
              name="amount"
              type="number"
              inputProps={{ 
                min: 0, 
                max: 100000000,
                step: "any" 
              }}
              value={formData.amount}
              onChange={handleChange}
              required
              fullWidth
              margin="dense"
              error={!!fieldErrors.amount}
              // helperText={fieldErrors.amount || "Max: 100M"}
              sx={textFieldStyles}
            />
          </Box>
          <Box sx={{ width: "30%" }}>
            <TextField
              label="Rate"
              name="exchangeRate"
              type="number"
              inputProps={{ 
                min: 0.01, 
                max: 1000,
                step: "any" 
              }}
              value={formData.exchangeRate}
              onChange={handleChange}
              required
              fullWidth
              margin="dense"
              error={!!fieldErrors.exchangeRate}
              helperText={fieldErrors.exchangeRate}
              sx={textFieldStyles}
            />
          </Box>
        </Box>
      ) : (
        // For Cash In/Out, just display Amount
        <TextField
          label="Amount"
          name="amount"
          type="number"
          inputProps={{ 
            min: 0, 
            max: 100000000,
            step: "any" 
          }}
          value={formData.amount}
          onChange={handleChange}
          fullWidth
          required
          margin="dense"
          error={!!fieldErrors.amount}
          // helperText={fieldErrors.amount || "Max: 100M"}
          sx={textFieldStyles}
        />
      )}
      
      {/* Amount in TTD (only for Buy/Sell) in its own row */}
      {["Buy", "Sell"].includes(formData.type) && (
        <TextField
          label="Amount (TTD)"
          name="amountTTD"
          type="number"
          value={formData.amountTTD}
          margin="dense"
          // Change to readonly instead of disabled for better UI
          InputProps={{ readOnly: true }}
          fullWidth
          sx={{
            ...textFieldStyles,
            mb: 1,
            "& .MuiInputBase-root.Mui-readOnly": { 
              backgroundColor: disabledBgColor
            }
          }}
        />
      )}

      {/* Notes Field - Always expanded */}
      <TextField
        label="Notes"
        name="notes"
        multiline
        rows={3}
        value={formData.notes}
        onChange={handleChange}
        fullWidth
        margin="dense"
        sx={{
          ...textFieldStyles,
          mt: 1
        }}
      />
    </>
  );
};

export default TransactionForm;