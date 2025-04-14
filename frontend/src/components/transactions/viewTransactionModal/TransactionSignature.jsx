import PropTypes from "prop-types";
import { Box, Typography, Paper } from "@mui/material";

const TransactionSignature = ({ signatureUrl, themeProps }) => {
  const { 
    accentColor, 
    paperBgColor = themeProps.mode === 'dark' ? 'rgba(15, 23, 42, 0.4)' : 'rgba(241, 245, 249, 0.4)',
    borderColor = themeProps.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
  } = themeProps;

  return (
    <Paper 
      elevation={0}
      sx={{ 
        bgcolor: paperBgColor, 
        p: 2, 
        borderRadius: 2,
        border: `1px solid ${borderColor}`
      }}
    >
      <Typography variant="h6" sx={{ color: accentColor, mb: 1.5 }}>
        Customer Signature
      </Typography>
      
      <Box 
        sx={{ 
          borderRadius: 1,
          overflow: 'hidden',
          bgcolor: 'white',
          p: 1,
          textAlign: 'center'
        }}
      >
        <img
          src={signatureUrl}
          alt="Signature"
          style={{
            maxWidth: "100%",
            maxHeight: "150px"
          }}
        />
      </Box>
    </Paper>
  );
};

TransactionSignature.propTypes = {
  signatureUrl: PropTypes.string.isRequired,
  themeProps: PropTypes.object.isRequired
};

export default TransactionSignature;