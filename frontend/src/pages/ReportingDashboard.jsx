"use client"

import React, { useState, useEffect, useContext } from "react"
import {
  Box,
  Container,
  CircularProgress,
  IconButton,
  Tooltip,
  Fade,
  Tab,
  Tabs,
  Paper
} from "@mui/material"
import RefreshIcon from "@mui/icons-material/Refresh"
import DownloadIcon from "@mui/icons-material/Download"
import FilterListIcon from "@mui/icons-material/FilterList"
import SaveIcon from "@mui/icons-material/Save"
import ListIcon from "@mui/icons-material/List"
import AssessmentIcon from '@mui/icons-material/Assessment'
import { useTheme } from "../context/ThemeContext"
import { AuthContext } from "../context/AuthContext"
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns"

// Import page components
import PageHeader from "../components/common/PageHeader"

// Import report components
import ReportFilters from "../components/reports/ReportFilters"
import RevenueAnalysis from "../components/reports/RevenueAnalysis"
import CurrencySummary from "../components/reports/CurrencySummary"
import TransactionTypes from "../components/reports/TransactionTypes"
import CustomerAnalytics from "../components/reports/CustomerAnalytics"
import SavedReportsList from "../components/reports/SavedReportsList"
import SaveReportDialog from "../components/reports/SaveReportDialog"

// Import services
import { 
  fetchRevenueData, 
  fetchCurrencyData, 
  fetchCurrencySummary,
  fetchTransactionTypes,
  fetchCustomerAnalytics,
  exportReportData,
  fetchReportConfigs,
  saveReportConfig
} from "../services/ReportingService"

const ReportingDashboard = () => {
  // Theme
  const { mode, primaryColor } = useTheme()
  const backgroundColor = mode === 'dark' ? "#0F172A" : "#F8FAFC"
  const cardBgColor = mode === 'dark' ? "#1E293B" : "#FFFFFF"
  const textColor = mode === 'dark' ? "#FFFFFF" : "#1E293B"
  const accentColor = primaryColor || (mode === 'dark' ? '#FACC15' : '#3B82F6')
  
  // States
  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(false)
  const [revenueData, setRevenueData] = useState([])
  const [currencies, setCurrencies] = useState([])
  const [currencySummary, setCurrencySummary] = useState([])
  const [transactionTypes, setTransactionTypes] = useState([])
  const [customerData, setCustomerData] = useState([])
  const [savedReports, setSavedReports] = useState([])
  const [showFilters, setShowFilters] = useState(true)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [filters, setFilters] = useState({
    startDate: startOfMonth(subMonths(new Date(), 1)),
    endDate: endOfMonth(new Date()),
    currency: "TTD",
    client: "",
    category: "",
    groupBy: "day",
    type: "",
  })
  
  // Auth context and check for user role
  const authContext = useContext(AuthContext)
  const user = authContext?.user
  const isAdmin = user && user.role === 'admin'
  const canEditReports = isAdmin

  // Initial data loading
  useEffect(() => {
    loadInitialData()
  }, [])

  // Load data when filters change
  useEffect(() => {
    if (activeTab === 0) {
      loadRevenueData()
    } else if (activeTab === 1) {
      loadCurrencySummary()
    } else if (activeTab === 2) {
      loadTransactionTypes()
    } else if (activeTab === 3) {
      loadCustomerData()
    }
  }, [activeTab])

  const loadInitialData = async () => {
    setLoading(true)
    try {
      // Load currencies first for filter
      const currencyResponse = await fetchCurrencyData()
      setCurrencies(currencyResponse.data || [])
      
      // Load saved reports
      const savedReportsResponse = await fetchReportConfigs()
      setSavedReports(savedReportsResponse.data || [])
      
      // Load initial data based on active tab
      if (activeTab === 0) {
        await loadRevenueData()
      } else if (activeTab === 1) {
        await loadCurrencySummary()
      }
    } catch (error) {
      console.error("Error loading initial data:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadRevenueData = async () => {
    setLoading(true)
    try {
      const response = await fetchRevenueData(filters)
      setRevenueData(response.data || [])
    } catch (error) {
      console.error("Error loading revenue data:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadCurrencySummary = async () => {
    setLoading(true)
    try {
      const response = await fetchCurrencySummary(filters)
      setCurrencySummary(response.data || [])
    } catch (error) {
      console.error("Error loading currency summary:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadTransactionTypes = async () => {
    setLoading(true)
    try {
      const response = await fetchTransactionTypes(filters)
      setTransactionTypes(response.data || [])
    } catch (error) {
      console.error("Error loading transaction types:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadCustomerData = async () => {
    setLoading(true)
    try {
      const response = await fetchCustomerAnalytics(filters)
      setCustomerData(response.data || [])
    } catch (error) {
      console.error("Error loading customer data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const applyFilters = async () => {
    if (activeTab === 0) {
      await loadRevenueData()
    } else if (activeTab === 1) {
      await loadCurrencySummary()
    } else if (activeTab === 2) {
      await loadTransactionTypes()
    } else if (activeTab === 3) {
      await loadCustomerData()
    }
  }

  const resetFilters = () => {
    setFilters({
      startDate: startOfMonth(subMonths(new Date(), 1)),
      endDate: endOfMonth(new Date()),
      currency: "TTD",
      client: "",
      category: "",
      groupBy: "day",
      type: "",
    })
  }

  const handleExport = (format = "csv") => {
    exportReportData(format, filters)
  }

  const handleSaveReport = async (reportName, isShared = false) => {
    try {
      const reportConfig = {
        name: reportName,
        type: getReportTypeFromTab(),
        filters: filters,
        visualOptions: {
          chartType: "line",
          showLegend: true,
        },
        isShared,
      }
      
      await saveReportConfig(reportConfig)
      
      // Refresh saved reports
      const savedReportsResponse = await fetchReportConfigs()
      setSavedReports(savedReportsResponse.data || [])
      
      return true
    } catch (error) {
      console.error("Error saving report:", error)
      return false
    }
  }

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  const getReportTypeFromTab = () => {
    switch (activeTab) {
      case 0:
        return "revenue"
      case 1:
        return "currency"
      case 2:
        return "transactions"
      case 3:
        return "customers"
      default:
        return "revenue"
    }
  }

  const getTabTitle = () => {
    switch (activeTab) {
      case 0:
        return "Revenue Analysis"
      case 1:
        return "Currency Summary"
      case 2:
        return "Transaction Types"
      case 3:
        return "Customer Analytics"
      case 4:
        return "Saved Reports"
      default:
        return "Financial Reports"
    }
  }

  return (
    <Fade in={true} timeout={600}>
      <Box sx={{ 
        width: "100%", 
        minHeight: "100%", 
        display: "flex", 
        flexDirection: "column"
      }}>
        <Box sx={{ width: "100%", px: { xs: 0, sm: 2 } }}>
          {/* Page Header */}
          <PageHeader 
            title="Financial Reports" 
            subtitle={getTabTitle()}
            icon={<AssessmentIcon sx={{ color: accentColor, fontSize: 24 }} />}
          />

          {/* Action Buttons */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
            {canEditReports && (
              <Tooltip title="Save Report">
                <IconButton onClick={() => setSaveDialogOpen(true)}>
                  <SaveIcon sx={{ color: textColor }} />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Refresh Data">
              <IconButton onClick={applyFilters} disabled={loading}>
                <RefreshIcon sx={{ color: textColor }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export as CSV">
              <IconButton onClick={() => handleExport('csv')}>
                <DownloadIcon sx={{ color: textColor }} />
              </IconButton>
            </Tooltip>
            <Tooltip title={showFilters ? "Hide Filters" : "Show Filters"}>
              <IconButton onClick={() => setShowFilters(!showFilters)}>
                <FilterListIcon sx={{ color: textColor }} />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Tabs */}
          <Paper sx={{ mb: 3, bgcolor: cardBgColor, color: textColor }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              sx={{
                '& .MuiTab-root': { color: textColor },
                '& .Mui-selected': { color: accentColor },
                '& .MuiTabs-indicator': { backgroundColor: accentColor }
              }}
            >
              <Tab label="Revenue Analysis" />
              <Tab label="Currency Summary" />
              <Tab label="Transaction Types" />
              <Tab label="Customer Analytics" />
              <Tab label="Saved Reports" icon={<ListIcon />} iconPosition="start" />
            </Tabs>
          </Paper>

          {/* Filters Panel */}
          {showFilters && activeTab !== 4 && (
            <ReportFilters
              filters={filters}
              currencies={currencies}
              activeTab={activeTab}
              onFilterChange={handleFilterChange}
              onApplyFilters={applyFilters}
              onResetFilters={resetFilters}
              loading={loading}
              mode={mode}
              cardBgColor={cardBgColor}
              textColor={textColor}
              accentColor={accentColor}
            />
          )}

          {activeTab === 4 ? (
            // Saved Reports Tab
            <SavedReportsList 
              reports={savedReports} 
              onReportSelect={(id) => {
                // Implement logic to load saved report
                console.log("Load report with ID:", id)
              }}
              onReportMenuOpen={(action, id) => {
                // Implement menu logic
                console.log(`${action} report with ID: ${id}`)
              }}
            />
          ) : loading ? (
            // Loading Indicator
            <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
              <CircularProgress sx={{ color: accentColor }} />
            </Box>
          ) : (
            // Report Content based on active tab
            <>
              {activeTab === 0 && (
                <RevenueAnalysis 
                  revenueData={revenueData} 
                  filters={filters} 
                  cardBgColor={cardBgColor}
                  textColor={textColor}
                  mode={mode}
                />
              )}

              {activeTab === 1 && (
                <CurrencySummary 
                  currencySummary={currencySummary} 
                  filters={filters}
                  cardBgColor={cardBgColor}
                  textColor={textColor}
                  mode={mode}
                />
              )}

              {activeTab === 2 && (
                <TransactionTypes 
                  transactionTypes={transactionTypes} 
                  filters={filters}
                  cardBgColor={cardBgColor}
                  textColor={textColor}
                  mode={mode}
                />
              )}

              {activeTab === 3 && (
                <CustomerAnalytics 
                  customerData={customerData} 
                  filters={filters}
                  cardBgColor={cardBgColor}
                  textColor={textColor}
                  mode={mode}
                />
              )}
            </>
          )}

          {/* Save Report Dialog */}
          <SaveReportDialog
            open={saveDialogOpen}
            onClose={() => setSaveDialogOpen(false)}
            onSave={handleSaveReport}
            reportType={getReportTypeFromTab()}
          />
        </Box>
      </Box>
    </Fade>
  )
}

export default ReportingDashboard