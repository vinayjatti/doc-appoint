import React from "react";
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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Home } from "./components/home/Home";
import { Doctor } from "./components/doctor/Doctor";
import { SearchDoctor } from "./components/doctor/SearchDoctor";
import logo from "./assets/medichamp.png"
import { SearchPharmacy } from "./components/doctor/SearchPharmacy";
import { BookAppointment } from "./components/doctor/BookAppointment";

const App: React.FC = () => {
  const [open, setOpen] = React.useState(false);

  const Appointments = () => (
    <Typography variant="h6">📅 Appointments Component</Typography>
  );
  const Profile = () => <Typography variant="h6">👤 Profile Component</Typography>;

  const toggleDrawer = (open: boolean) => () => setOpen(open);

  return (
    <Router>
      <CssBaseline />
      {/* 🔹 AppBar */}
      <AppBar position="sticky" sx={{ backgroundColor: "#3A3A94" }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
           <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
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
          </Box>
          <Divider />
          <List>
            {[
              { name: "Home", path: "/home" },
              { name: "Doctors", path: "/doctors" },
              { name: "Appointments", path: "/appointments" },
              { name: "Profile", path: "/profile" },
              { name: "Search Doctor", path: "/searchDoctor" },
            ].map((item) => (
              <ListItem key={item.name} disablePadding>
                <ListItemButton component={Link} to={item.path}>
                  <ListItemText
                    primary={item.name}
                    primaryTypographyProps={{
                      fontSize: 16,
                      fontWeight: 500,
                    }}
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
          <Grid  size={{ xs: 12, md: 12 }}>
            <Routes>
              <Route path="/home" element={<Home />} />
              <Route path="/doctors" element={<Doctor />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/searchDoctor" element={<SearchDoctor />} />
              <Route path="/searchPharmacy" element={<SearchPharmacy />} />
              <Route path="/book-appointment/:doctorId" element={<BookAppointment />} />
              <Route path="*" element={<Home />} />
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
    </Router>
  );
};

export default App;