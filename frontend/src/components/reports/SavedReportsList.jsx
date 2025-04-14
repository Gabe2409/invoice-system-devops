import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
  Paper,
  Typography,
  Chip,
  Box,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
} from "@mui/material"
import ScheduleIcon from "@mui/icons-material/Schedule"
import ShareIcon from "@mui/icons-material/Share"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"
import FileCopyIcon from "@mui/icons-material/FileCopy"
import { useTheme } from "../../context/ThemeContext"
import { useContext, useState } from "react"
import { AuthContext } from "../../context/AuthContext"
import { format } from "date-fns"

const SavedReportsList = ({ reports, onReportSelect, onReportMenuOpen }) => {
  const { mode, primaryColor } = useTheme()
  const backgroundColor = mode === 'dark' ? "#1E293B" : "#FFFFFF"
  const textColor = mode === 'dark' ? "#FFFFFF" : "#1E293B"
  const accentColor = primaryColor || (mode === 'dark' ? '#FACC15' : '#3B82F6')
  
  // Auth context and check for user role
  const { user } = useContext(AuthContext)
  const isAdmin = user && user.role === 'admin'
  
  const [menuAnchorEl, setMenuAnchorEl] = useState(null)
  const [selectedReportId, setSelectedReportId] = useState(null)
  const [selectedReport, setSelectedReport] = useState(null)
  
  if (!reports || reports.length === 0) {
    return (
      <Paper sx={{ p: 4, bgcolor: backgroundColor, color: textColor }}>
        <Typography variant="h6" color="textSecondary" align="center" gutterBottom>
          No saved reports found
        </Typography>
        <Typography variant="body1" color="textSecondary" align="center">
          Create your first report by applying filters and clicking "Save Report".
        </Typography>
      </Paper>
    )
  }

  const handleMenuOpen = (event, reportId, report) => {
    event.stopPropagation()
    setMenuAnchorEl(event.currentTarget)
    setSelectedReportId(reportId)
    setSelectedReport(report)
  }

  const handleMenuClose = () => {
    setMenuAnchorEl(null)
    setSelectedReportId(null)
    setSelectedReport(null)
  }

  const handleMenuAction = (action) => {
    if (onReportMenuOpen) {
      onReportMenuOpen(action, selectedReportId)
    }
    handleMenuClose()
  }

  // Check if user can edit this report
  const canEditReport = (report) => {
    if (isAdmin) return true
    return report.createdBy && user && report.createdBy._id === user._id
  }

  const getReportTypeColor = (type) => {
    switch (type) {
      case 'revenue':
        return '#8884d8'
      case 'currency':
        return '#82ca9d'
      case 'transactions':
        return '#ffc658'
      case 'customers':
        return '#ff8042'
      default:
        return accentColor
    }
  }

  return (
    <Paper sx={{ bgcolor: backgroundColor, color: textColor }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" color={textColor}>
          Saved Reports
        </Typography>
      </Box>
      <Divider />
      <List sx={{ p: 0 }}>
        {reports.map((report) => (
          <ListItem 
            key={report._id} 
            button 
            onClick={() => onReportSelect(report._id)}
            sx={{ 
              borderBottom: '1px solid',
              borderColor: 'divider',
              '&:hover': {
                bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'
              }
            }}
          >
            <ListItemText
              primary={
                <Typography variant="body1" color={textColor} fontWeight="medium">
                  {report.name}
                </Typography>
              }
              secondary={
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.5 }}>
                  <Chip
                    label={report.type.charAt(0).toUpperCase() + report.type.slice(1)}
                    size="small"
                    sx={{ backgroundColor: getReportTypeColor(report.type), color: '#fff' }}
                  />
                  {report.filters.currency && report.filters.currency !== "all" && (
                    <Chip label={report.filters.currency} size="small" variant="outlined" />
                  )}
                  {report.filters.startDate && report.filters.endDate && (
                    <Chip
                      label={`${format(new Date(report.filters.startDate), "MMM d, yyyy")} - ${format(new Date(report.filters.endDate), "MMM d, yyyy")}`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>
              }
            />
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {report.isScheduled && (
                <Tooltip title="Scheduled Report">
                  <ScheduleIcon fontSize="small" color="action" sx={{ mx: 0.5 }} />
                </Tooltip>
              )}
              {report.isShared && (
                <Tooltip title="Shared Report">
                  <ShareIcon fontSize="small" color="action" sx={{ mx: 0.5 }} />
                </Tooltip>
              )}
              <ListItemSecondaryAction>
                <IconButton 
                  edge="end" 
                  onClick={(e) => handleMenuOpen(e, report._id, report)}
                  disabled={!canEditReport(report) && !report.isShared}
                >
                  <MoreVertIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </Box>
          </ListItem>
        ))}
      </List>
      
      {/* Report Actions Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleMenuAction('load')}>
          <ListItemIcon>
            <FileCopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Load Report" />
        </MenuItem>
        
        {selectedReport && canEditReport(selectedReport) && (
          <>
            <MenuItem onClick={() => handleMenuAction('edit')}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Edit" />
            </MenuItem>
            <MenuItem onClick={() => handleMenuAction('delete')}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Delete" />
            </MenuItem>
          </>
        )}
      </Menu>
    </Paper>
  )
}

export default SavedReportsList