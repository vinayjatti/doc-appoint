import React, { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  Grid,
  Container,
  ListItemButton,
  CssBaseline,
  Divider,
  Avatar,
  Button,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from "react-router-dom";
import { Home } from "./components/home/Home";

import { ProviderRegistration } from "./components/provider/ProviderRegistration";
import { SearchProvider } from "./components/provider/SearchProvider";   // rename later to SearchProvider
import { SearchPharmacy } from "./components/provider/SearchPharmacy"; // rename later
import { BookAppointment } from "./components/provider/BookAppointment";
import MyAppointments from "./components/provider/MyAppointments";
import ProviderLogin from "./components/provider/ProviderLogin";           // rename later to ProviderLogin
import ProtectedRoute from "./components/ProtectedRoute";

import { useDoctorStore } from "./store/useDoctorStore";
import { clearSession, isSessionValid } from "./utils/Session";
import { AdminCreateAdmin } from "./components/AdminCreateAdmin";
import { UserProfileUpdate } from "./components/provider/UserProfileUpdate";
import ForgotPassword from "./components/provider/ForgotPassword";
import VerifyCode from "./components/provider/VerifyCode";
import ResetPassword from "./components/provider/ResetPassword";

import logo from "./assets/medichamp.png"; // replace logo later with generic name


const App: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const { doctorName: providerName, logout, userRole } = useDoctorStore();

  useEffect(() => {
    if (!isSessionValid()) {
      clearSession();
      logout();
      navigate("/");
    }
  }, []);

  const toggleDrawer = (open: boolean) => () => setOpen(open);

  return (
    <>
      <CssBaseline />

      {/* Top AppBar */}
      <AppBar position="sticky" sx={{ backgroundColor: "#3A3A94" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>

            <Avatar
              alt="AppointmentHub Logo"
              src={logo}
              sx={{ width: "145px", height: "62px", mr: 1, bgcolor: "#fff" }}
            />

            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                letterSpacing: 0.5,
                color: "#fff",
                textTransform: "uppercase",
              }}
            >
              AppointmentHub
            </Typography>
          </Box>

          {/* Right Side User Info */}
          {providerName ? (
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="body1" sx={{ color: "#fff" }}>
                👤 {providerName}
              </Typography>

              <Button
                color="inherit"
                variant="outlined"
                onClick={logout}
                sx={{
                  color: "#fff",
                  borderColor: "#fff",
                  "&:hover": { borderColor: "#ddd" },
                }}
              >
                Logout
              </Button>
            </Box>
          ) : (
            <Button
              color="inherit"
              variant="outlined"
              onClick={() => navigate("/login")}
              sx={{
                color: "#fff",
                borderColor: "#fff",
                "&:hover": { borderColor: "#ddd" },
              }}
            >
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Drawer
        anchor="left"
        open={open}
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: { backgroundColor: "#ffffff", color: "#333" },
        }}
      >
        <Box
          sx={{ width: 250, display: "flex", flexDirection: "column", height: "100%" }}
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#1976d2" }}>
              Menu
            </Typography>

            {providerName && (
              <Typography variant="body2" sx={{ mt: 1, color: "#444" }}>
                👤 Logged in as <strong>{providerName}</strong>
              </Typography>
            )}
          </Box>

          <Divider />

          <List>
            {[
              { name: "Home", path: "/home" },

              ...(providerName
                ? [
                    { name: "Providers", path: "/providers" },
                    { name: "Appointments", path: "/appointments" },
                    { name: "Profile", path: "/profile" },

                    ...(userRole === "admin"
                      ? [{ name: "Create Admin", path: "/create-admin" }]
                      : []),
                  ]
                : []),

              { name: "Search Provider", path: "/searchProvider" },
            ].map((item) => (
              <ListItem key={item.name} disablePadding>
                <ListItemButton component={Link} to={item.path}>
                  <ListItemText
                    primary={item.name}
                    primaryTypographyProps={{ fontSize: 16, fontWeight: 500 }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main Content Area */}
      <Container
        maxWidth="md"
        sx={{
          backgroundColor: "#ffffff",
          minHeight: "85vh",
          mt: 3,
          mb: 3,
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          borderRadius: 3,
          p: 3,
        }}
      >
        <Grid container spacing={2}>
          <Grid  size={{ xs: 12 }}>
            <Routes>
              <Route path="/home" element={<Home />} />

              {/* Provider flow (generic) */}
              <Route path="/providers" element={<ProviderRegistration />} />

              <Route
                path="/appointments"
                element={<ProtectedRoute><MyAppointments /></ProtectedRoute>}
              />

              <Route
                path="/profile"
                element={<ProtectedRoute><UserProfileUpdate /></ProtectedRoute>}
              />

              <Route path="/searchProvider" element={<SearchProvider />} />
              <Route path="/searchPharmacy" element={<SearchPharmacy />} />

              <Route path="/book-appointment/:providerId" element={<BookAppointment />} />

              <Route path="/" element={<Home />} />

              {/* Auth */}
              <Route path="/login" element={<ProviderLogin />} />

              <Route
                path="/create-admin"
                element={userRole === "admin" ? <AdminCreateAdmin /> : <Navigate to="/unauthorized" />}
              />

              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/verify-code" element={<VerifyCode />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Routes>
          </Grid>
        </Grid>
      </Container>

      {/* Footer */}
      <Box textAlign="center" py={2} color="#777" fontSize={14} borderTop="1px solid #eee">
        © {new Date().getFullYear()} AppointmentHub — All Rights Reserved
      </Box>
    </>
  );
};

export default App;