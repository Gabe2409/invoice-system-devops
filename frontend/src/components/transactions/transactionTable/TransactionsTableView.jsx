import { Paper, TableContainer, Table } from "@mui/material";
import PropTypes from "prop-types";
import { useTheme } from "../../../context/ThemeContext"; // Import your theme context

import TransactionsTableHeader from "./TransactionsTableHeader";
import TransactionRow from "./TransactionRow";
import TableSkeleton from "./TableSkeleton";
import EmptyState from "./EmptyState";
import LoadingState from "./LoadingState";
import TablePaginationControls from "./TablePaginationControls";

const TransactionsTableView = ({
  transactions,
  loading,
  initialLoad,
  onTransactionClick,
  order,
  orderBy,
  onSortRequest,
  page,
  rowsPerPage,
  totalTransactions,
  onChangePage,
  onChangeRowsPerPage,
  onRefresh,
  isMobile
}) => {
  const { mode } = useTheme(); // Get theme mode
  
  // Theme-based colors
  const paperBgColor = mode === 'dark' ? "#1E293B" : "#FFFFFF";
  const shadowColor = mode === 'dark' 
    ? '0 4px 8px rgba(0, 0, 0, 0.25)' 
    : '0 2px 4px rgba(0, 0, 0, 0.08)';
  
  const columnCount = isMobile ? 3 : 7;

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
          <TransactionsTableHeader 
            order={order}
            orderBy={orderBy}
            onSortRequest={onSortRequest}
            isMobile={isMobile}
          />
          
          {initialLoad ? (
            <TableSkeleton rowCount={5} isMobile={isMobile} />
          ) : loading ? (
            <LoadingState colSpan={columnCount} />
          ) : transactions.length === 0 ? (
            <EmptyState colSpan={columnCount} onRefresh={onRefresh} />
          ) : (
            <tbody>
              {transactions.map((transaction) => (
                <TransactionRow
                  key={transaction._id}
                  transaction={transaction}
                  onClick={onTransactionClick}
                  isMobile={isMobile}
                />
              ))}
            </tbody>
          )}
        </Table>
      </TableContainer>

      {/* Pagination Controls */}
      <TablePaginationControls
        count={totalTransactions}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={onChangePage}
        onRowsPerPageChange={onChangeRowsPerPage}
      />
    </Paper>
  );
};

TransactionsTableView.propTypes = {
  transactions: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  initialLoad: PropTypes.bool.isRequired,
  onTransactionClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
  onSortRequest: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  totalTransactions: PropTypes.number.isRequired,
  onChangePage: PropTypes.func.isRequired,
  onChangeRowsPerPage: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired,
  isMobile: PropTypes.bool.isRequired
};

export default TransactionsTableView;