import { Box, Button, Typography, useMediaQuery } from "@mui/material";
import SignatureCanvas from "react-signature-canvas";
import { useTheme as useMuiTheme } from "@mui/material/styles";
import { useTheme } from "../../../context/ThemeContext"; // Import your theme context
import { useEffect, useState } from "react";

const SignaturePad = ({ sigCanvas }) => {
  const muiTheme = useMuiTheme();
  const { mode, primaryColor } = useTheme(); // Get theme settings
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const [canvasWidth, setCanvasWidth] = useState(450);
  
  // Theme-based colors
  const textColor = mode === 'dark' ? "white" : "#1E293B";
  const borderColor = mode === 'dark' ? "rgba(255, 255, 255, 0.23)" : "rgba(0, 0, 0, 0.23)";
  const accentColor = primaryColor || (mode === 'dark' ? '#FACC15' : '#3B82F6');
  
  // Adjust canvas width based on container width
  useEffect(() => {
    const handleResize = () => {
      const containerWidth = document.querySelector('.signature-container')?.clientWidth || 450;
      setCanvasWidth(containerWidth > 0 ? containerWidth : 450);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <Typography variant="subtitle1" sx={{ color: textColor, mt: 2, mb: 1, fontWeight: "medium" }}>
        Customer Signature
      </Typography>
      <Box
        className="signature-container"
        sx={{
          border: `2px solid ${borderColor}`,
          borderRadius: "8px",
          backgroundColor: "white",
          height: isMobile ? "150px" : "150px", // Same height for consistency
          mb: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden", // Prevents signature from overflowing
          width: "100%"
        }}
      >
        <SignatureCanvas
          ref={sigCanvas}
          penColor="black"
          canvasProps={{
            width: canvasWidth,
            height: isMobile ? 150 : 150,
            className: "sigCanvas",
            style: { width: "100%", height: "100%" }
          }}
        />
        <Button
          onClick={() => sigCanvas.current?.clear()}
          sx={{
            position: "absolute",
            bottom: "8px",
            right: "10px",
            backgroundColor: mode === 'dark' ? "#F87171" : "#B91C1C",
            color: "white",
            "&:hover": { 
              backgroundColor: mode === 'dark' ? "#EF4444" : "#991B1B"
            },
            boxShadow: 2,
            minWidth: "60px"
          }}
          size="small"
        >
          Clear
        </Button>
      </Box>
    </>
  );
};

export default SignaturePad;