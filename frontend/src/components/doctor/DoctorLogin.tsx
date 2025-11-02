import React, { useState } from "react";
import { Box, TextField, Button, Typography, Paper, Snackbar, Alert } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const DoctorLogin: React.FC = () => {
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    try {
      await axios.post("http://localhost:4000/api/auth/send-otp", { identifier });
      setOtpSent(true);
      setSnackbar({ open: true, message: "OTP sent successfully!", severity: "success" });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to send OTP",
        severity: "error",
      });
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const res = await axios.post("http://localhost:4000/api/auth/verify-otp", {
        identifier,
        otp,
      });
      setSnackbar({ open: true, message: "Login successful!", severity: "success" });
      localStorage.setItem("doctorToken", res.data.token);
      localStorage.setItem("doctorId", res.data.doctorId);
      navigate("/my-appointments");
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Invalid OTP",
        severity: "error",
      });
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh" bgcolor="#f8f9fa">
      <Paper elevation={3} sx={{ p: 4, width: 350 }}>
        <Typography variant="h5" fontWeight="bold" textAlign="center" gutterBottom>
          Doctor Sign-In
        </Typography>
        <TextField
          fullWidth
          label="Email or Mobile Number"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          margin="normal"
        />

        {otpSent && (
          <TextField
            fullWidth
            label="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            margin="normal"
          />
        )}

        <Button
          fullWidth
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={otpSent ? handleVerifyOtp : handleSendOtp}
        >
          {otpSent ? "Verify OTP" : "Send OTP"}
        </Button>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity as any}>{snackbar.message}</Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
};

export default DoctorLogin;