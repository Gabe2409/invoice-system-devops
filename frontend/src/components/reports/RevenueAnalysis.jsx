import React from "react";
import {
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { format } from "date-fns";
import CustomTooltip from "./CustomTooltip";

// Constants
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const RevenueAnalysis = ({ revenueData, filters, cardBgColor, textColor, mode }) => {
  // Calculate summary metrics
  const totalRevenue = revenueData.reduce((sum, item) => sum + (item.revenue || 0), 0);
  const totalExpenses = revenueData.reduce((sum, item) => sum + (item.expenses || 0), 0);
  const totalProfit = totalRevenue - totalExpenses;

  // Prepare data for pie chart
  const pieChartData = [
    { name: "Revenue", value: totalRevenue },
    { name: "Expenses", value: totalExpenses },
  ];

  return (
    <>
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: cardBgColor, color: textColor }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Revenue
              </Typography>
              <Typography variant="h4" component="div" color={textColor}>
                {filters.currency} {totalRevenue.toLocaleString()}
              </Typography>
              <Typography color="textSecondary">
                {filters.startDate instanceof Date 
                  ? format(filters.startDate, "MMM d, yyyy") 
                  : format(new Date(filters.startDate), "MMM d, yyyy")} - 
                {filters.endDate instanceof Date 
                  ? format(filters.endDate, "MMM d, yyyy") 
                  : format(new Date(filters.endDate), "MMM d, yyyy")}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: cardBgColor, color: textColor }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Expenses
              </Typography>
              <Typography variant="h4" component="div" color={textColor}>
                {filters.currency} {totalExpenses.toLocaleString()}
              </Typography>
              <Typography color="textSecondary">
                {filters.startDate instanceof Date 
                  ? format(filters.startDate, "MMM d, yyyy") 
                  : format(new Date(filters.startDate), "MMM d, yyyy")} - 
                {filters.endDate instanceof Date 
                  ? format(filters.endDate, "MMM d, yyyy") 
                  : format(new Date(filters.endDate), "MMM d, yyyy")}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: cardBgColor, color: textColor }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Net Profit
              </Typography>
              <Typography 
                variant="h4" 
                component="div" 
                color={totalProfit >= 0 ? "success.main" : "error.main"}
              >
                {filters.currency} {totalProfit.toLocaleString()}
              </Typography>
              <Typography color="textSecondary">
                {filters.startDate instanceof Date 
                  ? format(filters.startDate, "MMM d, yyyy") 
                  : format(new Date(filters.startDate), "MMM d, yyyy")} - 
                {filters.endDate instanceof Date 
                  ? format(filters.endDate, "MMM d, yyyy") 
                  : format(new Date(filters.endDate), "MMM d, yyyy")}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Revenue Over Time Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, height: "400px", bgcolor: cardBgColor, color: textColor }}>
            <Typography variant="h6" gutterBottom color={textColor}>
              Revenue Over Time
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <ResponsiveContainer width="100%" height="85%">
              <LineChart data={revenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip content={<CustomTooltip currencyCode={filters.currency} />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  name="Revenue" 
                  activeDot={{ r: 8 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  name="Expenses" 
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Cash Flow Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: "400px", bgcolor: cardBgColor, color: textColor }}>
            <Typography variant="h6" gutterBottom color={textColor}>
              Cash Flow
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <ResponsiveContainer width="100%" height="85%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip content={<CustomTooltip currencyCode={filters.currency} />} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stackId="1" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.6}
                  name="Cash In" 
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stackId="2"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  fillOpacity={0.6}
                  name="Cash Out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Revenue vs Expenses Pie Chart */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: "400px", bgcolor: cardBgColor, color: textColor }}>
            <Typography variant="h6" gutterBottom color={textColor}>
              Revenue vs Expenses
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip currencyCode={filters.currency} />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Profit Margin Over Time */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, height: "400px", bgcolor: cardBgColor, color: textColor }}>
            <Typography variant="h6" gutterBottom color={textColor}>
              Profit Margin Over Time
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <ResponsiveContainer width="100%" height="85%">
              <LineChart
                data={revenueData.map((item) => ({
                  ...item,
                  profitMargin: item.revenue > 0 
                    ? (((item.revenue - item.expenses) / item.revenue) * 100).toFixed(2)
                    : 0,
                }))}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis unit="%" />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="profitMargin" 
                  stroke="#ff7300" 
                  strokeWidth={2}
                  name="Profit Margin" 
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default RevenueAnalysis;