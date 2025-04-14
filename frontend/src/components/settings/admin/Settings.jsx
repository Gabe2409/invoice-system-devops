import { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Stack,
  CircularProgress,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Alert,
  Snackbar
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const Settings = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState("add"); // "add" or "edit"
  const [editSetting, setEditSetting] = useState({
    key: "",
    value: "",
    description: "",
    isPublic: true
  });
  
  // Snackbar states
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You are not authenticated");
        return;
      }

      const { data } = await axios.get(`${BASE_URL}/settings/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Handle both API response formats - either an array or an object with settings property
      const settingsArray = Array.isArray(data) 
        ? data 
        : (data && data.settings ? data.settings : []);
      
      setSettings(settingsArray);
      setError(null);
    } catch (error) {
      console.error("Error fetching settings:", error.response?.data?.message || error.message);
      setError("Failed to load settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (mode, setting = null) => {
    setDialogMode(mode);
    if (mode === "edit" && setting) {
      setEditSetting({
        key: setting.key,
        value: typeof setting.value === "object" ? JSON.stringify(setting.value) : setting.value.toString(),
        description: setting.description || "",
        isPublic: setting.isPublic
      });
    } else {
      setEditSetting({
        key: "",
        value: "",
        description: "",
        isPublic: true
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    if (name === "isPublic") {
      setEditSetting({ ...editSetting, [name]: checked });
    } else {
      setEditSetting({ ...editSetting, [name]: value });
    }
  };

  const handleSaveSetting = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setSnackbar({
          open: true,
          message: "You are not authenticated",
          severity: "error"
        });
        return;
      }

      // Try to parse the value as JSON if it looks like JSON
      let parsedValue = editSetting.value;
      try {
        if (
          (editSetting.value.startsWith("{") && editSetting.value.endsWith("}")) ||
          (editSetting.value.startsWith("[") && editSetting.value.endsWith("]"))
        ) {
          parsedValue = JSON.parse(editSetting.value);
        }
      } catch (e) {
        // If parsing fails, use the string value
        console.log("Value is not valid JSON, using as string");
      }

      // Convert to appropriate type if it's a simple value
      if (parsedValue === "true") parsedValue = true;
      if (parsedValue === "false") parsedValue = false;
      if (!isNaN(parsedValue) && parsedValue !== "") {
        parsedValue = Number(parsedValue);
      }

      const payload = {
        key: editSetting.key,
        value: parsedValue,
        description: editSetting.description,
        isPublic: editSetting.isPublic
      };

      if (dialogMode === "add") {
        await axios.post(`${BASE_URL}/settings`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSnackbar({
          open: true,
          message: "Setting added successfully",
          severity: "success"
        });
      } else {
        await axios.put(`${BASE_URL}/settings/${editSetting.key}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSnackbar({
          open: true,
          message: "Setting updated successfully",
          severity: "success"
        });
      }

      handleCloseDialog();
      fetchSettings();
    } catch (error) {
      console.error("Error saving setting:", error);
      setSnackbar({
        open: true,
        message: `Error: ${error.response?.data?.message || error.message}`,
        severity: "error"
      });
    }
  };

  const handleDeleteSetting = async (key) => {
    if (!window.confirm(`Are you sure you want to delete the setting "${key}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setSnackbar({
          open: true,
          message: "You are not authenticated",
          severity: "error"
        });
        return;
      }

      await axios.delete(`${BASE_URL}/settings/${key}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSnackbar({
        open: true,
        message: "Setting deleted successfully",
        severity: "success"
      });
      fetchSettings();
    } catch (error) {
      console.error("Error deleting setting:", error);
      setSnackbar({
        open: true,
        message: `Error: ${error.response?.data?.message || error.message}`,
        severity: "error"
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Format value for display
  const formatValue = (value) => {
    if (value === null || value === undefined) return "null";
    if (typeof value === "boolean") return value ? "true" : "false";
    if (typeof value === "object") return JSON.stringify(value);
    return value.toString();
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ color: "white" }}>
          Application Settings
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog("add")}
        >
          Add Setting
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: "100%", overflow: "hidden", backgroundColor: "#1E293B" }}>
        <TableContainer sx={{ maxHeight: "calc(100vh - 240px)" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#334155" }}>
                <TableCell sx={{ color: "white", fontWeight: "bold", backgroundColor: "#334155" }}>Key</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold", backgroundColor: "#334155" }}>Value</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold", backgroundColor: "#334155" }}>Description</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold", backgroundColor: "#334155" }}>Public</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold", backgroundColor: "#334155" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : settings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ color: "white", py: 3 }}>
                    No settings found
                  </TableCell>
                </TableRow>
              ) : (
                settings.map((setting) => (
                  <TableRow key={setting.key}>
                    <TableCell sx={{ color: "white" }}>{setting.key}</TableCell>
                    <TableCell sx={{ color: "white", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>
                      {formatValue(setting.value)}
                    </TableCell>
                    <TableCell sx={{ color: "white" }}>{setting.description || "-"}</TableCell>
                    <TableCell sx={{ color: "white" }}>{setting.isPublic ? "Yes" : "No"}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenDialog("edit", setting)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteSetting(setting.key)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Setting Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogMode === "add" ? "Add New Setting" : "Edit Setting"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              name="key"
              label="Key"
              fullWidth
              value={editSetting.key}
              onChange={handleInputChange}
              disabled={dialogMode === "edit"} // Key cannot be changed when editing
              required
            />
            <TextField
              name="value"
              label="Value"
              fullWidth
              value={editSetting.value}
              onChange={handleInputChange}
              multiline
              rows={3}
              helperText="For JSON values, enter in valid JSON format"
              required
            />
            <TextField
              name="description"
              label="Description"
              fullWidth
              value={editSetting.description}
              onChange={handleInputChange}
            />
            <FormControlLabel
              control={
                <Switch
                  name="isPublic"
                  checked={editSetting.isPublic}
                  onChange={handleInputChange}
                />
              }
              label="Publicly Accessible"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSaveSetting}
            variant="contained"
            color="primary"
            disabled={!editSetting.key || editSetting.value === ""}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;