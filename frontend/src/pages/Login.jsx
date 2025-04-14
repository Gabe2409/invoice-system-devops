import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Box, TextField, Button, Typography, Paper, useTheme } from "@mui/material";

const Login = () => {
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(name, pin, navigate);
    if (!success) {
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
      }}
    >
      <Paper
        elevation={10}
        sx={{
          padding: "30px",
          width: "400px",
          textAlign: "center",
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          borderRadius: theme.shape.borderRadius,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
          Staff Login
        </Typography>

        {error && (
          <Typography sx={{ color: theme.palette.error.main, fontSize: "14px", mb: 2 }}>
            {error}
          </Typography>
        )}

        <form
          onSubmit={handleSubmit}
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <TextField
            label="Enter Username"
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            sx={{
              input: { color: theme.palette.text.primary },
              borderRadius: theme.shape.borderRadius / 2,
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: theme.palette.divider },
                "&:hover fieldset": { borderColor: theme.palette.text.secondary },
                "&.Mui-focused fieldset": { borderColor: theme.palette.primary.main },
              },
              "& .MuiInputLabel-root": {
                color: theme.palette.text.secondary,
                "&.Mui-focused": { color: theme.palette.primary.main },
              }
            }}
          />

          <TextField
            label="4-digit PIN"
            type="password"
            variant="outlined"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            fullWidth
            required
            inputProps={{ maxLength: 4 }}
            sx={{
              input: { color: theme.palette.text.primary },
              borderRadius: theme.shape.borderRadius / 2,
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: theme.palette.divider },
                "&:hover fieldset": { borderColor: theme.palette.text.secondary },
                "&.Mui-focused fieldset": { borderColor: theme.palette.primary.main },
              },
              "& .MuiInputLabel-root": {
                color: theme.palette.text.secondary,
                "&.Mui-focused": { color: theme.palette.primary.main },
              }
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              bgcolor: theme.palette.primary.main,
              fontWeight: "bold",
              mt: 2,
              "&:hover": { bgcolor: theme.palette.primary.dark },
            }}
          >
            Sign In
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default Login;