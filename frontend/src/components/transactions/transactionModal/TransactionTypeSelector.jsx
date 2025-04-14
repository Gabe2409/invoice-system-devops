import { Box, Button, Typography, useMediaQuery } from "@mui/material";
import { useTheme as useMuiTheme } from "@mui/material/styles";
import { useTheme } from "../../../context/ThemeContext";

const transactionTypes = ["Cash In", "Cash Out", "Buy", "Sell"];

const TransactionTypeSelector = ({ type, setType }) => {
  const muiTheme = useMuiTheme();
  const { mode, primaryColor } = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  
  // Theme-based colors
  const textColor = mode === 'dark' ? "white" : "#1E293B";
  const inputBorderColor = mode === 'dark' ? "rgba(255, 255, 255, 0.23)" : "rgba(0, 0, 0, 0.23)";
  const buttonHoverColor = mode === 'dark' ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.04)";
  const accentColor = primaryColor || (mode === 'dark' ? '#FACC15' : '#3B82F6');

  return (
    <>
      <Typography variant="subtitle1" sx={{ color: textColor, mb: 1, fontWeight: "medium" }}>
        Transaction Type
      </Typography>
      <Box sx={{ 
        display: "flex", 
        flexDirection: "row", 
        gap: 1, 
        mb: 2,
        flexWrap: "wrap"
      }}>
        {transactionTypes.map((option) => (
          <Button
            key={option}
            variant={type === option ? "contained" : "outlined"}
            onClick={() => setType(option)}
            size="small" 
            sx={{
              flex: 1,
              minWidth: 0, 
              py: 0.75,
              px: 1,
              bgcolor: type === option ? accentColor : "transparent",
              color: type === option ? 
                (mode === 'dark' ? "black" : "white") : 
                textColor,
              border: type === option ? "none" : `1px solid ${inputBorderColor}`,
              "&:hover": { 
                bgcolor: type === option ? 
                  (mode === 'dark' ? `${accentColor}E6` : `${accentColor}CC`) : 
                  buttonHoverColor,
                borderColor: type !== option ? inputBorderColor : "none"
              },
            }}
          >
            {option}
          </Button>
        ))}
      </Box>
    </>
  );
};

export default TransactionTypeSelector;