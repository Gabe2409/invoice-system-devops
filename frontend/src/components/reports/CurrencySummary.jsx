import React from "react";
import {
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Stack,
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
import CustomTooltip from "./CustomTooltip";

// Constants
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const CurrencySummary = ({ currencySummary, filters, cardBgColor, textColor, mode }) => {
  return (
    <Grid container spacing={3}>
      {/* Currency Summary Cards */}
      {currencySummary.map((currency) => (
        <Grid item xs={12} md={4} key={currency.currency}>
          <Card sx={{ bgcolor: cardBgColor, color: textColor }}>
            <CardContent>
              <Typography variant="h6" component="div" gutterBottom color={textColor}>
                {currency.currency}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1}>
                <Typography variant="body1" color="textSecondary">
                  Total In: {currency.totalIn.toLocaleString()} {currency.currency}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  Total Out: {currency.totalOut.toLocaleString()} {currency.currency}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  Net Flow: {currency.netFlow.toLocaleString()} {currency.currency}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  Current Balance: {currency.balance.toLocaleString()} {currency.currency}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  Transaction Count: {currency.count}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
      
      {/* Currency Summary Bar Chart */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3, height: "400px", bgcolor: cardBgColor, color: textColor }}>
          <Typography variant="h6" gutterBottom color={textColor}>
            Currency Transaction Volumes
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <ResponsiveContainer width="100%" height="85%">
            <BarChart
              data={currencySummary}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="currency" />
              <YAxis />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="totalIn" name="Total In" fill="#8884d8">
                {currencySummary.map((entry, index) => (
                  <Cell key={`cell-in-${index}`} fill={COLORS[0]} />
                ))}
              </Bar>
              <Bar dataKey="totalOut" name="Total Out" fill="#82ca9d">
                {currencySummary.map((entry, index) => (
                  <Cell key={`cell-out-${index}`} fill={COLORS[1]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default CurrencySummary;