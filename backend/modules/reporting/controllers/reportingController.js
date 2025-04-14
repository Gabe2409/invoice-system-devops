/**
 * @fileoverview Reporting Controller - Handles all reporting functionality
 *
 * This controller provides methods for generating various financial reports,
 * including revenue/expense summaries, transaction analytics, and exportable data.
 *
 * @module controllers/reportingController
 * @requires mongoose
 * @requires models/transaction
 * @requires utils/errorHandler
 * @requires services/exportService
 */

import mongoose from "mongoose";
import Transaction from "../../core/models/transaction.js";
import Account from "../../core/models/account.js";
import { sendSuccessResponse, sendErrorResponse } from "../../core/utils/errorHandler.js";
import { generateCsvExport, generatePdfExport } from "../services/exportService.js";

/**
 * Get revenue data with filtering and grouping options
 *
 * @async
 * @function getRevenueData
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} JSON response with revenue data or error
 * @description Returns transaction revenue data grouped by time period with flexible filtering
 */
export const getRevenueData = async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      currency, 
      groupBy = "day", 
      client = "",
      category = "" 
    } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        dateFilter.createdAt.$lte = endOfDay;
      }
    }

    // Add currency filter if provided
    if (currency && currency !== "all") {
      dateFilter.currency = currency;
    }

    // Client filter would be based on customerName or a related field
    if (client) {
      dateFilter.customerName = { $regex: client, $options: "i" };
    }

    // Category filter - assuming category information exists
    // This may need adjustment based on your actual data model
    if (category) {
      // If you have categories in your transactions, adjust this accordingly
      // dateFilter.category = category;
    }

    // Determine grouping format based on groupBy parameter
    let groupFormat;
    switch (groupBy) {
      case "week":
        groupFormat = { $week: "$createdAt" };
        break;
      case "month":
        groupFormat = { 
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" }
        };
        break;
      case "quarter":
        groupFormat = {
          year: { $year: "$createdAt" },
          quarter: { 
            $ceil: { 
              $divide: [{ $month: "$createdAt" }, 3] 
            } 
          }
        };
        break;
      case "year":
        groupFormat = { $year: "$createdAt" };
        break;
      default: // day
        groupFormat = { 
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" }
        };
    }

    // Build the aggregation pipeline
    const pipeline = [
      { $match: dateFilter },
      {
        $group: {
          _id: groupFormat,
          // Cash In and Buy are considered "revenue", Cash Out and Sell are "expenses"
          revenue: {
            $sum: {
              $cond: [
                { $in: ["$type", ["Cash In", "Buy"]] },
                { $cond: [{ $eq: ["$currency", "TTD"] }, "$amount", "$amountTTD"] },
                0
              ]
            }
          },
          expenses: {
            $sum: {
              $cond: [
                { $in: ["$type", ["Cash Out", "Sell"]] },
                { $cond: [{ $eq: ["$currency", "TTD"] }, "$amount", "$amountTTD"] },
                0
              ]
            }
          },
          transactionCount: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ];

    // Execute the aggregation
    const aggregationResult = await Transaction.aggregate(pipeline);

    // Format the results for the frontend
    let formattedResults = [];
    
    // Format the dates based on the groupBy parameter
    aggregationResult.forEach(item => {
      let date;
      let dateStr;
      
      if (groupBy === "day") {
        date = new Date(item._id.year, item._id.month - 1, item._id.day);
        dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
      } else if (groupBy === "week") {
        // Week calculation is more complex - need the year as well for accurate calculation
        // This is a simplification and might need adjustment
        date = new Date();
        date.setFullYear(new Date().getFullYear());
        date.setDate(1 + (item._id - 1) * 7);
        dateStr = `Week ${item._id}`;
      } else if (groupBy === "month") {
        date = new Date(item._id.year, item._id.month - 1, 1);
        dateStr = date.toISOString().slice(0, 7); // YYYY-MM
      } else if (groupBy === "quarter") {
        dateStr = `${item._id.year} Q${item._id.quarter}`;
      } else if (groupBy === "year") {
        dateStr = `${item._id}`;
      }

      const profit = item.revenue - item.expenses;
      const profitMargin = item.revenue > 0 ? (profit / item.revenue) * 100 : 0;

      formattedResults.push({
        date: dateStr,
        revenue: parseFloat(item.revenue.toFixed(2)),
        expenses: parseFloat(item.expenses.toFixed(2)),
        profit: parseFloat(profit.toFixed(2)),
        profitMargin: parseFloat(profitMargin.toFixed(2)),
        count: item.transactionCount
      });
    });

    return sendSuccessResponse(res, 200, "Revenue data retrieved successfully", formattedResults);
  } catch (error) {
    console.error("Error in getRevenueData:", error);
    return sendErrorResponse(res, 500, "Failed to retrieve revenue data");
  }
};

/**
 * Get transaction summary by currency
 *
 * @async
 * @function getCurrencySummary
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} JSON response with currency summary data or error
 * @description Returns aggregated transaction data by currency
 */
export const getCurrencySummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        dateFilter.createdAt.$lte = endOfDay;
      }
    }

    // Admins can see all data, non-admins might be restricted
    if (req.user && req.user.role !== "admin") {
      // Optional: Add user-specific filters here if needed
      // For example, if regular users should only see their transactions:
      // dateFilter.createdBy = req.user._id;
    }

    // Aggregate transactions by currency
    const pipeline = [
      { $match: dateFilter },
      {
        $group: {
          _id: "$currency",
          totalIn: {
            $sum: {
              $cond: [
                { $in: ["$type", ["Cash In", "Buy"]] },
                "$amount",
                0
              ]
            }
          },
          totalOut: {
            $sum: {
              $cond: [
                { $in: ["$type", ["Cash Out", "Sell"]] },
                "$amount",
                0
              ]
            }
          },
          transactionCount: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ];

    const currencySummary = await Transaction.aggregate(pipeline);
    
    // Get account balances
    const accounts = await Account.find({}, 'currency balance');
    
    // Combine results
    const result = currencySummary.map(item => {
      const account = accounts.find(a => a.currency === item._id);
      return {
        currency: item._id,
        totalIn: parseFloat(item.totalIn.toFixed(2)),
        totalOut: parseFloat(item.totalOut.toFixed(2)),
        netFlow: parseFloat((item.totalIn - item.totalOut).toFixed(2)),
        balance: account ? parseFloat(account.balance.toFixed(2)) : 0,
        count: item.transactionCount
      };
    });

    return sendSuccessResponse(res, 200, "Currency summary retrieved successfully", result);
  } catch (error) {
    console.error("Error in getCurrencySummary:", error);
    return sendErrorResponse(res, 500, "Failed to retrieve currency summary");
  }
};

/**
 * Get transaction volumes by type
 *
 * @async
 * @function getTransactionTypeAnalytics
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} JSON response with transaction type analytics or error
 * @description Returns aggregated transaction data by transaction type
 */
export const getTransactionTypeAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, currency } = req.query;

    // Build filter
    const filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endOfDay;
      }
    }
    
    if (currency && currency !== "all") {
      filter.currency = currency;
    }

    // Aggregate by transaction type
    const pipeline = [
      { $match: filter },
      {
        $group: {
          _id: "$type",
          totalAmount: { $sum: "$amount" },
          totalTTD: { $sum: "$amountTTD" },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ];

    const typeAnalytics = await Transaction.aggregate(pipeline);
    
    // Format results
    const formattedResults = typeAnalytics.map(item => ({
      type: item._id,
      amount: parseFloat(item.totalAmount.toFixed(2)),
      amountTTD: parseFloat(item.totalTTD.toFixed(2)),
      count: item.count,
      percentage: 0 // Will calculate after getting total
    }));
    
    // Calculate percentages
    const totalCount = formattedResults.reduce((sum, item) => sum + item.count, 0);
    formattedResults.forEach(item => {
      item.percentage = parseFloat(((item.count / totalCount) * 100).toFixed(2));
    });

    return sendSuccessResponse(res, 200, "Transaction type analytics retrieved successfully", formattedResults);
  } catch (error) {
    console.error("Error in getTransactionTypeAnalytics:", error);
    return sendErrorResponse(res, 500, "Failed to retrieve transaction type analytics");
  }
};

/**
 * Get customer analytics
 *
 * @async
 * @function getCustomerAnalytics
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} JSON response with customer analytics or error
 * @description Returns aggregated transaction data by customer
 */
export const getCustomerAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, currency, limit = 10 } = req.query;

    // Build filter
    const filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endOfDay;
      }
    }
    
    if (currency && currency !== "all") {
      filter.currency = currency;
    }

    // Aggregate by customer
    const pipeline = [
      { $match: filter },
      {
        $group: {
          _id: "$customerName",
          totalAmount: { $sum: "$amount" },
          totalTTD: { $sum: "$amountTTD" },
          transactionCount: { $sum: 1 },
          lastTransaction: { $max: "$createdAt" }
        }
      },
      { $sort: { totalAmount: -1 } },
      { $limit: parseInt(limit) }
    ];

    const customerAnalytics = await Transaction.aggregate(pipeline);
    
    // Format results
    const formattedResults = customerAnalytics.map(item => ({
      customer: item._id,
      totalAmount: parseFloat(item.totalAmount.toFixed(2)),
      totalTTD: parseFloat(item.totalTTD.toFixed(2)),
      transactionCount: item.transactionCount,
      lastTransaction: item.lastTransaction
    }));

    return sendSuccessResponse(res, 200, "Customer analytics retrieved successfully", formattedResults);
  } catch (error) {
    console.error("Error in getCustomerAnalytics:", error);
    return sendErrorResponse(res, 500, "Failed to retrieve customer analytics");
  }
};

/**
 * Export transaction data in specified format
 *
 * @async
 * @function exportTransactionData
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} File download or error response
 * @description Exports filtered transaction data in CSV, PDF, or JSON format
 */
export const exportTransactionData = async (req, res) => {
  try {
    const { format = "csv", startDate, endDate, currency, type } = req.query;

    // Build filter
    const filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endOfDay;
      }
    }
    
    if (currency && currency !== "all") {
      filter.currency = currency;
    }
    
    if (type && type !== "all") {
      filter.type = type;
    }

    // Get transaction data
    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    // Generate export file based on format
    let exportData;
    let contentType;
    let filename;
    
    const dateStr = new Date().toISOString().slice(0, 10);
    
    if (format === "csv") {
      exportData = generateCsvExport(transactions);
      contentType = "text/csv";
      filename = `transaction_report_${dateStr}.csv`;
    } else if (format === "pdf") {
      exportData = await generatePdfExport(transactions);
      contentType = "application/pdf";
      filename = `transaction_report_${dateStr}.pdf`;
    } else { // json
      exportData = JSON.stringify(transactions, null, 2);
      contentType = "application/json";
      filename = `transaction_report_${dateStr}.json`;
    }

    // Set response headers for file download
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    
    // Send the file
    res.send(exportData);
  } catch (error) {
    console.error("Error in exportTransactionData:", error);
    return sendErrorResponse(res, 500, "Failed to export transaction data");
  }
};

/**
 * Get supported currencies for reports
 *
 * @async
 * @function getSupportedCurrencies
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} JSON response with currencies or error
 * @description Returns list of currencies used in transactions
 */
export const getSupportedCurrencies = async (req, res) => {
  try {
    // Get unique currencies from accounts and transactions
    const accounts = await Account.find({}, 'currency');
    const accountCurrencies = accounts.map(acc => acc.currency);
    
    // Also check transactions for any currencies not in accounts
    const transactionCurrencies = await Transaction.distinct('currency');
    
    // Merge unique currencies from both sources
    const allCurrencies = [...new Set([...accountCurrencies, ...transactionCurrencies])];
    
    // Format for frontend use
    const currencies = allCurrencies.map(id => ({
      id,
      name: getCurrencyName(id) // Helper function to get currency names
    }));

    return sendSuccessResponse(res, 200, "Currencies retrieved successfully", currencies);
  } catch (error) {
    console.error("Error in getSupportedCurrencies:", error);
    return sendErrorResponse(res, 500, "Failed to retrieve supported currencies");
  }
};

/**
 * Get comprehensive transaction summary for admins
 *
 * @async
 * @function getTransactionSummary
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} JSON response with detailed transaction analytics
 * @description Provides a detailed summary of system transactions with financial metrics
 */
export const getTransactionSummary = async (req, res) => {
  try {
    const { startDate, endDate, currency } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        dateFilter.createdAt.$lte = endOfDay;
      }
    }
    
    if (currency && currency !== "all") {
      dateFilter.currency = currency;
    }

    // 1. Get transaction summary by type
    const typePipeline = [
      { $match: dateFilter },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
          totalTTD: { $sum: "$amountTTD" },
          avgAmount: { $avg: "$amount" },
          minAmount: { $min: "$amount" },
          maxAmount: { $max: "$amount" }
        }
      },
      { $sort: { count: -1 } }
    ];

    // 2. Get daily transaction count
    const dailyPipeline = [
      { $match: dateFilter },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          count: { $sum: 1 },
          volume: { $sum: "$amount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ];

    // 3. Get user transaction performance
    const userPipeline = [
      { $match: dateFilter },
      {
        $group: {
          _id: "$createdBy",
          count: { $sum: 1 },
          volume: { $sum: "$amount" }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ];

    // 4. Get count of unique customers
    const customerPipeline = [
      { $match: dateFilter },
      {
        $group: {
          _id: "$customerEmail",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
          firstTransaction: { $min: "$createdAt" },
          lastTransaction: { $max: "$createdAt" }
        }
      },
      { $sort: { count: -1 } }
    ];

    // Execute all aggregations in parallel
    const [typeSummary, dailyActivity, userPerformance, customerSummary] = await Promise.all([
      Transaction.aggregate(typePipeline),
      Transaction.aggregate(dailyPipeline),
      Transaction.aggregate(userPipeline),
      Transaction.aggregate(customerPipeline)
    ]);

    // Get account balances
    const accounts = await Account.find({}, 'currency balance');

    // Calculate additional metrics
    const totalTransactions = typeSummary.reduce((sum, item) => sum + item.count, 0);
    const totalVolume = typeSummary.reduce((sum, item) => sum + item.totalAmount, 0);
    const uniqueCustomers = customerSummary.length;
    
    // Format daily activity for charting
    const formattedDailyActivity = dailyActivity.map(day => {
      const date = new Date(day._id.year, day._id.month - 1, day._id.day);
      return {
        date: date.toISOString().split('T')[0],
        count: day.count,
        volume: day.volume
      };
    });

    // Format accounts
    const formattedAccounts = accounts.map(acc => ({
      currency: acc.currency,
      balance: parseFloat(acc.balance.toFixed(2))
    }));

    // Build comprehensive summary
    const summary = {
      period: {
        startDate: startDate || 'All time',
        endDate: endDate || 'Present',
        currency: currency || 'All currencies'
      },
      metrics: {
        totalTransactions,
        totalVolume: parseFloat(totalVolume.toFixed(2)),
        uniqueCustomers,
        averageTransactionValue: totalTransactions > 0 ? 
          parseFloat((totalVolume / totalTransactions).toFixed(2)) : 0
      },
      accounts: formattedAccounts,
      transactionTypes: typeSummary.map(type => ({
        type: type._id,
        count: type.count,
        totalAmount: parseFloat(type.totalAmount.toFixed(2)),
        totalTTD: parseFloat(type.totalTTD.toFixed(2)),
        avgAmount: parseFloat(type.avgAmount.toFixed(2)),
        minAmount: parseFloat(type.minAmount.toFixed(2)),
        maxAmount: parseFloat(type.maxAmount.toFixed(2))
      })),
      dailyActivity: formattedDailyActivity,
      topUsers: userPerformance,  // Will need to be populated with user data
      customerInsights: {
        totalCustomers: uniqueCustomers,
        topCustomers: customerSummary.slice(0, 10).map(customer => ({
          email: customer._id,
          transactionCount: customer.count,
          totalSpent: parseFloat(customer.totalAmount.toFixed(2)),
          firstTransaction: customer.firstTransaction,
          lastTransaction: customer.lastTransaction,
          daysSinceLastTransaction: Math.floor((new Date() - new Date(customer.lastTransaction)) / (1000 * 60 * 60 * 24))
        }))
      }
    };

    return sendSuccessResponse(res, 200, "Transaction summary retrieved successfully", summary);
  } catch (error) {
    console.error("Error in getTransactionSummary:", error);
    return sendErrorResponse(res, 500, "Failed to retrieve transaction summary");
  }
};

/**
 * Helper function to get currency names
 * 
 * @private
 * @function getCurrencyName
 * @param {string} currencyCode - ISO currency code
 * @returns {string} Currency name
 */
function getCurrencyName(currencyCode) {
  const currencyNames = {
    'TTD': 'Trinidad and Tobago Dollar',
    'USD': 'US Dollar',
    'EUR': 'Euro',
    'GBP': 'British Pound',
    'CAD': 'Canadian Dollar',
    'JPY': 'Japanese Yen',
    // Add more as needed
  };
  
  return currencyNames[currencyCode] || currencyCode;
}

export default {
  getRevenueData,
  getCurrencySummary,
  getTransactionTypeAnalytics,
  getCustomerAnalytics,
  exportTransactionData,
  getSupportedCurrencies,
  getTransactionSummary
};