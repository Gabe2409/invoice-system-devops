import React from "react";
import {
  Grid,
  Paper,
  Typography,
  Card,
  Divider,
} from "@mui/material";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import CustomTooltip from "./CustomTooltip";

// Constants
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const TransactionTypes = ({ transactionTypes, filters, cardBgColor, textColor, mode }) => {
  return (
    <Grid container spacing={3}>
      {/* Transaction Type Pie Chart */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, height: "400px", bgcolor: cardBgColor, color: textColor }}>
          <Typography variant="h6" gutterBottom color={textColor}>
            Transaction Type Distribution
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie
                data={transactionTypes}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
                nameKey="type"
                label={({ type, percent }) => `${type}: ${(percent * 100).toFixed(0)}%`}
              >
                {transactionTypes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
      
      {/* Transaction Type Bar Chart */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, height: "400px", bgcolor: cardBgColor, color: textColor }}>
          <Typography variant="h6" gutterBottom color={textColor}>
            Transaction Volumes by Type
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <ResponsiveContainer width="100%" height="85%">
            <BarChart
              data={transactionTypes}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <RechartsTooltip content={<CustomTooltip currencyCode={filters.currency === "all" ? "TTD" : filters.currency} />} />
              <Legend />
              <Bar dataKey="amount" name="Volume" fill="#8884d8">
                {transactionTypes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
      
      {/* Transaction Types Details */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3, bgcolor: cardBgColor, color: textColor }}>
          <Typography variant="h6" gutterBottom color={textColor}>
            Transaction Type Details
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            {transactionTypes.map((item, index) => (
              <Grid item xs={12} sm={6} md={3} key={item.type}>
                <Card 
                  sx={{ 
                    p: 2, 
                    bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                    border: `1px solid ${COLORS[index % COLORS.length]}`,
                    height: '100%'
                  }}
                >
                  <Typography variant="h6" gutterBottom color={textColor}>
                    {item.type}
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    Count: {item.count}
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    Amount: {item.amount.toLocaleString()} {filters.currency === "all" ? "TTD" : filters.currency}
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    Percentage: {item.percentage.toFixed(1)}%
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default TransactionTypes;