/**
 * @fileoverview Analytics Service - Handles advanced data calculations
 *
 * This service provides functions for analyzing transaction data,
 * calculating statistics, and preparing data for visualizations.
 *
 * @module services/analyticsService
 */

/**
 * Calculate trend data for a time series
 *
 * @function calculateTrend
 * @param {Array} data - Array of time series data points
 * @param {string} valueField - Field name in data to analyze
 * @returns {Object} Trend data including growth rate and comparison values
 */
export const calculateTrend = (data, valueField) => {
    if (!data || data.length < 2) {
      return {
        growthRate: 0,
        isPositive: false,
        comparisonValue: 0,
        trend: 'stable'
      };
    }
  
    // Sort data by date if not already sorted
    const sortedData = [...data].sort((a, b) => {
      return new Date(a.date) - new Date(b.date);
    });
  
    // Get first and last values
    const firstValue = sortedData[0][valueField] || 0;
    const lastValue = sortedData[sortedData.length - 1][valueField] || 0;
  
    // Calculate growth rate (as a percentage)
    let growthRate = 0;
    if (firstValue !== 0) {
      growthRate = ((lastValue - firstValue) / Math.abs(firstValue)) * 100;
    }
  
    // Determine trend direction
    const isPositive = growthRate > 0;
    const absoluteGrowth = lastValue - firstValue;
    
    let trend = 'stable';
    if (growthRate > 5) trend = 'increasing';
    else if (growthRate < -5) trend = 'decreasing';
  
    return {
      growthRate: parseFloat(growthRate.toFixed(2)),
      isPositive,
      comparisonValue: parseFloat(absoluteGrowth.toFixed(2)),
      trend
    };
  };
  
  /**
   * Calculate summary statistics for numeric data
   *
   * @function calculateStatistics
   * @param {Array} data - Array of values or objects with the value field
   * @param {string} [field] - Field name to use if data is an array of objects
   * @returns {Object} Statistics including min, max, avg, median, etc.
   */
  export const calculateStatistics = (data, field) => {
    if (!data || data.length === 0) {
      return {
        min: 0,
        max: 0,
        avg: 0,
        median: 0,
        sum: 0,
        count: 0,
        stdDev: 0
      };
    }
    
    // Extract values if field is provided
    const values = field 
      ? data.map(item => parseFloat(item[field] || 0)).filter(v => !isNaN(v))
      : data.map(v => parseFloat(v || 0)).filter(v => !isNaN(v));
    
    if (values.length === 0) {
      return {
        min: 0,
        max: 0,
        avg: 0,
        median: 0,
        sum: 0,
        count: 0,
        stdDev: 0
      };
    }
    
    // Sort values for calculating median
    const sortedValues = [...values].sort((a, b) => a - b);
    
    // Calculate statistics
    const min = sortedValues[0];
    const max = sortedValues[sortedValues.length - 1];
    const sum = sortedValues.reduce((acc, val) => acc + val, 0);
    const count = sortedValues.length;
    const avg = sum / count;
    
    // Calculate median
    let median;
    const midIndex = Math.floor(sortedValues.length / 2);
    if (sortedValues.length % 2 === 0) {
      // Even number of items
      median = (sortedValues[midIndex - 1] + sortedValues[midIndex]) / 2;
    } else {
      // Odd number of items
      median = sortedValues[midIndex];
    }
    
    // Calculate standard deviation
    const squaredDifferences = sortedValues.map(value => {
      const diff = value - avg;
      return diff * diff;
    });
    const variance = squaredDifferences.reduce((acc, val) => acc + val, 0) / count;
    const stdDev = Math.sqrt(variance);
    
    return {
      min: parseFloat(min.toFixed(2)),
      max: parseFloat(max.toFixed(2)),
      avg: parseFloat(avg.toFixed(2)),
      median: parseFloat(median.toFixed(2)),
      sum: parseFloat(sum.toFixed(2)),
      count,
      stdDev: parseFloat(stdDev.toFixed(2))
    };
  };
  
  /**
   * Calculate forecast using simple moving average
   *
   * @function calculateForecast
   * @param {Array} data - Array of time series data
   * @param {string} dateField - Field containing date values
   * @param {string} valueField - Field containing values to forecast
   * @param {number} periods - Number of periods to forecast
   * @returns {Array} Original data plus forecast values
   */
  export const calculateForecast = (data, dateField, valueField, periods = 3) => {
    if (!data || data.length < 2) {
      return data;
    }
    
    // Get period length (in days) from existing data
    const sortedData = [...data].sort((a, b) => new Date(a[dateField]) - new Date(b[dateField]));
    
    // Calculate average period length
    let periodLength = 1; // Default to 1 day
    if (sortedData.length >= 2) {
      const firstDate = new Date(sortedData[0][dateField]);
      const secondDate = new Date(sortedData[1][dateField]);
      periodLength = Math.round((secondDate - firstDate) / (1000 * 60 * 60 * 24));
      
      // Default to 1 if calculation fails or gives unusual value
      if (isNaN(periodLength) || periodLength <= 0 || periodLength > 90) {
        periodLength = 1;
      }
    }
    
    // Extract last few values for simple moving average
    const windowSize = Math.min(5, sortedData.length);
    const lastValues = sortedData.slice(-windowSize).map(item => 
      parseFloat(item[valueField] || 0)
    );
    
    // Calculate moving average
    const average = lastValues.reduce((sum, val) => sum + val, 0) / windowSize;
    
    // Get last date from original data
    const lastDate = new Date(sortedData[sortedData.length - 1][dateField]);
    
    // Add forecast periods
    const forecastData = [...sortedData];
    
    for (let i = 1; i <= periods; i++) {
      const newDate = new Date(lastDate.getTime());
      newDate.setDate(newDate.getDate() + (periodLength * i));
      
      forecastData.push({
        [dateField]: newDate.toISOString().split('T')[0],
        [valueField]: parseFloat(average.toFixed(2)),
        isForecast: true
      });
    }
    
    return forecastData;
  };
  
  /**
   * Calculate year-over-year comparison
   *
   * @function calculateYearOverYear
   * @param {Array} currentYearData - Current year data
   * @param {Array} previousYearData - Previous year data
   * @param {string} dateField - Field containing date values
   * @param {string} valueField - Field containing values to compare
   * @returns {Object} Comparison data with changes and percentages
   */
  export const calculateYearOverYear = (currentYearData, previousYearData, dateField, valueField) => {
    if (!currentYearData || !previousYearData) {
      return {
        change: 0,
        percentChange: 0,
        currentTotal: 0,
        previousTotal: 0
      };
    }
    
    // Calculate totals
    const currentTotal = currentYearData.reduce((sum, item) => 
      sum + parseFloat(item[valueField] || 0), 0
    );
    
    const previousTotal = previousYearData.reduce((sum, item) => 
      sum + parseFloat(item[valueField] || 0), 0
    );
    
    // Calculate change
    const change = currentTotal - previousTotal;
    
    // Calculate percent change
    let percentChange = 0;
    if (previousTotal !== 0) {
      percentChange = (change / Math.abs(previousTotal)) * 100;
    }
    
    return {
      change: parseFloat(change.toFixed(2)),
      percentChange: parseFloat(percentChange.toFixed(2)),
      currentTotal: parseFloat(currentTotal.toFixed(2)),
      previousTotal: parseFloat(previousTotal.toFixed(2))
    };
  };
  
  export default {
    calculateTrend,
    calculateStatistics,
    calculateForecast,
    calculateYearOverYear
  };