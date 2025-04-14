import PropTypes from "prop-types";
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText, 
  DialogActions, 
  TextField, 
  Button, 
  CircularProgress, 
  Stack, 
  Typography 
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";

const EmailReceiptDialog = ({ 
  open, 
  transaction, 
  email, 
  setEmail, 
  onSend, 
  onCancel, 
  loading, 
  themeProps 
}) => {
  const { 
    mode, 
    accentColor, 
    textPrimaryColor, 
    textSecondaryColor = mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
    inputBorderColor = mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.23)',
    inputHoverColor = mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'
  } = themeProps;

  return (
    <Dialog
      open={open}
      onClose={loading ? null : onCancel}
      PaperProps={{
        sx: {
          bgcolor: mode === 'dark' ? "#1E293B" : "#FFFFFF",
          color: textPrimaryColor,
          borderRadius: 2
        }
      }}
    >
      <DialogTitle sx={{ bgcolor: mode === 'dark' ? "#334155" : "#F1F5F9" }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <EmailIcon sx={{ color: accentColor }} />
          <Typography variant="h6">Send Receipt</Typography>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <DialogContentText sx={{ color: textSecondaryColor, mb: 2 }}>
          Send a receipt via email for transaction {transaction.reference}
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          label="Recipient Email"
          type="email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          InputLabelProps={{ sx: { color: textSecondaryColor } }}
          InputProps={{
            sx: { 
              color: textPrimaryColor,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: inputBorderColor,
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: inputHoverColor,
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: accentColor,
              }
            }
          }}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2, bgcolor: mode === 'dark' ? "#334155" : "#F1F5F9" }}>
        <Button 
          onClick={onCancel} 
          sx={{ color: textPrimaryColor }}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button 
          onClick={onSend} 
          variant="contained" 
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : <EmailIcon />}
          sx={{ 
            bgcolor: accentColor,
            color: mode === 'dark' ? "black" : "white",
            '&:hover': {
              bgcolor: mode === 'dark' ? 
                `${accentColor}E6` : // 90% opacity for dark mode
                `${accentColor}CC`   // 80% opacity for light mode
            }
          }}
        >
          {loading ? 'Sending...' : 'Send'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

EmailReceiptDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  transaction: PropTypes.object.isRequired,
  email: PropTypes.string.isRequired,
  setEmail: PropTypes.func.isRequired,
  onSend: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  themeProps: PropTypes.object.isRequired
};

export default EmailReceiptDialog;