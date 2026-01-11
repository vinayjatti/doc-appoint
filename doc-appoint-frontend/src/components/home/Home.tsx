import { BusinessCenter, LocationOn, PersonAdd } from "@mui/icons-material";
import { Box, Button, Card, CardContent, Grid, Typography } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import SEO from "./SEO";

export const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleSearchProviders = () => navigate("/searchProvider");
  const handleSearchLocations = () => navigate("/searchLocation");
  const handleRegister = () => navigate("/providers");

  return (
    <Box
      sx={{
        backgroundColor: "#ffffff",
        minHeight: "90vh",
        py: 6,
        px: 3,
      }}
    >
      <SEO
        title="Online Appointment Booking App | Reserve Your Time"
        description="Reserve Your Time is an online appointment booking app using token-based or time-slot scheduling for clinics, salons, and service providers."
      />
      {/* Title Section */}
      <Box textAlign="center" mb={5}>
        <Typography variant="h4" fontWeight="bold" color="primary">
          Welcome to ReseveYourTime
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Your one-stop platform to find service providers and book appointments easily.
        </Typography>
      </Box>

      {/* Search Cards */}




      <Grid
        container
        spacing={4}
        justifyContent="center"
        alignItems="stretch"
        sx={{ mt: 5 }}
      >
        <Grid
          container
          spacing={4}
          justifyContent="center"
          alignItems="stretch"
          size={{ xs: 12, sm: 6, md: 4 }}
        >
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
              <BusinessCenter sx={{ fontSize: 60, color: "#1976d2" }} />
              <Typography variant="h5" gutterBottom>
                Find Service Providers
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Search professionals across different services near you.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSearchProviders}
              >
                Search Providers
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}  >
          <Card
            sx={{
              textAlign: "center",
              p: 3,
              boxShadow: 3,
              borderRadius: 3,
              background: "#fafafa",
               transition: "transform 0.3s",
              "&:hover": { transform: "scale(1.05)" },
              height: "100%",
            }}
          >
            <PersonAdd sx={{ fontSize: 60, color: "#ff9800", mb: 1 }} />
            <Typography variant="h5" gutterBottom>
              Are you a Service Provider?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Register your services and let customers book appointments seamlessly.
            </Typography>
            <Button variant="contained" color="warning" onClick={handleRegister}>
              Register Now
            </Button>
          </Card>
        </Grid>
      </Grid>
    </Box>

  );
};