import {
  Collapse,
  Divider,
  Stack,
  TextField,
  Button,
  MenuItem,
  Paper,
  CircularProgress
} from "@mui/material";
import PropTypes from "prop-types";
import { useTheme } from "../../../context/ThemeContext"; // Import your theme context

const FilterPanel = ({
  show,
  filters,
  onFilterChange,
  onResetFilters,
  onApplyFilters,
  availableCurrencies,
  transactionTypes,
  loading
}) => {
  const { mode, primaryColor } = useTheme(); // Get theme settings
  
  // Theme-based colors
  const paperBgColor = mode === 'dark' ? "#1E293B" : "#FFFFFF";
  const textColor = mode === 'dark' ? "white" : "#1E293B";
  const labelColor = mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)';
  const borderColor = mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)';
  const hoverBorderColor = mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)';
  const dividerColor = mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)';
  const accentColor = primaryColor || (mode === 'dark' ? '#FACC15' : '#3B82F6');
  const shadowColor = mode === 'dark' 
    ? '0 4px 8px rgba(0, 0, 0, 0.25)' 
    : '0 2px 4px rgba(0, 0, 0, 0.08)';
  
  if (!show) return null;

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
      <Collapse in={show}>
        <Divider sx={{ my: 2, borderColor: dividerColor }} />
        <Stack spacing={2}>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            sx={{ width: '100%' }}
          >
            <TextField
              select
              fullWidth
              label="Currency"
              value={filters.currency}
              onChange={(e) => onFilterChange('currency', e.target.value)}
              size="small"
              InputLabelProps={{ sx: { color: labelColor } }}
              InputProps={{
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
                  }
                }
              }}
              sx={{ '& .MuiSelect-select': { color: textColor } }}
              SelectProps={{
                MenuProps: {
                  PaperProps: {
                    sx: {
                      bgcolor: paperBgColor,
                      color: textColor,
                      '& .MuiMenuItem-root': {
                        '&:hover': {
                          bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)'
                        },
                        '&.Mui-selected': {
                          bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.08)',
                          '&:hover': {
                            bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.24)' : 'rgba(0, 0, 0, 0.12)'
                          }
                        }
                      }
                    }
                  }
                }
              }}
            >
              <MenuItem value="">All Currencies</MenuItem>
              {availableCurrencies.map((currency) => (
                <MenuItem key={currency} value={currency}>
                  {currency}
                </MenuItem>
              ))}
            </TextField>
            
            <TextField
              select
              fullWidth
              label="Transaction Type"
              value={filters.type}
              onChange={(e) => onFilterChange('type', e.target.value)}
              size="small"
              InputLabelProps={{ sx: { color: labelColor } }}
              InputProps={{
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
                  }
                }
              }}
              sx={{ '& .MuiSelect-select': { color: textColor } }}
              SelectProps={{
                MenuProps: {
                  PaperProps: {
                    sx: {
                      bgcolor: paperBgColor,
                      color: textColor,
                      '& .MuiMenuItem-root': {
                        '&:hover': {
                          bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)'
                        },
                        '&.Mui-selected': {
                          bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.08)',
                          '&:hover': {
                            bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.24)' : 'rgba(0, 0, 0, 0.12)'
                          }
                        }
                      }
                    }
                  }
                }
              }}
            >
              <MenuItem value="">All Types</MenuItem>
              {transactionTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            sx={{ width: '100%' }}
          >
            <TextField
              fullWidth
              type="date"
              label="From Date"
              value={filters.dateFrom}
              onChange={(e) => onFilterChange('dateFrom', e.target.value)}
              size="small"
              InputLabelProps={{ 
                shrink: true,
                sx: { color: labelColor }
              }}
              InputProps={{
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
                  }
                }
              }}
            />
            
            <TextField
              fullWidth
              type="date"
              label="To Date"
              value={filters.dateTo}
              onChange={(e) => onFilterChange('dateTo', e.target.value)}
              size="small"
              InputLabelProps={{ 
                shrink: true,
                sx: { color: labelColor }
              }}
              InputProps={{
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
                  }
                }
              }}
            />
          </Stack>
          
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button 
              variant="outlined" 
              onClick={onResetFilters}
              sx={{ 
                borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)',
                color: textColor,
                '&:hover': { 
                  borderColor: mode === 'dark' ? 'white' : 'rgba(0, 0, 0, 0.7)'
                }
              }}
            >
              Reset Filters
            </Button>
            <Button 
              variant="contained" 
              onClick={onApplyFilters}
              disabled={loading}
              sx={{ 
                bgcolor: accentColor,
                '&:hover': {
                  bgcolor: mode === 'dark' ? 
                    `${accentColor}E6` : // 90% opacity version for dark mode
                    `${accentColor}CC`   // 80% opacity version for light mode
                }
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: 'inherit' }} />
              ) : (
                'Apply Filters'
              )}
            </Button>
          </Stack>
        </Stack>
      </Collapse>
    </Paper>
  );
};

FilterPanel.propTypes = {
  show: PropTypes.bool.isRequired,
  filters: PropTypes.shape({
    search: PropTypes.string,
    currency: PropTypes.string,
    type: PropTypes.string,
    dateFrom: PropTypes.string,
    dateTo: PropTypes.string
  }).isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onResetFilters: PropTypes.func.isRequired,
  onApplyFilters: PropTypes.func.isRequired,
  availableCurrencies: PropTypes.array.isRequired,
  transactionTypes: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired
};

export default FilterPanel;