/**
 * @fileoverview Report Configuration Model - Defines the schema for saved report configurations
 * 
 * This model allows users to save and reuse report configurations.
 * 
 * @module models/reportConfig
 * @requires mongoose
 */

import mongoose from "mongoose";

/**
 * Report configuration schema definition
 * 
 * @type {mongoose.Schema}
 */
const reportConfigSchema = new mongoose.Schema(
  {
    /**
     * Report name/title
     * @type {String}
     * @required
     */
    name: {
      type: String,
      required: [true, "Report name is required"],
      trim: true
    },
    
    /**
     * Report type/category
     * @type {String}
     * @enum ["revenue", "currency", "transactions", "customers", "custom"]
     * @required
     */
    type: {
      type: String,
      enum: {
        values: ["revenue", "currency", "transactions", "customers", "custom"],
        message: "Report type must be one of: revenue, currency, transactions, customers, custom"
      },
      required: [true, "Report type is required"]
    },
    
    /**
     * Report filter configuration
     * @type {Object}
     */
    filters: {
      startDate: {
        type: Date
      },
      endDate: {
        type: Date
      },
      currency: {
        type: String
      },
      groupBy: {
        type: String,
        enum: {
          values: ["day", "week", "month", "quarter", "year"],
          message: "Group by must be one of: day, week, month, quarter, year"
        },
        default: "day"
      },
      client: {
        type: String
      },
      category: {
        type: String
      },
      transactionType: {
        type: String
      }
    },
    
    /**
     * Visualization options
     * @type {Object}
     */
    visualOptions: {
      chartType: {
        type: String,
        enum: {
          values: ["line", "bar", "pie", "area"],
          message: "Chart type must be one of: line, bar, pie, area"
        },
        default: "line"
      },
      showLegend: {
        type: Boolean,
        default: true
      },
      colors: {
        type: [String]
      },
      stackSeries: {
        type: Boolean,
        default: false
      },
      yAxisLabel: {
        type: String
      },
      xAxisLabel: {
        type: String
      }
    },
    
    /**
     * Whether this is a scheduled report
     * @type {Boolean}
     * @default false
     */
    isScheduled: {
      type: Boolean,
      default: false
    },
    
    /**
     * Schedule configuration (if isScheduled is true)
     * @type {Object}
     */
    schedule: {
      frequency: {
        type: String,
        enum: {
          values: ["daily", "weekly", "monthly"],
          message: "Frequency must be one of: daily, weekly, monthly"
        }
      },
      dayOfWeek: {
        type: Number,
        min: 0,
        max: 6
      },
      dayOfMonth: {
        type: Number,
        min: 1,
        max: 31
      },
      timeOfDay: {
        type: String
      },
      recipients: {
        type: [String]
      },
      exportFormat: {
        type: String,
        enum: {
          values: ["pdf", "csv", "json"],
          message: "Export format must be one of: pdf, csv, json"
        },
        default: "pdf"
      }
    },
    
    /**
     * Reference to the user who created the report config
     * @type {mongoose.Schema.Types.ObjectId}
     * @ref "User"
     * @required
     */
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator is required"]
    },
    
    /**
     * Whether this report is shared with other users
     * @type {Boolean}
     * @default false
     */
    isShared: {
      type: Boolean,
      default: false
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true }
  }
);

// Create needed indexes
reportConfigSchema.index({ createdBy: 1 });
reportConfigSchema.index({ type: 1 });
reportConfigSchema.index({ isScheduled: 1 });

/**
 * Report Config model
 * @type {mongoose.Model}
 */
const ReportConfig = mongoose.model("ReportConfig", reportConfigSchema);

export default ReportConfig;