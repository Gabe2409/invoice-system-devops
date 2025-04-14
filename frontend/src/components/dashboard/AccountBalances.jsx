import PropTypes from "prop-types";
import { 
  Box, 
  Paper, 
  Typography, 
  Skeleton, 
  Fade,
  Grid,
  useMediaQuery,
  Card,
  CardContent
} from "@mui/material";
import { useTheme as useMuiTheme } from "@mui/material/styles";
import { useTheme } from "../../context/ThemeContext"; // Import your custom theme hook
import { formatCurrency, getCurrencySymbol, getCurrencyColor } from "../../utils/utils"; 

const AccountBalances = ({ accounts, loading }) => {
  const muiTheme = useMuiTheme();
  const { mode, primaryColor } = useTheme(); // Get theme settings from your context
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  
  // Convert accounts data to array if it's not already
  // This handles both old format (array) and new format (object with accounts property)
  const accountsArray = Array.isArray(accounts) 
    ? accounts 
    : (accounts && accounts.accounts ? accounts.accounts : []);
  
  // Custom column breakpoints for better display across screen sizes
  const getGridColumns = () => {
    if (isMobile) return 12; // Full width on mobile
    if (accountsArray?.length <= 2) return 6; // Two columns if 1-2 accounts
    return 4; // Three columns for 3+ accounts
  };

  const gridCols = getGridColumns();

  // Theme-based colors
  const cardBgColor = mode === 'dark' ? "#1E293B" : "#FFFFFF";
  const textPrimaryColor = mode === 'dark' ? "#FFFFFF" : "#1E293B";
  const textSecondaryColor = mode === 'dark' ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)";
  const borderColor = mode === 'dark' ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.1)";
  const dashBorderColor = mode === 'dark' ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)";
  const skeletonBgColor = mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
  const accentColor = primaryColor || (mode === 'dark' ? '#FACC15' : '#3B82F6'); 

  if (loading) {
    return (
      <Grid container spacing={isMobile ? 1.5 : 2}>
        {[1, 2, 3].map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item}>
            <Skeleton 
              variant="rounded" 
              height={isMobile ? 80 : 100} 
              animation="wave"
              sx={{ 
                bgcolor: skeletonBgColor,
                borderRadius: '8px',
              }}
            />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (!accountsArray || accountsArray.length === 0) {
    return (
      <Card
        sx={{
          backgroundColor: cardBgColor,
          borderRadius: "8px",
          textAlign: "center",
          border: `1px dashed ${dashBorderColor}`
        }}
        elevation={0}
      >
        <CardContent sx={{ py: 3 }}>
          <Typography variant="h6" sx={{ color: accentColor, fontWeight: "medium" }}>
            No Accounts Available
          </Typography>
          <Typography variant="body2" sx={{ color: textSecondaryColor, mt: 1 }}>
            Contact an administrator to set up account balances.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Fade in={true} timeout={500}>
      <Grid container spacing={isMobile ? 1.5 : 2}>
        {accountsArray.map((account) => (
          <Grid item xs={12} sm={gridCols} key={account.currency}>
            <Card
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: cardBgColor,
                borderRadius: "8px",
                height: "100%",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: mode === 'dark' 
                    ? "0 8px 16px rgba(0, 0, 0, 0.3)" 
                    : "0 8px 16px rgba(0, 0, 0, 0.1)"
                },
                overflow: "hidden", 
                border: `1px solid ${borderColor}`
              }}
              elevation={2}
            >
              <CardContent sx={{ 
                width: "100%", 
                p: isMobile ? 2 : "20px", 
                "&:last-child": { pb: isMobile ? 2 : "20px" } 
              }}>
                <Box display="flex" alignItems="center" gap={2}>
                  {/* Currency Icon Box */}
                  <Box
                    sx={{
                      width: isMobile ? 40 : 48,
                      height: isMobile ? 40 : 48,
                      borderRadius: "50%",
                      backgroundColor: getCurrencyColor(account.currency),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: mode === 'dark' 
                        ? "0 4px 8px rgba(0,0,0,0.3)" 
                        : "0 4px 8px rgba(0,0,0,0.1)",
                      flexShrink: 0
                    }}
                  >
                    <Typography sx={{ 
                      color: "white", 
                      fontWeight: "bold", 
                      fontSize: isMobile ? "1rem" : "1.2rem" 
                    }}>
                      {getCurrencySymbol(account.currency)}
                    </Typography>
                  </Box>

                  {/* Balance Details */}
                  <Box sx={{ 
                    width: "calc(100% - 60px)",
                    overflow: "hidden"
                  }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: accentColor, 
                        fontWeight: "medium",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                      }}
                    >
                      {account.currency} Balance
                    </Typography>
                    <Typography 
                      variant={isMobile ? "body1" : "h6"} 
                      sx={{ 
                        color: textPrimaryColor, 
                        fontWeight: "600",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                      }}
                    >
                      {formatCurrency(account.balance, account.currency)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Fade>
  );
};

AccountBalances.propTypes = {
  accounts: PropTypes.oneOfType([
    PropTypes.arrayOf(
      PropTypes.shape({
        currency: PropTypes.string.isRequired,
        balance: PropTypes.number.isRequired,
      })
    ),
    PropTypes.shape({
      accounts: PropTypes.arrayOf(
        PropTypes.shape({
          currency: PropTypes.string.isRequired,
          balance: PropTypes.number.isRequired,
        })
      )
    })
  ]),
  loading: PropTypes.bool,
};

AccountBalances.defaultProps = {
  accounts: [],
  loading: false,
};

export default AccountBalances;