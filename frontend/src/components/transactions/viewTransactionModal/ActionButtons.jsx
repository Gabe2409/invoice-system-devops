import PropTypes from "prop-types";
import { Box, Button, IconButton, Stack, Tooltip, CircularProgress, useMediaQuery, DialogActions } from "@mui/material";
import { useTheme as useMuiTheme } from "@mui/material/styles";

// Icons
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import EmailIcon from "@mui/icons-material/Email";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import PrintIcon from "@mui/icons-material/Print";

const ActionButtons = ({
  editMode,
  canEdit,
  loading,
  isDeleting,
  handleEditClick,
  handleDeleteClick,
  handleCancelEdit,
  handleSaveClick,
  handleGeneratePDF,
  handlePrint,
  handleSendReceiptClick,
  onClose,
  themeProps
}) => {
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  
  const {
    mode,
    accentColor,
    textPrimaryColor,
    inputBorderColor = mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.23)'
  } = themeProps;

  return (
    <DialogActions 
      sx={{ 
        justifyContent: "space-between", 
        padding: 2,
        px: { xs: 2, sm: 3 }
      }}
    >
      {/* Left side actions (Edit/Delete) */}
      <Box>
        {canEdit && !editMode && (
          <>
            <Tooltip title="Delete Transaction">
              <IconButton 
                onClick={handleDeleteClick} 
                color="error" 
                disabled={loading || isDeleting}
                sx={{ mr: 1 }}
              >
                {isDeleting ? <CircularProgress size={24} color="error" /> : <DeleteIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit Transaction">
              <IconButton 
                onClick={handleEditClick} 
                disabled={loading || isDeleting}
                sx={{ color: accentColor }}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Box>
      
      {/* Right side actions */}
      <Stack 
        direction="row" 
        spacing={{ xs: 1, sm: 2 }}
        sx={{ 
          alignItems: "center",
          flexWrap: "nowrap"
        }}
      >
        {editMode ? (
          // Edit mode buttons
          <>
            <Button 
              onClick={handleCancelEdit} 
              variant="outlined"
              startIcon={<CancelIcon />}
              disabled={loading}
              sx={{ 
                color: textPrimaryColor, 
                borderColor: inputBorderColor,
                '&:hover': { borderColor: mode === 'dark' ? "white" : "black" }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveClick} 
              variant="contained"
              startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
              disabled={loading}
              sx={{ bgcolor: accentColor, color: mode === 'dark' ? "black" : "white" }}
            >
              Save
            </Button>
          </>
        ) : (
          // Normal mode buttons
          <>
            {/* Download PDF Button */}
            <Tooltip title="Download PDF">
              <IconButton
                onClick={handleGeneratePDF}
                color="primary"
                size="medium"
                sx={{ 
                  display: { xs: 'flex', sm: 'flex' },
                }}
              >
                <PictureAsPdfIcon />
              </IconButton>
            </Tooltip>
            
            {/* Print Button */}
            <Tooltip title="Print Receipt">
              <IconButton
                onClick={handlePrint}
                color="primary"
                size="medium"
              >
                <PrintIcon />
              </IconButton>
            </Tooltip>
            
            {/* Send Receipt Button */}
            <Tooltip title="Email Receipt">
              <IconButton
                onClick={handleSendReceiptClick}
                color="primary"
                size="medium"
                disabled={loading}
                sx={{ 
                  bgcolor: accentColor,
                  color: mode === 'dark' ? "black" : "white",
                  '&:hover': {
                    bgcolor: mode === 'dark' ? 
                      `${accentColor}E6` : // 90% opacity for dark mode
                      `${accentColor}CC`   // 80% opacity for light mode
                  },
                  width: 40,
                  height: 40
                }}
              >
                {loading ? <CircularProgress size={24} /> : <EmailIcon />}
              </IconButton>
            </Tooltip>
          </>
        )}
      </Stack>
    </DialogActions>
  );
};

ActionButtons.propTypes = {
  editMode: PropTypes.bool.isRequired,
  canEdit: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
  isDeleting: PropTypes.bool.isRequired,
  handleEditClick: PropTypes.func.isRequired,
  handleDeleteClick: PropTypes.func.isRequired,
  handleCancelEdit: PropTypes.func.isRequired,
  handleSaveClick: PropTypes.func.isRequired,
  handleGeneratePDF: PropTypes.func.isRequired,
  handlePrint: PropTypes.func.isRequired,
  handleSendReceiptClick: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  themeProps: PropTypes.object.isRequired
};

export default ActionButtons;