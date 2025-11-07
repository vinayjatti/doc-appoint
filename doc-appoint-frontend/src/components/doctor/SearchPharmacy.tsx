import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Rating,
  Divider,
} from "@mui/material";
import { StandaloneSearchBox, useLoadScript } from "@react-google-maps/api";
import { REACT_APP_GOOGLE_MAP_API_KEY } from "../../utils/constants";
import { searchNearBy } from "../../utils/AxiosInstance";

const libraries: ("places")[] = ["places"];

export const SearchPharmacy: React.FC = () => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: REACT_APP_GOOGLE_MAP_API_KEY || "YOUR_GOOGLE_MAPS_API_KEY",
    libraries,
  });

  const [searchBox, setSearchBox] = useState<google.maps.places.SearchBox | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState("");
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const onLoad = (ref: google.maps.places.SearchBox) => setSearchBox(ref);

  const onPlacesChanged = () => {
    if (!searchBox) return;
    const places = searchBox.getPlaces();
    if (places && places.length > 0) {
      const place = places[0];
      const loc = place.geometry?.location;
      if (loc) {
        setLocation({ lat: loc.lat(), lng: loc.lng() });
        setAddress(place.formatted_address || "");
      }
    }
  };

  const handleSearch = async () => {
    if (!location) return alert("Please select a valid location.");
    setLoading(true);

    try {
      const results = await searchNearBy(["pharmacy"], location.lat, location.lng);
      setPharmacies(results);
    } catch (err) {
      console.error("Error fetching pharmacies:", err);
      alert("Failed to fetch nearby pharmacies.");
    } finally {
      setLoading(false);
    }
  };

  if (loadError) return <div>Error loading Google Maps</div>;
  if (!isLoaded) return <CircularProgress />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: "#1976d2" }}>
        💊 Search Nearby Pharmacies
      </Typography>

      <StandaloneSearchBox onLoad={onLoad} onPlacesChanged={onPlacesChanged}>
        <TextField
          fullWidth
          label="Enter your location"
          variant="outlined"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          sx={{
            mb: 2,
            backgroundColor: "#fff",
            borderRadius: 1,
          }}
        />
      </StandaloneSearchBox>

      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleSearch}
        disabled={loading}
        sx={{ py: 1.2, fontWeight: 600 }}
      >
        {loading ? "Searching..." : "Find Pharmacies Near Me"}
      </Button>

      <Box sx={{ mt: 4 }}>
        {loading && (
          <Box sx={{ textAlign: "center", mt: 5 }}>
            <CircularProgress />
            <Typography sx={{ mt: 1 }}>Searching nearby pharmacies...</Typography>
          </Box>
        )}

        {!loading && pharmacies.length > 0 && (
          <Box>
            {pharmacies.map((pharmacy, idx) => (
              <Card
                key={idx}
                variant="outlined"
                sx={{
                  mb: 2,
                  borderRadius: 2,
                  p: 2,
                  transition: "0.2s",
                  "&:hover": { boxShadow: "0 4px 10px rgba(0,0,0,0.1)" },
                }}
              >
                <Grid container alignItems="center" spacing={2}>
                  <Grid  size={{xs:12, md:8}}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {pharmacy.name}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mt: 0.5,
                        fontStyle: "italic",
                      }}
                    >
                      {pharmacy.address}
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                      <Rating
                        name="read-only"
                        value={parseFloat(pharmacy.rating) || 0}
                        precision={0.1}
                        readOnly
                        size="small"
                      />
                      <Typography sx={{ ml: 1, color: "text.secondary" }}>
                        ({pharmacy.userRatings} reviews)
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={{xs:12, md:4}} sx={{ textAlign: { xs: "left", sm: "right" } }}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 600,
                        color: "#1976d2",
                        mt: { xs: 1, sm: 0 },
                      }}
                    >
                      📍 {pharmacy.distance}
                    </Typography>
                  </Grid>
                </Grid>
              </Card>
            ))}
          </Box>
        )}

        {!loading && pharmacies.length === 0 && (
          <Typography sx={{ mt: 2, textAlign: "center", color: "text.secondary" }}>
            No pharmacies found nearby.
          </Typography>
        )}
      </Box>
    </Box>
  );
};