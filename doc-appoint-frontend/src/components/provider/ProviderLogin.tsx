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
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useProviderStore } from "../../store/useProviderStore";
import { BASE_URL } from "../../utils/constants";

const ProviderLogin: React.FC = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const navigate = useNavigate();
  const { setProvider } = useProviderStore();

  // ----------------------------------------------------
  // STEP 1 → Send OTP
  // ----------------------------------------------------
  const sendOtp = async () => {
    if (!email) {
      return setSnackbar({
        open: true,
        message: "Please enter email",
        severity: "warning",
      });
    }

    setLoadingEmail(true);

    try {
      await axios.post(BASE_URL + "/api/account/send-otp-email", { email });

      setSnackbar({
        open: true,
        message: "OTP sent to your email",
        severity: "success",
      });

      setStep("otp");
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to send OTP",
        severity: "error",
      });
    } finally {
      setLoadingEmail(false);
    }
  };

  // ----------------------------------------------------
  // STEP 2 → Verify OTP
  // ----------------------------------------------------
  const verifyOtp = async () => {
    if (!otp) {
      return setSnackbar({
        open: true,
        message: "Please enter OTP",
        severity: "warning",
      });
    }
    setLoadingOtp(true);
    try {
      const res = await axios.post(BASE_URL + "/api/account/verify-code", {
        email,
        code: otp,
      });

      // OTP Verified → Now fetch provider details OR auto-login
      const loginTime = new Date().getTime();
      const sessionDuration = 1 * 60 * 60 * 1000;

      // save provider data (basic for now)
      setProvider({
        providerName: res.data.providerName,
        providerId: res.data.providerId,
        token: res.data.token,
        loginTime: loginTime.toString(),
        sessionDuration: sessionDuration.toString(),
        bookingSlotsType: res.data.bookingSlotsType,
        userRole: res.data.role,
      });

      setSnackbar({
        open: true,
        message: "OTP verified! Redirecting...",
        severity: "success",
      });

      navigate("/appointments");
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Invalid OTP",
        severity: "error",
      });
    } finally {
      setLoadingOtp(false);
    }
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

        {/* STEP 1: ENTER EMAIL */}
        {step === "email" && (
          <>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
            />

            <Button
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              onClick={sendOtp}
              disabled={loadingEmail}
            >
              {loadingEmail ? (
                <CircularProgress size={22} sx={{ color: "white" }} />
              ) : (
                "Send OTP"
              )}
            </Button>
          </>
        )}

        {/* STEP 2: ENTER OTP */}
        {step === "otp" && (
          <>
            <Typography textAlign="center" sx={{ mb: 1 }}>
              OTP is sent to <strong>{email}</strong>
            </Typography>
            <TextField
              fullWidth
              label="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              margin="normal"
              required
            />

            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={verifyOtp}
                disabled={loadingOtp}
              >
                {loadingOtp ? (
                  <CircularProgress size={22} sx={{ color: "white" }} />
                ) : (
                  "Verify OTP"
                )}
              </Button>

              <Button
                fullWidth
                variant="outlined"
                onClick={() => setStep("email")}
              >
                Edit Email
              </Button>
            </Stack>
          </>
        )}

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