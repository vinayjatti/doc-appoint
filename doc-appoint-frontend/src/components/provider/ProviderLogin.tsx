import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Snackbar,
  Alert,
  Link,
  Stack,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useProviderStore } from "../../store/useProviderStore";
import { BASE_URL } from "../../utils/constants";

const ProviderLogin: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const navigate = useNavigate();
  const { setProvider } = useProviderStore();

  // ✅ Handle Login
  const handleLogin = async () => {
    if (!email || !password) {
      setSnackbar({
        open: true,
        message: "Please enter both email and password",
        severity: "warning",
      });
      return;
    }

    try {
      const res = await axios.post(BASE_URL+ "/api/auth/login", {
        email,
        password,
      });


      // ✅ On success
      setSnackbar({
        open: true,
        message: "Login successful!",
        severity: "success",
      });

      const loginTime = new Date().getTime();
      const sessionDuration = 1 * 60 * 60 * 1000;

      setProvider({
        providerName: res.data.providerName,
        providerId: res.data.providerId,
        token: res.data.token,
        loginTime: loginTime.toString(),
        sessionDuration: sessionDuration.toString(),
        bookingSlotsType: res.data.bookingSlotsType,
        userRole: res.data.role,
      });

      navigate("/appointments");
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Invalid credentials",
        severity: "error",
      });
    }
  };

  // ✅ Clear all fields
  const handleClear = () => {
    setEmail("");
    setPassword("");
  };

  // ✅ Navigate to Forgot Password page
  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="80vh"
      bgcolor="#f8f9fa"
    >
      <Paper elevation={3} sx={{ p: 4, width: 360 }}>
        <Typography
          variant="h5"
          fontWeight="bold"
          textAlign="center"
          gutterBottom
        >
          Doctor Login
        </Typography>

        <TextField
          fullWidth
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          required
        />

        <TextField
          fullWidth
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
          required
        />

        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleLogin}
          >
            Sign In
          </Button>

          <Button
            fullWidth
            variant="outlined"
            color="secondary"
            onClick={handleClear}
          >
            Clear
          </Button>
        </Stack>

        <Box textAlign="center" mt={2}>
          <Link
            component="button"
            variant="body2"
            underline="hover"
            onClick={handleForgotPassword}
          >
            Forgot Password?
          </Link>
        </Box>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            severity={snackbar.severity as any}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
};

export default ProviderLogin;