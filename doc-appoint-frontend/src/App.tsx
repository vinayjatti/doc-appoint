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
import { Doctor } from "./components/doctor/Doctor";
import { SearchDoctor } from "./components/doctor/SearchDoctor";
import logo from "./assets/medichamp.png"
import { SearchPharmacy } from "./components/doctor/SearchPharmacy";
import { BookAppointment } from "./components/doctor/BookAppointment";
import MyAppointments from "./components/doctor/MyAppointments";
import DoctorLogin from "./components/doctor/DoctorLogin";
import ProtectedRoute from "./components/ProtectedRoute";
import { useDoctorStore } from "./store/useDoctorStore";
import { clearSession, isSessionValid } from "./utils/Session";
import { AdminCreateAdmin } from "./components/AdminCreateAdmin";
import { UserProfileUpdate } from "./components/doctor/UserProfileUpdate";


const App: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const { doctorName, logout,userRole } = useDoctorStore();

  useEffect(() => {
    if (!isSessionValid()) {
      clearSession();
      logout(); // clear Zustand store
      navigate("/login");
    }
  }, []);

  const Profile = () => <Typography variant="h6">👤 Profile Component</Typography>;

  const toggleDrawer = (open: boolean) => () => setOpen(open);

  return (
    <>
      <CssBaseline />
      {/* 🔹 AppBar */}
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
              alt="MediChamp Logo"
              src={logo}
              sx={{ width: "145px", height: "62px", mr: 1, bgcolor: "#fff" }}
            />
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 600,
                letterSpacing: 0.5,
                color: "#fff",
                textTransform: "uppercase",
              }}
            >
              MediChamp
            </Typography>
          </Box>

          {/* ✅ Right side: Login / Logged-in Name */}
          {doctorName ? (
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="body1" sx={{ color: "#fff" }}>
                👨‍⚕️ Dr. {doctorName}
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
              onClick={() => navigate("/doctor-login")}
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

      {/* 🔹 Sidebar Drawer */}
      <Drawer
        anchor="left"
        open={open}
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: {
            backgroundColor: "#ffffff",
            color: "#333",
          },
        }}
      >
        <Box
          sx={{
            width: 250,
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#1976d2" }}>
              Menu
            </Typography>
            {doctorName && (
              <Typography variant="body2" sx={{ mt: 1, color: "#444" }}>
                👤 Logged in as <strong>Dr. {doctorName}</strong>
              </Typography>
            )}
          </Box>
          <Divider />
          <List>
            {[
              { name: "Home", path: "/home" },
              ...(doctorName
                ? [
                  { name: "Doctors", path: "/doctors" },
                  { name: "Appointments", path: "/appointments" },
                  { name: "Profile", path: "/profile" },
                  // ✅ Show "Create Admin" only if logged-in user is admin
                  ...(userRole === "admin"
                    ? [{ name: "Create Admin", path: "/create-admin" }]
                    : []),
                ]
                : []),
              { name: "Search Doctor", path: "/searchDoctor" },
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

      {/* 🔹 Main Content Area */}
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
          {/* Page Content */}
          <Grid size={{ xs: 12, md: 12 }}>
            <Routes>
              <Route path="/home" element={<Home />} />
              <Route path="/doctors" element={<Doctor />} />
              <Route path="/appointments" element={<ProtectedRoute><MyAppointments /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><UserProfileUpdate /></ProtectedRoute>} />
              <Route path="/searchDoctor" element={<SearchDoctor />} />
              <Route path="/searchPharmacy" element={<SearchPharmacy />} />
              <Route path="/book-appointment/:doctorId" element={<BookAppointment />} />
              <Route path="*" element={<Home />} />
              <Route path="/doctor-login" element={<DoctorLogin />} />
              <Route path="/my-appointments" element={<ProtectedRoute><MyAppointments /></ProtectedRoute>} />
              <Route
                path="/create-admin"
                element={userRole === "admin" ? <AdminCreateAdmin /> : <Navigate to="/unauthorized" />}
              />
            </Routes>
          </Grid>
        </Grid>
      </Container>

      {/* Footer */}
      <Box
        sx={{
          textAlign: "center",
          py: 2,
          color: "#777",
          fontSize: 14,
          borderTop: "1px solid #eee",
        }}
      >
        © {new Date().getFullYear()} MediChamp — All Rights Reserved
      </Box>
    </>
  );
};

export default App;