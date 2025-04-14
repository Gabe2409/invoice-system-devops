import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Divider,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  Stack,
  Card,
  CardContent,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Fade,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import useAppSettings from "../../../hooks/useAppSettings";
import { useTheme } from "../../../context/ThemeContext";

const ApplicationSettings = () => {
  const { settings, loading, error, updateSetting, fetchAppSettings } =
    useAppSettings();

  const { mode, primaryColor } = useTheme();

  // State to prevent flickering
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);

  // Theme-based colors
  const textColor = mode === "dark" ? "white" : "#1E293B";
  const secondaryTextColor =
    mode === "dark" ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)";
  const paperBgColor = mode === "dark" ? "#1E293B" : "#FFFFFF";
  const accordionBgColor = mode === "dark" ? "#263954" : "#EDF2F7";
  const accordionHeaderColor = mode === "dark" ? "#334155" : "#E2E8F0";
  const cardBgColor = mode === "dark" ? "#263954" : "#F1F5F9";
  const dividerColor =
    mode === "dark" ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)";
  const inputBgColor =
    mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)";
  const accentColor = primaryColor || (mode === "dark" ? "#FACC15" : "#3B82F6");

  const [formValues, setFormValues] = useState({
    appName: "",
    maintenance: false,
    contactEmail: "",
    footerText: "",
    allowRegistration: true,
    enableReports: true,
    enableNotifications: true,
    sessionTimeout: 60,
    apiRateLimit: 100,
  });

  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState("system");

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Update form when settings load
  useEffect(() => {
    if (!loading && settings) {
      setFormValues({
        appName: settings.system?.appName || "Currency Exchange App",
        maintenance: settings.system?.maintenance || false,
        contactEmail: settings.system?.contactEmail || "support@example.com",
        footerText:
          settings.system?.footerText || "© 2024 Currency Exchange App",
        allowRegistration: settings.features?.allowRegistration !== false,
        enableReports: settings.features?.enableReports !== false,
        enableNotifications: settings.features?.enableNotifications !== false,
        sessionTimeout: settings.config?.sessionTimeout || 60,
        apiRateLimit: settings.config?.apiRateLimit || 100,
      });

      // Set flag once settings are loaded to prevent flickering
      setIsSettingsLoaded(true);
    }
  }, [settings, loading]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleSaveSection = async (section) => {
    setSaving(true);
    try {
      let updates = [];

      if (section === "system") {
        updates = [
          updateSetting("system", "appName", formValues.appName),
          updateSetting("system", "maintenance", formValues.maintenance),
          updateSetting("system", "contactEmail", formValues.contactEmail),
          updateSetting("system", "footerText", formValues.footerText),
        ];
      } else if (section === "features") {
        updates = [
          updateSetting(
            "feature",
            "allowRegistration",
            formValues.allowRegistration
          ),
          updateSetting("feature", "enableReports", formValues.enableReports),
          updateSetting(
            "feature",
            "enableNotifications",
            formValues.enableNotifications
          ),
        ];
      } else if (section === "config") {
        updates = [
          updateSetting(
            "config",
            "sessionTimeout",
            parseInt(formValues.sessionTimeout, 10)
          ),
          updateSetting(
            "config",
            "apiRateLimit",
            parseInt(formValues.apiRateLimit, 10)
          ),
        ];
      }

      await Promise.all(updates);

      setSnackbar({
        open: true,
        message: "Settings saved successfully",
        severity: "success",
      });

      // Refresh settings to get the latest values
      fetchAppSettings();
    } catch (error) {
      console.error("Error saving settings:", error);
      setSnackbar({
        open: true,
        message: "Error saving settings",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Input field styling
  const inputSx = {
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor:
          mode === "dark" ? "rgba(255, 255, 255, 0.23)" : "rgba(0, 0, 0, 0.23)",
      },
      "&:hover fieldset": {
        borderColor:
          mode === "dark" ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)",
      },
      "&.Mui-focused fieldset": {
        borderColor: accentColor,
      },
      input: {
        color: textColor,
      },
      textarea: {
        color: textColor,
      },
    },
    "& .MuiInputLabel-root": {
      color: secondaryTextColor,
      "&.Mui-focused": {
        color: accentColor,
      },
    },
    "& .MuiFormHelperText-root": {
      color: secondaryTextColor,
    },
    bgcolor: inputBgColor,
  };

  if (loading || !isSettingsLoaded) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 300,
        }}
      >
        <CircularProgress sx={{ color: accentColor }} />
      </Box>
    );
  }

  return (
    <Fade in={true} timeout={500}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ color: textColor }}>
          Application Settings
        </Typography>
        <Divider sx={{ mb: 3, borderColor: dividerColor }} />

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              backgroundColor:
                mode === "dark"
                  ? "rgba(211, 47, 47, 0.15)"
                  : "rgba(211, 47, 47, 0.05)",
              color: mode === "dark" ? "#FCA5A5" : "#B91C1C",
              "& .MuiAlert-icon": {
                color: mode === "dark" ? "#FCA5A5" : "#B91C1C",
              },
            }}
          >
            {error}
          </Alert>
        )}

        {/* System Settings */}
        <Accordion
          expanded={expanded === "system"}
          onChange={handleAccordionChange("system")}
          sx={{
            mb: 2,
            backgroundColor: paperBgColor,
            "&:before": {
              display: "none",
            },
            boxShadow:
              mode === "dark"
                ? "0px 2px 8px rgba(0, 0, 0, 0.3)"
                : "0px 2px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: textColor }} />}
            aria-controls="system-settings-content"
            id="system-settings-header"
            sx={{
              backgroundColor: accordionHeaderColor,
              borderRadius: expanded === "system" ? "4px 4px 0 0" : "4px",
              color: textColor,
            }}
          >
            <Typography sx={{ color: textColor }}>System Settings</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={3}>
              <TextField
                name="appName"
                label="Application Name"
                value={formValues.appName}
                onChange={handleChange}
                fullWidth
                required
                sx={inputSx}
              />

              <FormControlLabel
                control={
                  <Switch
                    name="maintenance"
                    checked={formValues.maintenance}
                    onChange={handleChange}
                    color="warning"
                  />
                }
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography sx={{ color: textColor }}>
                      Maintenance Mode
                    </Typography>
                    {formValues.maintenance && (
                      <Chip label="Active" color="warning" size="small" />
                    )}
                  </Stack>
                }
                sx={{ color: textColor }}
              />

              <TextField
                name="contactEmail"
                label="Contact Email"
                value={formValues.contactEmail}
                onChange={handleChange}
                fullWidth
                type="email"
                sx={inputSx}
              />

              <TextField
                name="footerText"
                label="Footer Text"
                value={formValues.footerText}
                onChange={handleChange}
                fullWidth
                multiline
                rows={2}
                sx={inputSx}
              />

              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="contained"
                  onClick={() => handleSaveSection("system")}
                  disabled={saving}
                  sx={{
                    bgcolor: accentColor,
                    color: mode === "dark" ? "black" : "white",
                    "&:hover": {
                      bgcolor:
                        mode === "dark"
                          ? `${accentColor}E6`
                          : `${accentColor}CC`,
                    },
                  }}
                >
                  {saving ? (
                    <CircularProgress size={24} sx={{ color: "inherit" }} />
                  ) : (
                    "Save System Settings"
                  )}
                </Button>
              </Box>
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Feature Settings */}
        <Accordion
          expanded={expanded === "features"}
          onChange={handleAccordionChange("features")}
          sx={{
            mb: 2,
            backgroundColor: paperBgColor,
            "&:before": {
              display: "none",
            },
            boxShadow:
              mode === "dark"
                ? "0px 2px 8px rgba(0, 0, 0, 0.3)"
                : "0px 2px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: textColor }} />}
            aria-controls="features-settings-content"
            id="features-settings-header"
            sx={{
              backgroundColor: accordionHeaderColor,
              borderRadius: expanded === "features" ? "4px 4px 0 0" : "4px",
            }}
          >
            <Typography sx={{ color: textColor }}>Features</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Card sx={{ backgroundColor: cardBgColor, height: "100%" }}>
                  <CardContent>
                    <Typography
                      variant="subtitle1"
                      gutterBottom
                      sx={{ color: textColor }}
                    >
                      User Registration
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          name="allowRegistration"
                          checked={formValues.allowRegistration}
                          onChange={handleChange}
                        />
                      }
                      label="Allow New User Registration"
                      sx={{ color: textColor }}
                    />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card sx={{ backgroundColor: cardBgColor, height: "100%" }}>
                  <CardContent>
                    <Typography
                      variant="subtitle1"
                      gutterBottom
                      sx={{ color: textColor }}
                    >
                      Reports
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          name="enableReports"
                          checked={formValues.enableReports}
                          onChange={handleChange}
                        />
                      }
                      label="Enable Reports Feature"
                      sx={{ color: textColor }}
                    />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card sx={{ backgroundColor: cardBgColor, height: "100%" }}>
                  <CardContent>
                    <Typography
                      variant="subtitle1"
                      gutterBottom
                      sx={{ color: textColor }}
                    >
                      Notifications
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          name="enableNotifications"
                          checked={formValues.enableNotifications}
                          onChange={handleChange}
                        />
                      }
                      label="Enable Notifications"
                      sx={{ color: textColor }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
              <Button
                variant="contained"
                onClick={() => handleSaveSection("features")}
                disabled={saving}
                sx={{
                  bgcolor: accentColor,
                  color: mode === "dark" ? "black" : "white",
                  "&:hover": {
                    bgcolor:
                      mode === "dark" ? `${accentColor}E6` : `${accentColor}CC`,
                  },
                }}
              >
                {saving ? (
                  <CircularProgress size={24} sx={{ color: "inherit" }} />
                ) : (
                  "Save Feature Settings"
                )}
              </Button>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Configuration Settings */}
        <Accordion
          expanded={expanded === "config"}
          onChange={handleAccordionChange("config")}
          sx={{
            mb: 2,
            backgroundColor: paperBgColor,
            "&:before": {
              display: "none",
            },
            boxShadow:
              mode === "dark"
                ? "0px 2px 8px rgba(0, 0, 0, 0.3)"
                : "0px 2px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: textColor }} />}
            aria-controls="config-settings-content"
            id="config-settings-header"
            sx={{
              backgroundColor: accordionHeaderColor,
              borderRadius: expanded === "config" ? "4px 4px 0 0" : "4px",
            }}
          >
            <Typography sx={{ color: textColor }}>Configuration</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={3}>
              <TextField
                name="sessionTimeout"
                label="Session Timeout (minutes)"
                value={formValues.sessionTimeout}
                onChange={handleChange}
                type="number"
                InputProps={{ inputProps: { min: 1, max: 1440 } }}
                fullWidth
                helperText="How long until a user is automatically logged out (1-1440 minutes)"
                sx={inputSx}
              />

              <TextField
                name="apiRateLimit"
                label="API Rate Limit (requests per minute)"
                value={formValues.apiRateLimit}
                onChange={handleChange}
                type="number"
                InputProps={{ inputProps: { min: 10, max: 10000 } }}
                fullWidth
                helperText="Maximum API requests allowed per minute per user"
                sx={inputSx}
              />

              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="contained"
                  onClick={() => handleSaveSection("config")}
                  disabled={saving}
                  sx={{
                    bgcolor: accentColor,
                    color: mode === "dark" ? "black" : "white",
                    "&:hover": {
                      bgcolor:
                        mode === "dark"
                          ? `${accentColor}E6`
                          : `${accentColor}CC`,
                    },
                  }}
                >
                  {saving ? (
                    <CircularProgress size={24} sx={{ color: "inherit" }} />
                  ) : (
                    "Save Configuration"
                  )}
                </Button>
              </Box>
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{
              width: "100%",
              bgcolor:
                snackbar.severity === "success"
                  ? mode === "dark"
                    ? "rgba(46, 125, 50, 0.9)"
                    : "rgba(46, 125, 50, 0.8)"
                  : mode === "dark"
                  ? "rgba(211, 47, 47, 0.9)"
                  : "rgba(211, 47, 47, 0.8)",
              color: "white",
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Fade>
  );
};

export default ApplicationSettings;
