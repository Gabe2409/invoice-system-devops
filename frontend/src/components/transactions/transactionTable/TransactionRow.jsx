import { format } from "date-fns";
import { TableRow, TableCell, Chip, Typography, Box, Avatar, Tooltip } from "@mui/material";
import PropTypes from "prop-types";
import { formatAmount, getTransactionColor, stringAvatar } from "../../../utils/utils";
import { useTheme } from "../../../context/ThemeContext"; 

const TransactionRow = ({ transaction, onClick, isMobile }) => {
  const { mode, primaryColor, fontSize } = useTheme(); // Get all theme settings including fontSize
  
  // Theme-based colors
  const textColor = mode === 'dark' ? "white" : "#1E293B";
  const hoverColor = mode === 'dark' ? "#334155" : "#F8FAFC";
  const accentColor = primaryColor || (mode === 'dark' ? '#FACC15' : '#3B82F6');
  
  // Process the amount with our improved function
  const amountInfo = formatAmount(transaction.amount, transaction.currency);
  
  // Determine font size based on theme setting
  const getFontSize = () => {
    switch (fontSize) {
      case 'small':
        return '0.9rem';
      case 'large':
        return '1.1rem';
      case 'extra-large':
        return '1.25rem';
      case 'medium':
      default:
        return '1rem';
    }
  };
  
  return (
    <TableRow
      sx={{
        cursor: "pointer",
        "&:hover": { backgroundColor: hoverColor },
        borderBottom: mode === 'dark' 
          ? '1px solid rgba(255, 255, 255, 0.05)' 
          : '1px solid rgba(0, 0, 0, 0.05)'
      }}
      onClick={() => onClick(transaction)}
    >
      {!isMobile && (
        <TableCell 
          sx={{ 
            color: textColor,
            fontSize: getFontSize() // Apply theme font size
          }}
        >
          {transaction.reference}
        </TableCell>
      )}
      
      <TableCell 
        sx={{ 
          color: textColor,
          fontSize: getFontSize() // Apply theme font size
        }}
      >
        {transaction.customerName}
      </TableCell>
      
      <TableCell>
        <Chip
          label={transaction.type}
          sx={{
            ...getTransactionColor(transaction.type, mode),
            fontWeight: "bold",
            width: "100px",
            justifyContent: "center",
            fontSize: fontSize === 'small' ? '0.75rem' : 
                     fontSize === 'large' ? '0.875rem' : 
                     fontSize === 'extra-large' ? '0.95rem' : '0.8125rem', // Adjust chip text size based on theme
          }}
        />
      </TableCell>
      
      {!isMobile && (
        <TableCell 
          sx={{ 
            color: textColor,
            fontSize: getFontSize() // Apply theme font size
          }}
        >
          {transaction.currency}
        </TableCell>
      )}
      
      <TableCell 
        sx={{ 
          color: textColor,
          maxWidth: { xs: '100px', sm: '150px' },
          overflow: 'hidden'
        }}
      >
        <Tooltip 
          title={amountInfo.truncated ? amountInfo.full : ""} 
          arrow 
          placement="top"
          componentsProps={{
            tooltip: {
              sx: {
                bgcolor: mode === 'dark' ? '#0F172A' : '#1E293B',
                '& .MuiTooltip-arrow': {
                  color: mode === 'dark' ? '#0F172A' : '#1E293B'
                },
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                fontSize: getFontSize() // Apply theme font size to tooltip text
              }
            }
          }}
        >
          <Typography 
            sx={{ 
              fontSize: getFontSize(), // Apply theme font size to amount
              fontWeight: "bold", 
              color: textColor,
              display: 'inline-block',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%',
              '& .amount-value': {
                color: accentColor
              }
            }}
          >
            {amountInfo.display}
          </Typography>
        </Tooltip>
      </TableCell>
      
      {!isMobile && (
        <>
          <TableCell 
            sx={{ 
              color: textColor,
              fontSize: getFontSize() // Apply theme font size
            }}
          >
            {transaction.createdAt ? format(new Date(transaction.createdAt), "dd MMM yyyy HH:mm") : "N/A"}
          </TableCell>
          
          <TableCell sx={{ color: textColor }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Avatar {...stringAvatar(transaction.createdBy?.fullName || "Unknown User")} />
              <Typography 
                variant="body2"
                sx={{
                  fontSize: fontSize === 'small' ? '0.75rem' : 
                           fontSize === 'large' ? '0.95rem' : 
                           fontSize === 'extra-large' ? '1.1rem' : '0.875rem', 
                }}
              >
                {transaction.createdBy?.fullName || "Unknown"}
              </Typography>
            </Box>
          </TableCell>
        </>
      )}
    </TableRow>
  );
};

TransactionRow.propTypes = {
  transaction: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    reference: PropTypes.string.isRequired,
    customerName: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    currency: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    createdAt: PropTypes.string,
    createdBy: PropTypes.shape({
      fullName: PropTypes.string
    })
  }).isRequired,
  onClick: PropTypes.func.isRequired,
  isMobile: PropTypes.bool.isRequired
};

export default TransactionRow;