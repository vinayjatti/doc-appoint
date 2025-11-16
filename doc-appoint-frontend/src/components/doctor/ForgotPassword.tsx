import React, { useState } from "react";
import { Box, Paper, TextField, Typography, Button, Snackbar, Alert, AlertColor } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../utils/constants";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const navigate = useNavigate();

  const handleSendCode = async () => {
    if (!email) {
      setSnackbar({ open: true, message: "Please enter your email", severity: "warning" });
      return;
    }

    try {
      await axios.post(BASE_URL + "/api/account/forgot-password", { email });

      setSnackbar({
        open: true,
        message: "Verification code sent to your email",
        severity: "success",
      });

      navigate("/verify-code", { state: { email } });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to send email",
        severity: "error",
      });
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <Paper sx={{ p: 4, width: 360 }}>
        <Typography variant="h5" fontWeight="bold" textAlign="center" gutterBottom>
          Forgot Password
        </Typography>

        <TextField
          label="Enter Email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mt: 2 }}
        />

        <Button fullWidth variant="contained" sx={{ mt: 3 }} onClick={handleSendCode}>
          Send Verification Code
        </Button>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity as AlertColor}>{snackbar.message}</Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
};

export default ForgotPassword;