import axios from "axios"

const BASE_URL = import.meta.env.VITE_BASE_URL;

// Revenue Data
export const fetchRevenueData = async (filters) => {
  try {
    const response = await axios.get(`${BASE_URL}/reports/revenue`, {
      params: {
        startDate:
          filters.startDate instanceof Date ? filters.startDate.toISOString().split("T")[0] : filters.startDate,
        endDate: filters.endDate instanceof Date ? filters.endDate.toISOString().split("T")[0] : filters.endDate,
        currency: filters.currency,
        client: filters.client,
        category: filters.category,
        groupBy: filters.groupBy,
        type: filters.type,
      },
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    return response.data
  } catch (error) {
    console.error("Error fetching revenue data:", error)
    throw error
  }
}

// Currency Data
export const fetchCurrencyData = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/reports/currencies`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    return response.data
  } catch (error) {
    console.error("Error fetching currency data:", error)
    throw error
  }
}

export const fetchCurrencySummary = async (filters) => {
  try {
    const response = await axios.get(`${BASE_URL}/reports/currency-summary`, {
      params: {
        startDate:
          filters.startDate instanceof Date ? filters.startDate.toISOString().split("T")[0] : filters.startDate,
        endDate: filters.endDate instanceof Date ? filters.endDate.toISOString().split("T")[0] : filters.endDate,
        type: filters.type,
      },
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    return response.data
  } catch (error) {
    console.error("Error fetching currency summary:", error)
    throw error
  }
}

// Transaction Analytics
export const fetchTransactionTypes = async (filters) => {
  try {
    const response = await axios.get(`${BASE_URL}/reports/transaction-types`, {
      params: {
        startDate:
          filters.startDate instanceof Date ? filters.startDate.toISOString().split("T")[0] : filters.startDate,
        endDate: filters.endDate instanceof Date ? filters.endDate.toISOString().split("T")[0] : filters.endDate,
        currency: filters.currency,
      },
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    return response.data
  } catch (error) {
    console.error("Error fetching transaction types:", error)
    throw error
  }
}

export const fetchCustomerAnalytics = async (filters) => {
  try {
    const response = await axios.get(`${BASE_URL}/reports/customer-analytics`, {
      params: {
        startDate:
          filters.startDate instanceof Date ? filters.startDate.toISOString().split("T")[0] : filters.startDate,
        endDate: filters.endDate instanceof Date ? filters.endDate.toISOString().split("T")[0] : filters.endDate,
        currency: filters.currency,
        limit: 10,
      },
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    return response.data
  } catch (error) {
    console.error("Error fetching customer analytics:", error)
    throw error
  }
}

// Export Data
export const exportReportData = async (format, filters) => {
  try {
    const response = await axios.get(`${BASE_URL}/reports/export`, {
      params: {
        format,
        startDate:
          filters.startDate instanceof Date ? filters.startDate.toISOString().split("T")[0] : filters.startDate,
        endDate: filters.endDate instanceof Date ? filters.endDate.toISOString().split("T")[0] : filters.endDate,
        currency: filters.currency,
        type: filters.type,
      },
      responseType: "blob",
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })

    // Create a download link
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement("a")
    link.href = url
    
    // Set a default filename if Content-Disposition is not provided
    const contentDisposition = response.headers['content-disposition']
    let filename = `financial-report.${format}`
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/)
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1]
      }
    }
    
    link.setAttribute("download", filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
  } catch (error) {
    console.error("Error exporting report data:", error)
    throw error
  }
}

// Report Configurations
export const fetchReportConfigs = async (type = '') => {
  try {
    const response = await axios.get(`${BASE_URL}/reports/configs`, {
      params: type ? { type } : {},
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    return response.data
  } catch (error) {
    console.error("Error fetching report configurations:", error)
    throw error
  }
}

export const fetchReportConfig = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/reports/configs/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    return response.data
  } catch (error) {
    console.error("Error fetching report configuration:", error)
    throw error
  }
}

export const saveReportConfig = async (config) => {
  try {
    const response = await axios.post(`${BASE_URL}/reports/configs`, config, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    return response.data
  } catch (error) {
    console.error("Error saving report configuration:", error)
    throw error
  }
}

export const updateReportConfig = async (id, config) => {
  try {
    const response = await axios.put(`${BASE_URL}/reports/configs/${id}`, config, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    return response.data
  } catch (error) {
    console.error("Error updating report configuration:", error)
    throw error
  }
}

export const deleteReportConfig = async (id) => {
  try {
    const response = await axios.delete(`${BASE_URL}/reports/configs/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    return response.data
  } catch (error) {
    console.error("Error deleting report configuration:", error)
    throw error
  }
}