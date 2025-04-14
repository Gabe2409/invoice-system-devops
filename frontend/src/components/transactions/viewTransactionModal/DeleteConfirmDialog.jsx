import PropTypes from "prop-types";
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  CircularProgress,
  Box
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import WarningIcon from "@mui/icons-material/Warning";

const DeleteConfirmDialog = ({ 
  open, 
  title, 
  onConfirm, 
  onCancel, 
  loading, 
  themeProps 
}) => {
  const { 
    mode,
    textPrimaryColor = mode === 'dark' ? "white" : "#1E293B"
  } = themeProps;

  return (
    <Dialog
      open={open}
      onClose={loading ? null : onCancel}
      PaperProps={{
        sx: {
          bgcolor: mode === 'dark' ? "#1E293B" : "#FFFFFF",
          color: textPrimaryColor,
          borderRadius: 2,
          maxWidth: 400
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: mode === 'dark' ? "#472B2B" : "#FEE2E2", 
        color: mode === 'dark' ? "#FCA5A5" : "#B91C1C",
        display: "flex",
        alignItems: "center",
        gap: 1
      }}>
        <WarningIcon sx={{ color: mode === 'dark' ? "#FCA5A5" : "#B91C1C" }} />
        {title}
      </DialogTitle>
      <DialogContent sx={{ py: 2, mt: 1 }}>
        <Typography variant="body1" gutterBottom sx={{ color: textPrimaryColor }}>
          Are you sure you want to delete this transaction?
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: mode === 'dark' ? '#FCA5A5' : '#B91C1C',
            fontWeight: 'medium',
            mt: 1
          }}
        >
          This will also reverse all associated account balance changes. This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2, bgcolor: mode === 'dark' ? "#2C2121" : "#FEF2F2" }}>
        <Button 
          onClick={onCancel}
          variant="outlined"
          disabled={loading}
          sx={{ 
            color: textPrimaryColor, 
            borderColor: mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.23)'
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={onConfirm} 
          variant="contained"
          color="error"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
        >
          {loading ? "Deleting..." : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

DeleteConfirmDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  themeProps: PropTypes.object.isRequired
};

export default DeleteConfirmDialog;