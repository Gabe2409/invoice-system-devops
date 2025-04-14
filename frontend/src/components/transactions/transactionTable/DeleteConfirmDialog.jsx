import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  IconButton,
  Box,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTheme } from "../../../context/ThemeContext"; // Import your theme context

const DeleteConfirmDialog = ({
  open,
  title,
  content,
  onConfirm,
  onCancel,
  loading = false,
  confirmButtonText = "Delete",
  cancelButtonText = "Cancel",
}) => {
  const { mode, primaryColor } = useTheme(); // Get theme settings
  
  // Theme-based colors
  const dialogBgColor = mode === 'dark' ? "#1E293B" : "#FFFFFF";
  const headerBgColor = mode === 'dark' ? "#334155" : "#F1F5F9";
  const textColor = mode === 'dark' ? "white" : "#1E293B";
  const warningColor = mode === 'dark' ? "#FCA5A5" : "#B91C1C"; // Light red for dark mode, darker red for light mode
  const accentColor = primaryColor || (mode === 'dark' ? '#FACC15' : '#3B82F6');
  
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      slotProps={{
        paper: {
          sx: {
            bgcolor: dialogBgColor,
            color: textColor,
            borderRadius: 2,
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: headerBgColor,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <DeleteIcon sx={{ color: warningColor }} />
          <Typography variant="h6" sx={{ color: warningColor, fontWeight: 'medium' }}>
            {title}
          </Typography>
        </Box>
        <IconButton onClick={onCancel} size="small" sx={{ color: textColor }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent 
        sx={{ 
          p: 3,
          borderTop: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
          borderBottom: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
        }}
      >
        {/* Content will automatically use the text color from the Dialog */}
        {content}
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: headerBgColor }}>
        <Button 
          onClick={onCancel} 
          color="inherit" 
          disabled={loading}
          sx={{ color: textColor }}
        >
          {cancelButtonText}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          disabled={loading}
          sx={{
            bgcolor: warningColor,
            color: mode === 'dark' ? '#1E293B' : 'white',
            '&:hover': {
              bgcolor: mode === 'dark' ? '#F87171' : '#991B1B',
            }
          }}
          startIcon={
            loading ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <DeleteIcon />
            )
          }
        >
          {loading ? "Deleting..." : confirmButtonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Define PropTypes
DeleteConfirmDialog.propTypes = {
  open: PropTypes.bool.isRequired, // Must be a boolean, required
  title: PropTypes.string.isRequired, // Must be a string, required
  content: PropTypes.node.isRequired, // Accepts elements, text, or components
  onConfirm: PropTypes.func.isRequired, // Must be a function, required
  onCancel: PropTypes.func.isRequired, // Must be a function, required
  loading: PropTypes.bool, // Boolean, optional (defaults to false)
  confirmButtonText: PropTypes.string, // Optional string
  cancelButtonText: PropTypes.string, // Optional string
};

// Define Default Props
DeleteConfirmDialog.defaultProps = {
  loading: false,
  confirmButtonText: "Delete",
  cancelButtonText: "Cancel",
};

export default DeleteConfirmDialog;