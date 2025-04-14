import { useState } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Divider,
  IconButton,
  Avatar,
  Chip,
  useMediaQuery
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SecurityIcon from "@mui/icons-material/Security";
import PersonIcon from "@mui/icons-material/Person";
import { format } from "date-fns";
import { useTheme as useMuiTheme } from "@mui/material/styles";
import { useTheme } from "../../../context/ThemeContext";
import { stringAvatar } from "../../../utils/utils";
import DeleteConfirmDialog from "./DeleteConfirmDialog";

const ViewUserModal = ({ isOpen, onClose, user, onEdit, onDelete }) => {
  const muiTheme = useMuiTheme();
  const { mode, primaryColor } = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Theme-based colors
  const dialogBgColor = mode === 'dark' ? "#1E293B" : "#FFFFFF";
  const headerBgColor = mode === 'dark' ? "#334155" : "#F1F5F9";
  const textColor = mode === 'dark' ? "white" : "#1E293B";
  const secondaryTextColor = mode === 'dark' ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)";
  const dividerColor = mode === 'dark' ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)";
  const accentColor = primaryColor || (mode === 'dark' ? '#FACC15' : '#3B82F6');
  const warningColor = mode === 'dark' ? "#FCA5A5" : "#B91C1C";
  
  if (!user) return null;
  
  // Check if the user is an admin
  const isAdmin = user.role === 'admin';
  
  // Role styling
  const roleChipStyle = isAdmin 
    ? {
        bgcolor: mode === 'dark' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(220, 38, 38, 0.1)',
        color: mode === 'dark' ? '#FCA5A5' : '#991B1B',
      }
    : {
        bgcolor: mode === 'dark' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(5, 150, 105, 0.1)',
        color: mode === 'dark' ? '#6EE7B7' : '#065F46',
      };
  
  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await onDelete();
    setIsDeleting(false);
    
    if (result?.success) {
      setShowDeleteConfirm(false);
    }
  };
  
  return (
    <>
      <Dialog
        open={isOpen}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              bgcolor: dialogBgColor,
              color: textColor,
              borderRadius: 2,
              ...(isMobile && { margin: 2 })
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
            p: 2
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: "medium" }}>
              User Details
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: textColor }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          {/* User Header with Avatar */}
          <Box sx={{ p: 3, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <Avatar
              {...stringAvatar(user.fullName)}
              sx={{ width: 80, height: 80, fontSize: 32, bgcolor: accentColor }}
            />
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: "medium" }}>
                {user.fullName}
              </Typography>
              <Typography variant="body1" color={secondaryTextColor}>
                @{user.userName}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Chip
                  icon={isAdmin ? <SecurityIcon /> : <PersonIcon />}
                  label={user.role.toUpperCase()}
                  sx={{
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    fontSize: "0.75rem",
                    ...roleChipStyle
                  }}
                />
              </Box>
            </Box>
          </Box>

          <Divider sx={{ borderColor: dividerColor }} />
          
          {/* User Details */}
          <Box sx={{ p: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color={secondaryTextColor}>
                  Username
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {user.userName}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color={secondaryTextColor}>
                  Full Name
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {user.fullName}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color={secondaryTextColor}>
                  Role
                </Typography>
                <Typography variant="body1" gutterBottom textTransform="capitalize">
                  {user.role}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color={secondaryTextColor}>
                  Created Date
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {user.createdAt
                    ? format(new Date(user.createdAt), "dd MMM yyyy")
                    : "N/A"}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color={secondaryTextColor}>
                  Last Login
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {user.lastLogin
                    ? format(new Date(user.lastLogin), "dd MMM yyyy HH:mm")
                    : "Never"}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, bgcolor: headerBgColor }}>
          <Button 
            variant="outlined" 
            onClick={onClose}
            sx={{ 
              borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)',
              color: textColor,
              '&:hover': { 
                borderColor: mode === 'dark' ? 'white' : 'rgba(0, 0, 0, 0.7)'
              }
            }}
          >
            Close
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<DeleteIcon />}
            onClick={() => setShowDeleteConfirm(true)}
            sx={{ 
              borderColor: warningColor,
              color: warningColor,
              '&:hover': {
                borderColor: warningColor,
                bgcolor: mode === 'dark' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(220, 38, 38, 0.05)',
              }
            }}
          >
            Delete
          </Button>
          
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={onEdit}
            sx={{ 
              bgcolor: accentColor,
              '&:hover': {
                bgcolor: mode === 'dark' ? 
                  `${accentColor}E6` : // 90% opacity version for dark mode
                  `${accentColor}CC`   // 80% opacity version for light mode
              }
            }}
          >
            Edit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={showDeleteConfirm}
        title="Delete User"
        content={
          <Box>
            <Typography>
              Are you sure you want to delete user <strong>{user.fullName}</strong>?
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, color: mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)' }}>
              This action cannot be undone. This user will no longer be able to access the system.
            </Typography>
          </Box>
        }
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        loading={isDeleting}
        confirmButtonText="Delete User"
      />
    </>
  );
};

ViewUserModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.shape({
    _id: PropTypes.string,
    userName: PropTypes.string,
    fullName: PropTypes.string,
    role: PropTypes.string,
    createdAt: PropTypes.string,
    lastLogin: PropTypes.string
  }),
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};

export default ViewUserModal;