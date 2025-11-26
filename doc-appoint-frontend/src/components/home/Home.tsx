import { BusinessCenter, LocationOn, PersonAdd } from "@mui/icons-material";
import { Box, Button, Card, CardContent, Grid, Typography } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";

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
      {/* Title Section */}
      <Box textAlign="center" mb={5}>
        <Typography variant="h4" fontWeight="bold" color="primary">
          Welcome to AppointmentHub
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
        sx={{ mb: 5 }}
      >
        {/* Card 1 - Search Providers */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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

        {/* Card 2 - Search Locations */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
                Search Nearby Locations
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Discover nearby businesses offering appointment-based services.
              </Typography>
              <Button
                variant="contained"
                color="success"
                onClick={handleSearchLocations}
              >
                Find Locations
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
            Are you a Service Provider?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Register your services and let customers book appointments seamlessly.
          </Typography>
          <Button variant="contained" color="warning" onClick={handleRegister}>
            Register Now
          </Button>
        </Card>
      </Box>
    </Box>

  );
};