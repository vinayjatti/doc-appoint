import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useLoadScript, StandaloneSearchBox } from "@react-google-maps/api";
import { BASE_URL, REACT_APP_GOOGLE_MAP_API_KEY } from "../../utils/constants";

const libraries: ("places")[] = ["places"];

export const SearchProvider: React.FC = () => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: REACT_APP_GOOGLE_MAP_API_KEY || "",
    libraries,
  });

  const [searchType, setSearchType] = useState<"name" | "address" | "location" | "">("");
  const [providerName, setProviderName] = useState("");
  const [serviceAddress, setServiceAddress] = useState("");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchBox, setSearchBox] = useState<google.maps.places.SearchBox | null>(null);
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);

  const navigate = useNavigate();

  // Google search box handlers
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

  // Distance calculation
  const calculateDistance = (uLat: number, uLng: number, pLat: number, pLng: number) => {
    const R = 6371;
    const dLat = ((pLat - uLat) * Math.PI) / 180;
    const dLng = ((pLng - uLng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((uLat * Math.PI) / 180) *
        Math.cos((pLat * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getStatus = (open: string, close: string) => {
    try {
      const now = new Date();
      const [oh, om] = open.split(":").map(Number);
      const [ch, cm] = close.split(":").map(Number);

      const o = new Date();
      const c = new Date();
      o.setHours(oh, om);
      c.setHours(ch, cm);

      return now >= o && now <= c
        ? { status: "Open", color: "success" }
        : { status: "Closed", color: "error" };
    } catch {
      return { status: "Unknown", color: "default" };
    }
  };

  // Call API
  const handleSearch = async () => {
    setLoading(true);
    setError("");
    setProviders([]);

    try {
      const params = new URLSearchParams();
      params.append("role", "provider"); // changed from doctor

      if (searchType === "location" && location) {
        params.append("latitude", location.lat.toString());
        params.append("longitude", location.lng.toString());
      } else if (searchType === "name" && providerName) {
        params.append("name", providerName);
      } else if (searchType === "address" && serviceAddress) {
        params.append("address", serviceAddress);
      } else {
        setError("Please fill the required search field.");
        setLoading(false);
        return;
      }

      const res = await fetch(`${BASE_URL}/api/users/user/search?${params}`);
      const data = await res.json();

      if (res.status !== 200) {
        setError(data.message || "No matching providers found.");
        return;
      }

      const enhanced = data.map((p: any) => {
        const [lng, lat] = p.location?.coordinates || [0, 0];
        const dist = location ? calculateDistance(location.lat, location.lng, lat, lng) : 0;

        const today = new Date().toLocaleString("en-US", { weekday: "long" });
        const todaySlots = p.availability?.find((a: any) => a.day === today)?.slots[0];
        const statusInfo = todaySlots
          ? getStatus(todaySlots.start, todaySlots.end)
          : { status: "N/A", color: "default" };

        return { ...p, distance: dist, statusInfo };
      });

      setProviders(enhanced);
    } catch {
      setError("Failed to fetch providers.");
    } finally {
      setLoading(false);
    }
  };

  const openDialogHandler = (p: any) => {
    setSelectedProvider(p);
    setOpenDialog(true);
  };

  const closeDialogHandler = () => {
    setOpenDialog(false);
    setSelectedProvider(null);
  };

  if (loadError) return <div>Error loading map</div>;
  if (!isLoaded) return <CircularProgress />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        🔍 Search Service Providers
      </Typography>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <FormControl fullWidth>
            <InputLabel>Search By</InputLabel>
            <Select
              value={searchType}
              label="Search By"
              onChange={(e) => {
                setSearchType(e.target.value as any);
                setProviderName("");
                setServiceAddress("");
                setAddress("");
                setLocation(null);
              }}
            >
              <MenuItem value="name">Provider Name</MenuItem>
              <MenuItem value="location">Location</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {searchType === "name" && (
          <Grid size={{ xs: 12, md: 8 }}>
            <TextField
              fullWidth
              label="Enter Provider Name"
              value={providerName}
              onChange={(e) => setProviderName(e.target.value)}
            />
          </Grid>
        )}

        {searchType === "address" && (
          <Grid size={{ xs: 12, md: 8 }}>
            <TextField
              fullWidth
              label="Enter Service Address"
              value={serviceAddress}
              onChange={(e) => setServiceAddress(e.target.value)}
            />
          </Grid>
        )}

        {searchType === "location" && (
          <Grid size={{ xs: 12, md: 8 }}>
            <StandaloneSearchBox onLoad={onLoad} onPlacesChanged={onPlacesChanged}>
              <TextField
                fullWidth
                label="Enter Location"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </StandaloneSearchBox>
          </Grid>
        )}
      </Grid>

      <Button variant="contained" fullWidth onClick={handleSearch} disabled={loading}>
        {loading ? "Searching..." : "Search Providers"}
      </Button>

      {/* Results */}
      <Box sx={{ mt: 3 }}>
        {error && <Typography color="error">{error}</Typography>}

        <Grid container spacing={2}>
          {providers.map((provider) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card sx={{ borderRadius: 3, boxShadow: 3, p: 1 }}>
                <CardContent>
                  <Typography variant="h6">{provider.name}</Typography>
                  <Typography color="textSecondary">{provider.serviceType}</Typography>
                  <Typography>{provider.serviceAddress || "N/A"}</Typography>
                  <Typography sx={{ mt: 1 }}>📞 {provider.phone}</Typography>

                  {/* Distance */}
                  {searchType === "location" && (
                    <Typography sx={{ mt: 1 }}>
                      📍 {provider.distance.toFixed(2)} km away
                    </Typography>
                  )}

                  {/* Map */}
                  {provider.location?.coordinates && (
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ mt: 1 }}
                      onClick={() =>
                        window.open(
                          `https://maps.google.com?q=${provider.location.coordinates[1]},${provider.location.coordinates[0]}`,
                          "_blank"
                        )
                      }
                    >
                      View on Map
                    </Button>
                  )}

                  <Chip
                    sx={{ mt: 1 }}
                    label={provider.statusInfo.status}
                    color={provider.statusInfo.color}
                    size="small"
                  />

                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ mt: 1 }}
                    onClick={() => openDialogHandler(provider)}
                  >
                    View Availability
                  </Button>

                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    sx={{ mt: 1 }}
                    onClick={() => navigate(`/book-appointment/${provider._id}`)}
                  >
                    Book Appointment
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Availability */}
      <Dialog open={openDialog} onClose={closeDialogHandler} fullWidth>
        <DialogTitle>Availability — {selectedProvider?.name}</DialogTitle>
        <DialogContent>
          {selectedProvider?.availability ? (
            <List>
              {selectedProvider.availability.map((a: any) => (
                <ListItem>
                  <ListItemText
                    primary={a.day}
                    secondary={a.slots.map((s: any) => `${s.start} - ${s.end}`).join(", ")}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography>No availability found</Typography>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={closeDialogHandler}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};