# Reporting Module

This module adds comprehensive reporting and analytics functionality to the Transaction Management System.

## Features

- Revenue and expense reporting with flexible date ranges
- Transaction analytics by currency, type, and customer
- Report configuration saving and sharing
- Data exports in CSV, PDF, and JSON formats
- Advanced analytics calculations
- Integration with the core transaction system

## Installation

As a drop-in module, installation is simple:

1. Copy this entire directory into your `modules/` folder
2. Install the required dependencies:
   ```
   cd modules/reporting
   npm install
   ```
3. Restart your server

The module will be automatically detected and loaded by the application's module system.

## API Endpoints

### Revenue Data
- `GET /api/reports/revenue` - Get revenue data with filtering and grouping

### Currency Data
- `GET /api/reports/currency-summary` - Get transaction summary by currency
- `GET /api/reports/currencies` - Get supported currencies for reports

### Transaction Analytics
- `GET /api/reports/transaction-types` - Get transaction volumes by type
- `GET /api/reports/customer-analytics` - Get customer analytics

### Data Export
- `GET /api/reports/export` - Export transaction data in specified format

### Report Configurations
- `POST /api/reports/configs` - Create a new report configuration
- `GET /api/reports/configs` - Get all user's report configurations
- `GET /api/reports/configs/:id` - Get a specific report configuration
- `PUT /api/reports/configs/:id` - Update a report configuration
- `DELETE /api/reports/configs/:id` - Delete a report configuration

## Query Parameters

### Common Parameters for Reports
- `startDate` - Start date for filtering (ISO format YYYY-MM-DD)
- `endDate` - End date for filtering (ISO format YYYY-MM-DD)
- `currency` - Filter by currency code (e.g., "USD", "TTD", or "all")

### Revenue Data Parameters
- `groupBy` - Group results by time period ("day", "week", "month", "quarter", "year")
- `client` - Filter by client name
- `category` - Filter by category name

### Export Parameters
- `format` - Export format ("csv", "pdf", "json")
- `type` - Filter by transaction type

## Authentication and Access

All API endpoints in this module require authentication via the system's JWT authentication middleware (`protect`). Every request must include a valid authorization token.

## Models

### ReportConfig
Allows users to save and reuse report configurations with the following properties:
- `name` - Report configuration name
- `type` - Report type/category
- `filters` - Filter settings (dates, currency, grouping, etc.)
- `visualOptions` - Chart and display preferences
- `isScheduled` - Whether this report runs on a schedule
- `schedule` - Schedule configuration
- `createdBy` - User who created the configuration
- `isShared` - Whether the configuration is shared with others

## Services

### AnalyticsService
Provides advanced data calculations:
- `calculateTrend` - Analyze trends in time series data
- `calculateStatistics` - Calculate summary statistics
- `calculateForecast` - Forecast future values using simple moving average
- `calculateYearOverYear` - Compare current period to previous year

### ExportService
Handles data export functionality:
- `generateCsvExport` - Export transaction data as CSV
- `generatePdfExport` - Create PDF reports from transaction data

## Integration Points

This module integrates with the core system through:
- Transaction model - for querying transaction data
- Account model - for retrieving current balances
- Auth middleware - for securing endpoints
- Error handler utilities - for consistent response formatting

## Module Structure

```
reporting/
├── controllers/
│   ├── reportingController.js  - Main reporting functionality
│   └── reportConfigController.js - Saved report management
├── models/
│   └── reportConfig.js - Schema for saved reports
├── routes/
│   └── reportingRoutes.js - API endpoint definitions
├── services/
│   ├── analyticsService.js - Data analysis functions
│   └── exportService.js - CSV and PDF exports
├── index.js - Module entry point
├── package.json - Module dependencies
└── README.md - This documentation
```

## Customization

The module is designed to be extensible. To add new report types:

1. Create a new controller method in `reportingController.js`
2. Add a new route in `reportingRoutes.js`
3. Implement any required data processing in appropriate services

## Dependencies

- csv-writer - For CSV file generation
- pdfkit - For PDF report generation