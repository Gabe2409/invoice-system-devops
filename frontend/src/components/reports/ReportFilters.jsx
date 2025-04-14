import React from "react";
import {
  Grid,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  CircularProgress,
  Divider
} from "@mui/material";

const ReportFilters = ({
  filters,
  currencies,
  activeTab,
  onFilterChange,
  onApplyFilters,
  onResetFilters,
  loading,
  mode,
  cardBgColor,
  textColor,
  accentColor
}) => {
  return (
    <Paper sx={{ p: 3, mb: 3, bgcolor: cardBgColor, color: textColor }}>
      <Typography variant="h6" gutterBottom>
        Report Filters
      </Typography>
      <Divider sx={{ mb: 3 }} />
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <TextField
            label="Start Date"
            type="date"
            value={filters.startDate instanceof Date 
              ? filters.startDate.toISOString().split('T')[0] 
              : filters.startDate}
            onChange={(e) => onFilterChange("startDate", e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            label="End Date"
            type="date"
            value={filters.endDate instanceof Date 
              ? filters.endDate.toISOString().split('T')[0] 
              : filters.endDate}
            onChange={(e) => onFilterChange("endDate", e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <FormControl fullWidth>
            <InputLabel id="currency-label">Currency</InputLabel>
            <Select
              labelId="currency-label"
              value={filters.currency}
              label="Currency"
              onChange={(e) => onFilterChange("currency", e.target.value)}
              sx={{ bgcolor: cardBgColor, color: textColor }}
            >
              <MenuItem value="all">All Currencies</MenuItem>
              {currencies.map((currency) => (
                <MenuItem key={currency.id} value={currency.id}>
                  {currency.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        {activeTab === 0 && (
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel id="groupby-label">Group By</InputLabel>
              <Select
                labelId="groupby-label"
                value={filters.groupBy}
                label="Group By"
                onChange={(e) => onFilterChange("groupBy", e.target.value)}
                sx={{ bgcolor: cardBgColor, color: textColor }}
              >
                <MenuItem value="day">Day</MenuItem>
                <MenuItem value="week">Week</MenuItem>
                <MenuItem value="month">Month</MenuItem>
                <MenuItem value="quarter">Quarter</MenuItem>
                <MenuItem value="year">Year</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        )}
        {(activeTab === 1 || activeTab === 2) && (
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel id="type-label">Transaction Type</InputLabel>
              <Select
                labelId="type-label"
                value={filters.type}
                label="Transaction Type"
                onChange={(e) => onFilterChange("type", e.target.value)}
                sx={{ bgcolor: cardBgColor, color: textColor }}
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="Cash In">Cash In</MenuItem>
                <MenuItem value="Cash Out">Cash Out</MenuItem>
                <MenuItem value="Buy">Buy</MenuItem>
                <MenuItem value="Sell">Sell</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        )}
        <Grid item xs={12} md={2}>
          <Button 
            variant="contained" 
            onClick={onApplyFilters} 
            fullWidth 
            sx={{ height: "56px", bgcolor: accentColor }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Apply Filters"}
          </Button>
        </Grid>
        <Grid item xs={12} md={2}>
          <Button 
            variant="outlined" 
            onClick={onResetFilters} 
            fullWidth 
            sx={{ height: "56px", color: textColor, borderColor: textColor }}
          >
            Reset
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ReportFilters;