import { Paper, TableContainer, Table } from "@mui/material";
import PropTypes from "prop-types";
import { useTheme } from "../../../context/ThemeContext";

import UsersTableHeader from "./UsersTableHeader";
import UserRow from "./UserRow";
import TableSkeleton from "./TableSkeleton";
import EmptyState from "./EmptyState";
import LoadingState from "./LoadingState";
import TablePaginationControls from "./TablePaginationControls";

const UsersTableView = ({
  users,
  loading,
  initialLoad,
  onUserClick,
  order,
  orderBy,
  onSortRequest,
  page,
  rowsPerPage,
  totalUsers,
  onChangePage,
  onChangeRowsPerPage,
  onRefresh,
  isMobile
}) => {
  const { mode } = useTheme(); 
  
  // Theme-based colors
  const paperBgColor = mode === 'dark' ? "#1E293B" : "#FFFFFF";
  const shadowColor = mode === 'dark' 
    ? '0 4px 8px rgba(0, 0, 0, 0.25)' 
    : '0 2px 4px rgba(0, 0, 0, 0.08)';
  
  const columnCount = isMobile ? 3 : 6;

  return (
    <Paper 
      sx={{ 
        backgroundColor: paperBgColor, 
        borderRadius: 2,
        boxShadow: shadowColor,
        border: mode === 'dark' 
          ? '1px solid rgba(255, 255, 255, 0.05)' 
          : '1px solid rgba(0, 0, 0, 0.05)'
      }}
    >
      <TableContainer>
        <Table>
          <UsersTableHeader 
            order={order}
            orderBy={orderBy}
            onSortRequest={onSortRequest}
            isMobile={isMobile}
          />
          
          {initialLoad ? (
            <TableSkeleton rowCount={5} isMobile={isMobile} />
          ) : loading ? (
            <LoadingState colSpan={columnCount} />
          ) : users.length === 0 ? (
            <EmptyState colSpan={columnCount} onRefresh={onRefresh} />
          ) : (
            <tbody>
              {users.map((user) => (
                <UserRow
                  key={user._id}
                  user={user}
                  onClick={onUserClick}
                  isMobile={isMobile}
                />
              ))}
            </tbody>
          )}
        </Table>
      </TableContainer>

      {/* Pagination Controls */}
      <TablePaginationControls
        count={totalUsers}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={onChangePage}
        onRowsPerPageChange={onChangeRowsPerPage}
      />
    </Paper>
  );
};

UsersTableView.propTypes = {
  users: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  initialLoad: PropTypes.bool.isRequired,
  onUserClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
  onSortRequest: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  totalUsers: PropTypes.number.isRequired,
  onChangePage: PropTypes.func.isRequired,
  onChangeRowsPerPage: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired,
  isMobile: PropTypes.bool.isRequired
};

export default UsersTableView;