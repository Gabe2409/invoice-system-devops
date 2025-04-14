import PropTypes from "prop-types";
import { DialogTitle, Box, Typography, Chip, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { getTransactionColor } from "../../../utils/utils";

const TransactionHeader = ({ transaction, onClose, themeProps }) => {
  const { textPrimaryColor } = themeProps;
  
  return (
    <DialogTitle
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 3,
        color: textPrimaryColor
      }}
    >
      {/* Left Section: Transaction Details + Type */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Typography variant="h5" fontWeight="bold">Transaction Details</Typography>
        <Chip
          label={transaction.type}
          sx={{
            ...getTransactionColor(transaction.type, themeProps.mode),
            fontWeight: "bold",
            fontSize: "0.875rem",
            height: "28px"
          }}
        />
      </Box>

      {/* Close Button */}
      <IconButton onClick={onClose} sx={{ color: textPrimaryColor }}>
        <CloseIcon />
      </IconButton>
    </DialogTitle>
  );
};

TransactionHeader.propTypes = {
  transaction: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  themeProps: PropTypes.object.isRequired
};

export default TransactionHeader;