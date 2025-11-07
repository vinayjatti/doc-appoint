import { LocalHospital, LocationOn, PersonAdd } from "@mui/icons-material";
import { Box, Button, Card, CardContent, Grid, Typography } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";

export const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleSearchDoctors = () => navigate("/searchDoctor");
  const handleSearchClinics = () => navigate("/searchPharmacy");
  const handleRegister = () => navigate("/doctors");

  return (
    <Box
      sx={{
        backgroundColor: "#ffffff",
        minHeight: "90vh",
        py: 6,
        px: 3,
      }}
    >
      {/* Title Section */}
      <Box textAlign="center" mb={5}>
        <Typography variant="h4" fontWeight="bold" color="primary">
          Welcome to MediChamp
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Your one-stop solution for finding doctors and managing appointments.
        </Typography>
      </Box>

      {/* Search Cards */}
      <Grid
        container
        spacing={4}
        justifyContent="center"
        alignItems="stretch"
        sx={{ mb: 5 }}
      >
        {/* Card 1 - Search Doctors */}
        <Grid size={{xs: 12, sm: 6, md: 4}}>
          <Card
            sx={{
              textAlign: "center",
              p: 3,
              boxShadow: 3,
              borderRadius: 3,
              transition: "transform 0.3s",
              "&:hover": { transform: "scale(1.05)" },
              height: "100%",
            }}
          >
            <CardContent>
              <LocalHospital sx={{ fontSize: 60, color: "#1976d2" }} />
              <Typography variant="h5" gutterBottom>
                Search Doctors Near Me
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Find experienced doctors based on your location and specialty.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSearchDoctors}
              >
                Find Doctors
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Card 2 - Search Clinics */}
        <Grid  size={{xs: 12, sm: 6, md: 4}}>
          <Card
            sx={{
              textAlign: "center",
              p: 3,
              boxShadow: 3,
              borderRadius: 3,
              transition: "transform 0.3s",
              "&:hover": { transform: "scale(1.05)" },
              height: "100%",
            }}
          >
            <CardContent>
              <LocationOn sx={{ fontSize: 60, color: "#2e7d32" }} />
              <Typography variant="h5" gutterBottom>
                Search Pharmacy Near Me
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Locate nearby Pharmacy 
              </Typography>
              <Button
                variant="contained"
                color="success"
                onClick={handleSearchClinics}
              >
                Find Pharmacy
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Registration Section */}
      <Box textAlign="center" mt={5}>
        <Card
          sx={{
            maxWidth: 500,
            mx: "auto",
            p: 3,
            boxShadow: 3,
            borderRadius: 3,
            background: "#fafafa",
          }}
        >
          <PersonAdd sx={{ fontSize: 60, color: "#ff9800", mb: 1 }} />
          <Typography variant="h5" gutterBottom>
            Are you a Doctor or Clinic?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Register yourself and help patients find your services easily.
          </Typography>
          <Button
            variant="contained"
            color="warning"
            onClick={handleRegister}
          >
            Register Now
          </Button>
        </Card>
      </Box>
    </Box>
  );
};