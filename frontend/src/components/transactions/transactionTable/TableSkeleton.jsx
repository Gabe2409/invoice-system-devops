import { TableBody, TableRow, TableCell, Skeleton, Box } from "@mui/material";
import PropTypes from "prop-types";
import { useTheme } from "../../../context/ThemeContext"; // Import your theme context

const TableSkeleton = ({ rowCount = 5, isMobile }) => {
  const { mode } = useTheme(); // Get theme mode
  
  // Theme-based colors
  const skeletonColor = mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.1)';
  
  return (
    <TableBody>
      {[...Array(rowCount)].map((_, index) => (
        <TableRow key={index}>
          {!isMobile && <TableCell><Skeleton variant="text" sx={{ bgcolor: skeletonColor }} /></TableCell>}
          <TableCell><Skeleton variant="text" sx={{ bgcolor: skeletonColor }} /></TableCell>
          <TableCell><Skeleton variant="rounded" width={100} height={32} sx={{ bgcolor: skeletonColor }} /></TableCell>
          {!isMobile && <TableCell><Skeleton variant="text" sx={{ bgcolor: skeletonColor }} /></TableCell>}
          <TableCell><Skeleton variant="text" sx={{ bgcolor: skeletonColor }} /></TableCell>
          {!isMobile && (
            <>
              <TableCell><Skeleton variant="text" sx={{ bgcolor: skeletonColor }} /></TableCell>
              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Skeleton variant="circular" width={40} height={40} sx={{ bgcolor: skeletonColor }} />
                  <Skeleton variant="text" width={80} sx={{ bgcolor: skeletonColor }} />
                </Box>
              </TableCell>
            </>
          )}
        </TableRow>
      ))}
    </TableBody>
  );
};

TableSkeleton.propTypes = {
  rowCount: PropTypes.number,
  isMobile: PropTypes.bool.isRequired
};

export default TableSkeleton;