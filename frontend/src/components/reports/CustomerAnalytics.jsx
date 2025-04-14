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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { format } from "date-fns";
import CustomTooltip from "./CustomTooltip";

// Constants
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const CustomerAnalytics = ({ customerData, filters, cardBgColor, textColor, mode }) => {
  return (
    <Grid container spacing={3}>
      {/* Top Customers Bar Chart */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3, height: "400px", bgcolor: cardBgColor, color: textColor }}>
          <Typography variant="h6" gutterBottom color={textColor}>
            Top Customers by Transaction Volume
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <ResponsiveContainer width="100%" height="85%">
            <BarChart
              data={customerData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="customer" width={150} />
              <RechartsTooltip content={<CustomTooltip currencyCode={filters.currency === "all" ? "TTD" : filters.currency} />} />
              <Legend />
              <Bar dataKey="totalAmount" name="Transaction Volume" fill="#8884d8">
                {customerData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
      
      {/* Customer Transaction Details */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3, bgcolor: cardBgColor, color: textColor }}>
          <Typography variant="h6" gutterBottom color={textColor}>
            Customer Transaction Details
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            {customerData.slice(0, 8).map((customer, index) => (
              <Grid item xs={12} sm={6} md={3} key={customer.customer}>
                <Card 
                  sx={{ 
                    p: 2, 
                    bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                    border: `1px solid ${COLORS[index % COLORS.length]}`,
                    height: '100%'
                  }}
                >
                  <Typography variant="h6" gutterBottom color={textColor} noWrap>
                    {customer.customer}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Volume: {customer.totalAmount.toLocaleString()} {filters.currency === "all" ? "TTD" : filters.currency}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Transactions: {customer.transactionCount}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Last Transaction: {format(new Date(customer.lastTransaction), "MMM d, yyyy")}
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

export default CustomerAnalytics;