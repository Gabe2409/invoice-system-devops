import { Paper, Typography } from "@mui/material"
import { useTheme } from "../../context/ThemeContext"

const CustomTooltip = ({ active, payload, label, currencyCode }) => {
  const { mode } = useTheme()
  const bgColor = mode === 'dark' ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)'
  const textColor = mode === 'dark' ? '#FFFFFF' : '#1E293B'
  
  if (active && payload && payload.length) {
    return (
      <Paper 
        elevation={3} 
        sx={{ 
          p: 2, 
          backgroundColor: bgColor,
          border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)'
        }}
      >
        <Typography variant="subtitle2" color="textSecondary">
          {label}
        </Typography>
        {payload.map((entry, index) => (
          <Typography key={`item-${index}`} sx={{ color: entry.color, fontWeight: 'medium' }}>
            {entry.name}: {currencyCode && entry.dataKey !== "profitMargin" && entry.dataKey !== "percentage" ? `${currencyCode} ` : ""}
            {typeof entry.value === "number"
              ? (entry.dataKey === "profitMargin" || entry.dataKey === "percentage"
                ? `${parseFloat(entry.value).toFixed(1)}%`
                : parseFloat(entry.value).toLocaleString())
              : entry.value}
          </Typography>
        ))}
      </Paper>
    )
  }

  return null
}

export default CustomTooltip