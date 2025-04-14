import { TextField, Stack, Button, IconButton, InputAdornment, Paper, CircularProgress, useMediaQuery, Box } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import PropTypes from "prop-types";
import { useTheme as useMuiTheme } from "@mui/material/styles";
import { useTheme } from "../../../context/ThemeContext"; // Import your theme context

const SearchBar = ({
  search,
  onSearchChange,
  onSearchSubmit,
  onToggleFilters,
  showFilters,
  loading,
  onRefresh,
  onNewTransactionClick
}) => {
  const muiTheme = useMuiTheme();
  const { mode, primaryColor } = useTheme(); // Get theme settings
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  
  // Theme-based colors
  const paperBgColor = mode === 'dark' ? "#1E293B" : "#FFFFFF";
  const textColor = mode === 'dark' ? "white" : "#1E293B";
  const borderColor = mode === 'dark' ? "rgba(255, 255, 255, 0.23)" : "rgba(0, 0, 0, 0.23)";
  const hoverBorderColor = mode === 'dark' ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)";
  const placeholderColor = mode === 'dark' ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)";
  const buttonBgColor = mode === 'dark' ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";
  const buttonHoverColor = mode === 'dark' ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)";
  const accentColor = primaryColor || (mode === 'dark' ? '#FACC15' : '#3B82F6');
  const shadowColor = mode === 'dark' 
    ? '0 4px 8px rgba(0, 0, 0, 0.25)' 
    : '0 2px 4px rgba(0, 0, 0, 0.08)';
  
  return (
    <Paper sx={{ 
      p: 2, 
      mb: 3, 
      bgcolor: paperBgColor, 
      borderRadius: 2,
      boxShadow: shadowColor,
      border: mode === 'dark' 
        ? '1px solid rgba(255, 255, 255, 0.05)' 
        : '1px solid rgba(0, 0, 0, 0.05)'
    }}>
      <form onSubmit={onSearchSubmit}>
        {/* Search input */}
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by name or reference..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: textColor }} />
              </InputAdornment>
            ),
            endAdornment: search ? (
              <InputAdornment position="end">
                <IconButton 
                  onClick={() => onSearchChange('')}
                  size="small"
                  sx={{ color: textColor }}
                >
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ) : null,
            sx: { 
              color: textColor,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: borderColor,
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: hoverBorderColor,
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: accentColor,
              },
              '&::placeholder': {
                color: placeholderColor,
                opacity: 1
              }
            }
          }}
          size="small"
          sx={{ mb: 2 }}
        />
        
        {/* Primary actions row */}
        <Stack 
          direction={isMobile ? "column" : "row"} 
          spacing={2} 
          sx={{ width: "100%" }}
        >
          {/* Left side buttons (always visible) */}
          <Stack 
            direction="row" 
            spacing={1} 
            sx={{ 
              width: isMobile ? "100%" : "auto",
              justifyContent: isMobile ? "space-between" : "flex-start"
            }}
          >
            <Button 
              variant="contained" 
              type="submit"
              fullWidth={isMobile}
              sx={{ 
                flex: isMobile ? 1 : "none",
                bgcolor: accentColor,
                '&:hover': {
                  bgcolor: mode === 'dark' ? 
                    `${accentColor}E6` : // 90% opacity version for dark mode
                    `${accentColor}CC`   // 80% opacity version for light mode
                }
              }}
            >
              Search
            </Button>
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={onToggleFilters}
              fullWidth={isMobile}
              sx={{ 
                borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)',
                color: textColor,
                '&:hover': { 
                  borderColor: mode === 'dark' ? 'white' : 'rgba(0, 0, 0, 0.7)'
                },
                flex: isMobile ? 1 : "none"
              }}
            >
              {showFilters ? "Hide" : "Filters"}
            </Button>
          </Stack>
          
          {/* Right side buttons */}
          <Stack 
            direction="row" 
            spacing={1} 
            sx={{ 
              width: isMobile ? "100%" : "auto",
              mt: isMobile ? 1 : 0,
              justifyContent: isMobile ? "space-between" : "flex-end",
              ml: isMobile ? 0 : "auto" // Push to right on desktop
            }}
          >
            {onNewTransactionClick && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={onNewTransactionClick}
                fullWidth={isMobile}
                sx={{ 
                  flex: isMobile ? 1 : "none",
                  bgcolor: accentColor,
                  '&:hover': {
                    bgcolor: mode === 'dark' ? 
                      `${accentColor}E6` : // 90% opacity version for dark mode
                      `${accentColor}CC`   // 80% opacity version for light mode
                  }
                }}
              >
                {isMobile ? "New" : "New Transaction"}
              </Button>
            )}
            <IconButton
              onClick={onRefresh}
              disabled={loading}
              sx={{ 
                color: textColor,
                bgcolor: buttonBgColor,
                "&:hover": {
                  bgcolor: buttonHoverColor
                }
              }}
            >
              {loading ? 
                <CircularProgress size={24} sx={{ color: accentColor }} /> : 
                <RefreshIcon />
              }
            </IconButton>
          </Stack>
        </Stack>
      </form>
    </Paper>
  );
};

SearchBar.propTypes = {
  search: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  onSearchSubmit: PropTypes.func.isRequired,
  onToggleFilters: PropTypes.func.isRequired,
  showFilters: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
  onRefresh: PropTypes.func.isRequired,
  onNewTransactionClick: PropTypes.func
};

export default SearchBar;