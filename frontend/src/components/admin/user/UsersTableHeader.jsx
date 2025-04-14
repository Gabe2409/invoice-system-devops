import { TableHead, TableRow, TableCell, TableSortLabel } from "@mui/material";
import PropTypes from "prop-types";
import { useTheme } from "../../../context/ThemeContext";

const UsersTableHeader = ({ order, orderBy, onSortRequest, isMobile }) => {
  const { mode } = useTheme();
  
  // Theme-based colors
  const headerBgColor = mode === 'dark' ? "#334155" : "#F1F5F9";
  const textColor = mode === 'dark' ? "white" : "#1E293B";
  
  const headers = [
    { id: "userName", label: "Username" },
    { id: "fullName", label: "Full Name" },
    { id: "role", label: "Role" },
    { id: "lastLogin", label: "Last Login", hideOnMobile: true },
    { id: "createdAt", label: "Created Date", hideOnMobile: true },
    { id: "actions", label: "Actions", sortable: false }
  ];

  return (
    <TableHead>
      <TableRow sx={{ backgroundColor: headerBgColor }}>
        {headers.map((column) =>
          isMobile && column.hideOnMobile ? null : (
            <TableCell 
              key={column.id} 
              sx={{ 
                color: textColor, 
                fontWeight: "medium",
                borderBottom: mode === 'dark' 
                  ? '1px solid rgba(255, 255, 255, 0.1)' 
                  : '1px solid rgba(0, 0, 0, 0.1)'
              }}
            >
              {column.sortable !== false ? (
                <TableSortLabel
                  active={orderBy === column.id}
                  direction={orderBy === column.id ? order : "asc"}
                  onClick={() => onSortRequest(column.id)}
                  sx={{ 
                    color: textColor, 
                    "&.MuiTableSortLabel-root:hover": { color: textColor },
                    "& .MuiTableSortLabel-icon": {
                      color: `${textColor} !important`
                    }
                  }}
                >
                  {column.label}
                </TableSortLabel>
              ) : (
                column.label
              )}
            </TableCell>
          )
        )}
      </TableRow>
    </TableHead>
  );
};

UsersTableHeader.propTypes = {
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
  onSortRequest: PropTypes.func.isRequired,
  isMobile: PropTypes.bool.isRequired
};

export default UsersTableHeader;