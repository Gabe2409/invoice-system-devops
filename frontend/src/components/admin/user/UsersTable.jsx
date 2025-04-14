import { useEffect, useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import { Box, Alert, Button, Fade, useMediaQuery } from "@mui/material";
import { useTheme as useMuiTheme } from "@mui/material/styles";
import { useTheme } from "../../../context/ThemeContext";

import SearchBar from "./SearchBar";
import FilterPanel from "./FilterPanel";
import UsersTableView from "./UsersTableView";
import ViewUserModal from "./ViewUserModal";
import CreateEditUserModal from "./CreateEditUserModal";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const UsersTable = ({ search: externalSearch, refreshKey }) => {
  // Get theme settings
  const muiTheme = useMuiTheme();
  const { mode, primaryColor } = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));
  
  // State for users and pagination
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState(null);
  
  // State for modals
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCreateEditModalOpen, setIsCreateEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  
  // State for sorting and pagination
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("createdAt");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // State for filters
  const [filters, setFilters] = useState({
    search: externalSearch || "",
    role: "",
    dateFrom: "", 
    dateTo: ""
  });
  
  // UI state
  const [showFilters, setShowFilters] = useState(false);

  // User roles for dropdown
  const userRoles = ["admin", "staff"];

  // Theme-based colors
  const alertBgColor = mode === 'dark' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)';
  const alertTextColor = mode === 'dark' ? '#FCA5A5' : '#B91C1C';
  const alertButtonColor = mode === 'dark' ? '#FCA5A5' : '#B91C1C';
  const accentColor = primaryColor || (mode === 'dark' ? '#FACC15' : '#3B82F6');

  useEffect(() => {
    // Update search from external props
    if (externalSearch !== undefined) {
      setFilters(prev => ({ ...prev, search: externalSearch }));
    }
  }, [externalSearch]);

  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage, order, orderBy, refreshKey]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found, user not authenticated");
      }

      // Build query parameters
      const params = new URLSearchParams({
        page: page + 1, // Backend uses 1-based pagination
        limit: rowsPerPage,
        sortBy: orderBy,
        sortOrder: order === 'asc' ? '1' : '-1',
        search: filters.search || '',
        ...(filters.role && { role: filters.role }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo })
      });

      const { data } = await axios.get(`${BASE_URL}/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers(data.users);
      setTotalUsers(data.pagination.total);
    } catch (error) {
      console.error("Error fetching users:", error.response?.data?.message || error.message);
      setError(error.response?.data?.message || "Failed to load users. Please try again.");
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedUser(null);
  };

  const handleOpenCreateModal = () => {
    setSelectedUser(null);
    setModalMode('create');
    setIsCreateEditModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setSelectedUser(user);
    setModalMode('edit');
    setIsCreateEditModalOpen(true);
    setIsViewModalOpen(false);
  };

  const handleCloseCreateEditModal = () => {
    setIsCreateEditModalOpen(false);
    setSelectedUser(null);
  };

  const handleUserSubmit = async (userData, isEdit = false) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found, user not authenticated");
      }
      
      if (isEdit && selectedUser) {
        // Update existing user
        await axios.put(
          `${BASE_URL}/users/${selectedUser._id}`,
          userData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Create new user
        await axios.post(
          `${BASE_URL}/auth/register`,
          userData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      // Refresh user list
      fetchUsers();
      handleCloseCreateEditModal();
      
    } catch (error) {
      console.error("Error submitting user:", error.response?.data?.message || error.message);
      return { error: error.response?.data?.message || "Failed to save user. Please try again." };
    }
    
    return { success: true };
  };

  const handleDeleteUser = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found, user not authenticated");
      }
      
      await axios.delete(
        `${BASE_URL}/users/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh user list
      fetchUsers();
      handleCloseViewModal();
      
      return { success: true };
    } catch (error) {
      console.error("Error deleting user:", error.response?.data?.message || error.message);
      return { error: error.response?.data?.message || "Failed to delete user. Please try again." };
    }
  };

  const handleSortRequest = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      role: "",
      dateFrom: "",
      dateTo: ""
    });
    setPage(0);
    // Fetch with reset filters after state updates
    setTimeout(() => fetchUsers(), 0);
  };

  const handleToggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <Fade in={true} timeout={500}>
      <Box>
        {/* Search and Filter Controls */}
        <SearchBar 
          search={filters.search}
          onSearchChange={(value) => handleFilterChange('search', value)}
          onSearchSubmit={handleSearchSubmit}
          onToggleFilters={handleToggleFilters}
          showFilters={showFilters}
          loading={loading}
          onRefresh={fetchUsers}
          onNewItemClick={handleOpenCreateModal}
          newItemLabel="New User"
        />

        <FilterPanel 
          show={showFilters}
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          onApplyFilters={fetchUsers}
          availableRoles={userRoles}
          loading={loading}
        />

        {/* Error Alert */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2,
              backgroundColor: alertBgColor,
              color: alertTextColor,
              '& .MuiAlert-icon': {
                color: alertTextColor
              }
            }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={fetchUsers}
                sx={{ color: alertButtonColor }}
              >
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {/* Users Table */}
        <UsersTableView 
          users={users}
          loading={loading}
          initialLoad={initialLoad}
          onUserClick={handleUserClick}
          order={order}
          orderBy={orderBy}
          onSortRequest={handleSortRequest}
          page={page}
          rowsPerPage={rowsPerPage}
          totalUsers={totalUsers}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
          onRefresh={fetchUsers}
          isMobile={isMobile}
        />

        {/* View User Dialog */}
        <ViewUserModal 
          isOpen={isViewModalOpen} 
          onClose={handleCloseViewModal} 
          user={selectedUser} 
          onEdit={() => handleOpenEditModal(selectedUser)}
          onDelete={() => handleDeleteUser(selectedUser?._id)}
        />

        {/* Create/Edit User Dialog */}
        <CreateEditUserModal
          isOpen={isCreateEditModalOpen}
          onClose={handleCloseCreateEditModal}
          user={selectedUser}
          mode={modalMode}
          onSubmit={(userData) => handleUserSubmit(userData, modalMode === 'edit')}
          availableRoles={userRoles}
        />
      </Box>
    </Fade>
  );
};

// Define prop types
UsersTable.propTypes = {
  search: PropTypes.string,
  refreshKey: PropTypes.number
};

// Default props
UsersTable.defaultProps = {
  search: "",
  refreshKey: 0
};

export default UsersTable;