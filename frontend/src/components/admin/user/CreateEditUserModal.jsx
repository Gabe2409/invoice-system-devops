import { useState } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  IconButton,
  InputAdornment,
  FormHelperText,
  useMediaQuery
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import SecurityIcon from "@mui/icons-material/Security";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useTheme as useMuiTheme } from "@mui/material/styles";
import { useTheme } from "../../../context/ThemeContext";

const CreateEditUserModal = ({ isOpen, onClose, user, mode, onSubmit, availableRoles }) => {
  const muiTheme = useMuiTheme();
  const { mode: themeMode, primaryColor } = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  
  // State for form fields and validation
  const [formData, setFormData] = useState({
    userName: user?.userName || '',
    fullName: user?.fullName || '',
    pin: '',
    role: user?.role || 'staff'
  });
  
  const [showPin, setShowPin] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Theme-based colors
  const dialogBgColor = themeMode === 'dark' ? "#1E293B" : "#FFFFFF";
  const headerBgColor = themeMode === 'dark' ? "#334155" : "#F1F5F9";
  const textColor = themeMode === 'dark' ? "white" : "#1E293B";
  const labelColor = themeMode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)';
  const borderColor = themeMode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)';
  const accentColor = primaryColor || (themeMode === 'dark' ? '#FACC15' : '#3B82F6');
  const errorColor = themeMode === 'dark' ? '#FCA5A5' : '#B91C1C';
  
  // Modal title based on mode
  const title = mode === 'create' ? 'Create New User' : 'Edit User';
  
  // Reset form when user changes or dialog opens/closes
  const resetForm = () => {
    setFormData({
      userName: user?.userName || '',
      fullName: user?.fullName || '',
      pin: '',
      role: user?.role || 'staff'
    });
    setErrors({});
    setApiError('');
    setShowPin(false);
  };
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear validation errors on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    
    // Clear API error on any change
    if (apiError) {
      setApiError('');
    }
  };
  
  // Validate the form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.userName.trim()) {
      newErrors.userName = 'Username is required';
    } else if (formData.userName.trim().length < 3) {
      newErrors.userName = 'Username must be at least 3 characters';
    }
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (mode === 'create' && (!formData.pin || formData.pin.length !== 4)) {
      newErrors.pin = 'PIN must be exactly 4 digits';
    } else if (mode === 'create' && !/^[0-9]+$/.test(formData.pin)) {
      newErrors.pin = 'PIN must contain only digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    // Create data object for API - only include PIN if creating a new user or if it was changed
    const userData = {
      userName: formData.userName.trim(),
      fullName: formData.fullName.trim(),
      role: formData.role
    };
    
    // Only include PIN if it's provided (for create mode, PIN is required)
    if (formData.pin) {
      userData.pin = formData.pin;
    }
    
    const result = await onSubmit(userData, mode === 'edit');
    
    setLoading(false);
    
    if (result?.error) {
      setApiError(result.error);
    } else if (result?.success) {
      onClose();
    }
  };
  
  return (
    <Dialog
      open={isOpen}
      onClose={() => {
        resetForm();
        onClose();
      }}
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
            {title}
          </Typography>
        </Box>
        <IconButton 
          onClick={() => {
            resetForm();
            onClose();
          }} 
          size="small" 
          sx={{ color: textColor }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 3 }}>
          {/* API Error Alert */}
          {apiError && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2,
                backgroundColor: themeMode === 'dark' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)', 
                color: errorColor
              }}
            >
              {apiError}
            </Alert>
          )}

          {/* User Form Fields */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Username"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              error={!!errors.userName}
              helperText={errors.userName}
              fullWidth
              InputLabelProps={{ sx: { color: labelColor } }}
              InputProps={{
                sx: { 
                  color: textColor,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: errors.userName ? errorColor : borderColor,
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: errors.userName ? errorColor : (themeMode === 'dark' ? 'white' : 'rgba(0, 0, 0, 0.7)'),
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: errors.userName ? errorColor : accentColor,
                  }
                }
              }}
              disabled={mode === 'edit'} // Username cannot be changed in edit mode
            />
            
            <TextField
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              error={!!errors.fullName}
              helperText={errors.fullName}
              fullWidth
              InputLabelProps={{ sx: { color: labelColor } }}
              InputProps={{
                sx: { 
                  color: textColor,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: errors.fullName ? errorColor : borderColor,
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: errors.fullName ? errorColor : (themeMode === 'dark' ? 'white' : 'rgba(0, 0, 0, 0.7)'),
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: errors.fullName ? errorColor : accentColor,
                  }
                }
              }}
            />
            
            {/* PIN Field - Only shown in create mode or when explicitly editing PIN */}
            {(mode === 'create') && (
              <TextField
                label="PIN"
                name="pin"
                value={formData.pin}
                onChange={handleChange}
                error={!!errors.pin}
                helperText={errors.pin || "4-digit PIN for login"}
                fullWidth
                type={showPin ? 'text' : 'password'}
                InputLabelProps={{ sx: { color: labelColor } }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle pin visibility"
                        onClick={() => setShowPin(!showPin)}
                        edge="end"
                        sx={{ color: textColor }}
                      >
                        {showPin ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: { 
                    color: textColor,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: errors.pin ? errorColor : borderColor,
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: errors.pin ? errorColor : (themeMode === 'dark' ? 'white' : 'rgba(0, 0, 0, 0.7)'),
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: errors.pin ? errorColor : accentColor,
                    }
                  }
                }}
                inputProps={{ maxLength: 4 }}
              />
            )}
            
            {mode === 'edit' && (
              <Box sx={{ 
                p: 2, 
                borderRadius: 1, 
                bgcolor: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <InfoOutlinedIcon color="info" fontSize="small" />
                <Typography variant="body2" color={themeMode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'}>
                  PIN changes are not supported in this form. If needed, reset the user's PIN separately.
                </Typography>
              </Box>
            )}
            
            <FormControl fullWidth>
              <InputLabel 
                id="role-select-label" 
                sx={{ 
                  color: labelColor,
                  '&.Mui-focused': {
                    color: accentColor,
                  }
                }}
              >
                Role
              </InputLabel>
              <Select
                labelId="role-select-label"
                name="role"
                value={formData.role}
                onChange={handleChange}
                label="Role"
                sx={{ 
                  color: textColor,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: borderColor,
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: themeMode === 'dark' ? 'white' : 'rgba(0, 0, 0, 0.7)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: accentColor,
                  }
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      bgcolor: dialogBgColor,
                      color: textColor,
                      '& .MuiMenuItem-root': {
                        '&:hover': {
                          bgcolor: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)'
                        },
                        '&.Mui-selected': {
                          bgcolor: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.08)',
                          '&:hover': {
                            bgcolor: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.24)' : 'rgba(0, 0, 0, 0.12)'
                          }
                        }
                      }
                    }
                  }
                }}
              >
                {availableRoles.map((role) => (
                  <MenuItem key={role} value={role}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {role === 'admin' && <SecurityIcon fontSize="small" sx={{ color: themeMode === 'dark' ? '#FCA5A5' : '#991B1B' }} />}
                      <Typography sx={{ textTransform: 'capitalize' }}>{role}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText sx={{ color: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)' }}>
                {formData.role === 'admin' ? 'Admins have full access to all system features' : 'Staff have limited access to system features'}
              </FormHelperText>
            </FormControl>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, bgcolor: headerBgColor }}>
          <Button 
            onClick={() => {
              resetForm();
              onClose();
            }}
            sx={{ 
              color: textColor,
              '&:hover': {
                bgcolor: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)'
              }
            }}
            disabled={loading}
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            variant="contained"
            startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
            disabled={loading}
            sx={{ 
              bgcolor: accentColor,
              '&:hover': {
                bgcolor: themeMode === 'dark' ? 
                  `${accentColor}E6` : // 90% opacity version for dark mode
                  `${accentColor}CC`   // 80% opacity version for light mode
              }
            }}
          >
            {loading ? 'Saving...' : (mode === 'create' ? 'Create User' : 'Save Changes')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

CreateEditUserModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.shape({
    _id: PropTypes.string,
    userName: PropTypes.string,
    fullName: PropTypes.string,
    role: PropTypes.string
  }),
  mode: PropTypes.oneOf(['create', 'edit']).isRequired,
  onSubmit: PropTypes.func.isRequired,
  availableRoles: PropTypes.array.isRequired
};

export default CreateEditUserModal;