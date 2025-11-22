import React, { useState } from "react";
import { Box, Paper, TextField, Typography, Button, Snackbar, Alert, AlertColor } from "@mui/material";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { BASE_URL } from "../../utils/constants";

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const handleReset = async () => {
    if (password !== confirm) {
      setSnackbar({
        open: true,
        message: "Passwords do not match",
        severity: "warning",
      });
      return;
    }

    try {
      await axios.post(BASE_URL + "/api/account/reset-password", { email, password });

      setSnackbar({
        open: true,
        message: "Password updated successfully",
        severity: "success",
      });

      navigate("/");
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to update password",
        severity: "error",
      });
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <Paper sx={{ p: 4, width: 360 }}>
        <Typography variant="h5" fontWeight="bold" textAlign="center" gutterBottom>
          Reset Password
        </Typography>

        <TextField
          label="New Password"
          type="password"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ mt: 2 }}
        />

        <TextField
          label="Confirm Password"
          type="password"
          fullWidth
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          sx={{ mt: 2 }}
        />

        <Button fullWidth variant="contained" sx={{ mt: 3 }} onClick={handleReset}>
          Update Password
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

export default ResetPassword;