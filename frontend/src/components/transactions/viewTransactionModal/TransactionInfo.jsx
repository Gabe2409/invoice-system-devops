import { format } from "date-fns";
import PropTypes from "prop-types";
import { Box, Typography, TextField, Paper, Stack, Chip, Avatar } from "@mui/material";
import AttachmentIcon from "@mui/icons-material/Attachment";
import PersonIcon from "@mui/icons-material/Person";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import EventIcon from "@mui/icons-material/Event";
import { formatCurrency, stringAvatar } from "../../../utils/utils";

const TransactionInfo = ({ transaction, editMode, editedTransaction, handleFieldChange, themeProps }) => {
  const { 
    mode, 
    accentColor, 
    textPrimaryColor, 
    textSecondaryColor = mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
    paperBgColor = mode === 'dark' ? 'rgba(15, 23, 42, 0.4)' : 'rgba(241, 245, 249, 0.4)',
    borderColor = mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    inputBorderColor = mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.23)'
  } = themeProps;

  const createdDate = transaction.createdAt 
    ? format(new Date(transaction.createdAt), "dd MMM yyyy HH:mm")
    : "N/A";

  return (
    <>
      <Paper 
        elevation={0}
        sx={{ 
          bgcolor: paperBgColor, 
          p: 2, 
          borderRadius: 2,
          border: `1px solid ${borderColor}`
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, color: accentColor }}>
          Transaction Information
        </Typography>
        
        <Stack spacing={2}>
          {/* Reference */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
            <AttachmentIcon sx={{ color: accentColor, mt: 0.5 }} />
            <Box>
              <Typography variant="body2" sx={{ color: textSecondaryColor }}>
                Reference
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                {transaction.reference}
              </Typography>
            </Box>
          </Box>
          
          {/* Customer */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
            <PersonIcon sx={{ color: accentColor, mt: 0.5 }} />
            <Box sx={{ width: '100%' }}>
              <Typography variant="body2" sx={{ color: textSecondaryColor }}>
                Customer
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                {transaction.customerName}
              </Typography>
              
              {editMode ? (
                <TextField
                  fullWidth
                  placeholder="Customer Email"
                  variant="outlined"
                  size="small"
                  value={editedTransaction.customerEmail}
                  onChange={(e) => handleFieldChange("customerEmail", e.target.value)}
                  sx={{
                    mt: 1,
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: inputBorderColor },
                      '&:hover fieldset': { borderColor: accentColor },
                      '&.Mui-focused fieldset': { borderColor: accentColor }
                    },
                    input: { color: textPrimaryColor }
                  }}
                />
              ) : (
                <Typography variant="body2" sx={{ color: mode === 'dark' ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)' }}>
                  {transaction.customerEmail || "Email not provided"}
                </Typography>
              )}
            </Box>
          </Box>
          
          {/* Amount */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
            <CreditCardIcon sx={{ color: accentColor, mt: 0.5 }} />
            <Box>
              <Typography variant="body2" sx={{ color: textSecondaryColor }}>
                Amount
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                {formatCurrency(transaction.amount, transaction.currency)}
              </Typography>
              {["Buy", "Sell"].includes(transaction.type) && transaction.amountTTD && (
                <Typography variant="body2" sx={{ color: accentColor }}>
                  {formatCurrency(transaction.amountTTD, "TTD")}
                </Typography>
              )}
              {transaction.exchangeRate > 0 && (
                <Typography variant="body2" sx={{ color: textSecondaryColor, mt: 0.5 }}>
                  Exchange Rate: {transaction.exchangeRate}
                </Typography>
              )}
            </Box>
          </Box>
          
          {/* Date */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
            <EventIcon sx={{ color: accentColor, mt: 0.5 }} />
            <Box>
              <Typography variant="body2" sx={{ color: textSecondaryColor }}>
                Date & Status
              </Typography>
              <Typography variant="body1">
                {createdDate}
              </Typography>
              <Chip 
                label={transaction.status || "Completed"} 
                size="small"
                sx={{ 
                  mt: 0.5,
                  bgcolor: transaction.status === 'Cancelled' ? 
                    (mode === 'dark' ? 'error.dark' : 'error.light') : 
                  transaction.status === 'Pending' ? 
                    (mode === 'dark' ? 'warning.dark' : 'warning.light') : 
                    (mode === 'dark' ? 'success.dark' : 'success.light'),
                  color: mode === 'dark' ? 'white' : 'rgba(0,0,0,0.87)'
                }}
              />
            </Box>
          </Box>
        </Stack>
      </Paper>
      
      {/* Created By Section */}
      {transaction.createdBy && (
        <Box 
          sx={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 1.5, 
            mt: 2,
            p: 1.5,
            borderRadius: 2,
            bgcolor: paperBgColor,
            border: `1px solid ${borderColor}`
          }}
        >
          <Avatar 
            {...stringAvatar(transaction.createdBy.fullName || "Unknown User")}
            sx={{ width: 40, height: 40 }}
          />
          <Box>
            <Typography variant="body2" sx={{ color: textSecondaryColor }}>
              Created by
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
              {transaction.createdBy.fullName || "Unknown"}
            </Typography>
          </Box>
        </Box>
      )}
    </>
  );
};

TransactionInfo.propTypes = {
  transaction: PropTypes.object.isRequired,
  editMode: PropTypes.bool.isRequired,
  editedTransaction: PropTypes.object.isRequired,
  handleFieldChange: PropTypes.func.isRequired,
  themeProps: PropTypes.object.isRequired
};

export default TransactionInfo;