import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    FormControlLabel,
    Switch,
    Box,
    Typography,
    Divider,
    IconButton,
    Alert
  } from "@mui/material"
  import CloseIcon from "@mui/icons-material/Close"
  import { useTheme } from "../../context/ThemeContext"
  import { useState } from "react"
  
  const SaveReportDialog = ({ open, onClose, onSave, reportType }) => {
    const { mode, primaryColor } = useTheme()
    const backgroundColor = mode === 'dark' ? "#1E293B" : "#FFFFFF"
    const textColor = mode === 'dark' ? "#FFFFFF" : "#1E293B"
    const accentColor = primaryColor || (mode === 'dark' ? '#FACC15' : '#3B82F6')
    
    const [reportName, setReportName] = useState("")
    const [isShared, setIsShared] = useState(false)
    const [error, setError] = useState("")
    const [isSaving, setIsSaving] = useState(false)
  
    const handleSave = async () => {
      if (!reportName.trim()) {
        setError("Please enter a report name")
        return
      }
  
      setIsSaving(true)
      try {
        const success = await onSave(reportName, isShared)
        if (success) {
          resetAndClose()
        } else {
          setError("Failed to save report. Please try again.")
        }
      } catch (err) {
        setError(err.message || "Failed to save report")
      } finally {
        setIsSaving(false)
      }
    }
  
    const resetAndClose = () => {
      setReportName("")
      setIsShared(false)
      setError("")
      onClose()
    }
  
    const getReportTypeLabel = () => {
      switch (reportType) {
        case 'revenue':
          return 'Revenue Analysis'
        case 'currency':
          return 'Currency Summary'
        case 'transactions':
          return 'Transaction Type Analysis'
        case 'customers':
          return 'Customer Analytics'
        default:
          return 'Financial Report'
      }
    }
  
    return (
      <Dialog 
        open={open} 
        onClose={resetAndClose}
        PaperProps={{
          sx: { bgcolor: backgroundColor, color: textColor }
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 2 }}>
          <Typography variant="h6" component="div">
            Save Report
          </Typography>
          <IconButton
            aria-label="close"
            onClick={resetAndClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        
        <DialogContent sx={{ mt: 1 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <TextField
            autoFocus
            margin="dense"
            label="Report Name"
            type="text"
            fullWidth
            variant="outlined"
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            InputLabelProps={{ 
              sx: { color: mode === 'dark' ? 'rgba(255,255,255,0.7)' : undefined } 
            }}
          />
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Report Type: {getReportTypeLabel()}
            </Typography>
          </Box>
          
          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={isShared}
                  onChange={(e) => setIsShared(e.target.checked)}
                  color="primary"
                />
              }
              label="Share this report with other users"
            />
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={resetAndClose} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            disabled={isSaving || !reportName.trim()}
            sx={{ 
              bgcolor: accentColor,
              '&:hover': {
                bgcolor: mode === 'dark' ? 
                  `${accentColor}E6` : // 90% opacity version for dark mode
                  `${accentColor}CC`   // 80% opacity version for light mode
              }
            }}
          >
            {isSaving ? "Saving..." : "Save Report"}
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
  
  export default SaveReportDialog
