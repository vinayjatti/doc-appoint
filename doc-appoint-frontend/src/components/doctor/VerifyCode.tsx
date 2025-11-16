import React, { useState } from "react";
import { Box, Paper, TextField, Typography, Button, Snackbar, Alert, AlertColor } from "@mui/material";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { BASE_URL } from "../../utils/constants";

const VerifyCode: React.FC = () => {
  const [code, setCode] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const handleVerify = async () => {
    try {
      await axios.post(BASE_URL + "/api/account/verify-code", { email, code });

      setSnackbar({
        open: true,
        message: "Verification successful!",
        severity: "success",
      });

      navigate("/reset-password", { state: { email } });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Invalid verification code",
        severity: "error",
      });
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <Paper sx={{ p: 4, width: 360 }}>
        <Typography variant="h5" fontWeight="bold" textAlign="center" gutterBottom>
          Verify Code
        </Typography>

        <TextField
          label="Enter Verification Code"
          fullWidth
          value={code}
          onChange={(e) => setCode(e.target.value)}
          sx={{ mt: 2 }}
        />

        <Button fullWidth variant="contained" sx={{ mt: 3 }} onClick={handleVerify}>
          Verify
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

export default VerifyCode;