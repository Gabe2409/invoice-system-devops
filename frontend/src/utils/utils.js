/**
 * Format currency amount with proper formatting based on currency type
 * 
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency code (e.g., "USD", "BTC", "TTD")
 * @returns {string} Formatted currency string
 */
const formatCurrency = (amount, currency = "TTD") => {
  try {
    // Ensure amount is a valid number
    if (isNaN(amount) || amount === null || amount === undefined) {
      return `Invalid Amount`;
    }

    // Convert amount to a number to ensure proper formatting
    const numericAmount = parseFloat(amount);
    
    // Determine decimal places based on currency type
    let fractionDigits = 2; // Default for fiat currencies
    
    // For cryptocurrencies, use appropriate decimal places
    const cryptoCurrencies = ["BTC", "ETH", "XRP", "LTC", "BCH", "BNB", "ADA", "SOL", "DOT", "AVAX", "LINK", "MATIC"];
    const stablecoins = ["USDT", "USDC", "DAI", "BUSD", "UST", "TUSD"];
    
    if (cryptoCurrencies.includes(currency.toUpperCase())) {
      fractionDigits = 8; // Most cryptos display up to 8 decimal places
    } else if (stablecoins.includes(currency.toUpperCase())) {
      fractionDigits = 2; // Stablecoins typically use 2 decimal places like fiat
    }
    
    // Format amount with appropriate decimal places
    const formattedAmount = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(numericAmount);

    // Append the currency code in uppercase
    return `${formattedAmount} ${currency.toUpperCase()}`;

  } catch (error) {
    console.error("Currency Formatting Error:", error);
    return "Formatting Error";
  }
};


// Improved function to format and handle large amounts
const formatAmount = (amount, currency, maxLength = 15) => {
  // Handle scientific notation or extremely large values
  if (typeof amount === 'number' && (amount.toString().includes('e') || amount > 1e15)) {
    // Get the formatted value from formatCurrency, which might include scientific notation
    const rawFormatted = formatCurrency(amount, currency);
    
    // If in scientific notation or extreme value, create a simplified display
    if (amount >= 1e15) { // Quadrillions and above
      const unit = amount >= 1e18 ? 'Q' : 'P'; // Q for quintillion, P for quadrillion 
      const simplified = amount >= 1e18 ? (amount / 1e18).toFixed(2) : (amount / 1e15).toFixed(2);
      
      return {
        display: `${currency} ${simplified}${unit}`,
        full: rawFormatted,
        truncated: true
      };
    } else if (amount >= 1e12) { // Trillions
      const simplified = (amount / 1e12).toFixed(2);
      return {
        display: `${currency} ${simplified}T`,
        full: rawFormatted,
        truncated: true
      };
    } else { // Billions
      const simplified = (amount / 1e9).toFixed(2);
      return {
        display: `${currency} ${simplified}B`,
        full: rawFormatted,
        truncated: true
      };
    }
  }
  
  // First format the currency for normal numbers
  const formattedAmount = formatCurrency(amount, currency);
  
  // Check if it's a large number but not in scientific notation
  if (amount > 1e9) { // If greater than 1 billion
    // Format it with abbreviations
    const abbreviatedAmount = amount >= 1e12 
      ? `${(amount / 1e12).toFixed(2)}T` // Trillions
      : `${(amount / 1e9).toFixed(2)}B`;   // Billions
      
    return {
      display: `${currency} ${abbreviatedAmount}`,
      full: formattedAmount,
      truncated: true
    };
  }
  
  // If it's not extremely large but still needs truncation
  if (formattedAmount.length > maxLength) {
    return {
      display: `${formattedAmount.slice(0, maxLength)}...`,
      full: formattedAmount,
      truncated: true
    };
  }
  
  // Regular case - no truncation needed
  return {
    display: formattedAmount,
    full: formattedAmount,
    truncated: false
  };
};

  // Function to return color based on transaction type
  const getTransactionColor = (type) => {
    switch (type) {
      case "Cash In":
        return { bgcolor: "green", color: "white" }; // Orange/Brown
      case "Cash Out":
        return { bgcolor: "red", color: "white" }; // Red
      case "Buy":
        return { bgcolor: "blue", color: "white" }; // Blue
      case "Sell":
        return { bgcolor: "orange", color: "white" }; // Green
      default:
        return { bgcolor: "gray", color: "white" };
    }
  };
  

  function stringToColor(string) {
    let hash = 0;
    let i;
  
    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
  
    let color = "#";
  
    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
  
    return color;
  }
  
function stringAvatar(name) {
  if (!name) return { sx: { bgcolor: "gray", fontSize: 14 }, children: "U" }; 

  const nameParts = name.split(" ");
  const initials =
    nameParts.length >= 2
      ? `${nameParts[0][0]}${nameParts[1][0]}`
      : `${nameParts[0][0]}`;

    return {
      sx: {
        bgcolor: stringToColor(name),
        fontSize: 12, 
        width: 30,
        height: 30,
      },
      children: initials.toUpperCase(),
    };
}

// Currency icon mapping for common currencies and cryptocurrencies
function getCurrencySymbol(currency){
  const symbols = {
    "USD": "$",
    "EUR": "€",
    "GBP": "£",
    "JPY": "¥",
    "CAD": "$",
    "AUD": "$",
    "TTD": "TT$",
    "BTC": "₿",
    "ETH": "Ξ",
    "USDT": "₮",
    "XRP": "XRP",
    "LTC": "Ł",
    "BCH": "BCH",
    "BNB": "BNB",
    "ADA": "₳",
    "SOL": "SOL",
    "DOT": "DOT",
    "AVAX": "AVAX",
    "LINK": "LINK",
    "MATIC": "MATIC"
  };
  
  return symbols[currency] || currency.substring(0, 1);
};

// Get background color for currency icon based on currency type
function getCurrencyColor(currency){
  // Crypto currencies
  if (["BTC", "ETH", "USDT", "XRP", "LTC", "BCH", "BNB", "ADA", "SOL", "DOT", "AVAX", "LINK", "MATIC"].includes(currency)) {
    const colors = {
      "BTC": "#F7931A",    // Bitcoin orange
      "ETH": "#627EEA",    // Ethereum blue
      "USDT": "#26A17B",   // Tether green
      "XRP": "#23292F",    // Ripple dark
      "LTC": "#345D9D",    // Litecoin blue
      "BCH": "#8DC351",    // Bitcoin Cash green
      "BNB": "#F3BA2F",    // Binance yellow
      "ADA": "#0033AD",    // Cardano blue
      "SOL": "#14F195",    // Solana green
      "DOT": "#E6007A",    // Polkadot pink
      "AVAX": "#E84142",   // Avalanche red
      "LINK": "#2A5ADA",   // Chainlink blue
      "MATIC": "#8247E5",  // Polygon purple
    };
    return colors[currency] || "#6D28D9"; // Default purple for other crypto
  }
  
  // Fiat currencies
  const fiatColors = {
    "USD": "#3B82F6",   // Blue
    "EUR": "#10B981",   // Green
    "GBP": "#EC4899",   // Pink
    "JPY": "#F59E0B",   // Amber
    "CAD": "#EF4444",   // Red
    "AUD": "#3B82F6",   // Blue
    "TTD": "#3B82F6",   // Blue
  };
  
  return fiatColors[currency] || "#3B82F6"; // Default blue for other fiat
};

  export {formatCurrency, getTransactionColor, stringAvatar, formatAmount, getCurrencySymbol, getCurrencyColor};