import { TablePagination } from "@mui/material";
import PropTypes from "prop-types";
import { useTheme } from "../../../context/ThemeContext"; // Import your theme context

const TablePaginationControls = ({
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}) => {
  const { mode } = useTheme(); // Get theme mode
  
  // Theme-based colors
  const bgColor = mode === 'dark' ? "#1E293B" : "#FFFFFF";
  const textColor = mode === 'dark' ? "white" : "#1E293B";
  const borderColor = mode === 'dark' ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)";
  
  return (
    <TablePagination
      component="div"
      count={count}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={onPageChange}
      onRowsPerPageChange={onRowsPerPageChange}
      sx={{ 
        color: textColor, 
        bgcolor: bgColor, 
        borderTop: `1px solid ${borderColor}`,
        '& .MuiTablePagination-select': {
          color: textColor
        },
        '& .MuiTablePagination-selectIcon': {
          color: textColor
        },
        '& .MuiTablePagination-displayedRows': {
          color: textColor
        },
        '& .MuiIconButton-root': {
          color: textColor
        },
        '& .MuiIconButton-root.Mui-disabled': {
          color: mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'
        }
      }}
    />
  );
};

TablePaginationControls.propTypes = {
  count: PropTypes.number.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onRowsPerPageChange: PropTypes.func.isRequired,
};

export default TablePaginationControls;