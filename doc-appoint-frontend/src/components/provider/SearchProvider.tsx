import React, { useState, useEffect } from "react";
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
  Avatar,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useLoadScript, StandaloneSearchBox } from "@react-google-maps/api";
import { BASE_URL, REACT_APP_GOOGLE_MAP_API_KEY } from "../../utils/constants";
import { axiosInstance } from "../../utils/AxiosInstance";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import SEO from "../home/SEO";
import { seoConfig } from "../seoConfig";

const libraries: ("places")[] = ["places"];

export const SearchProvider: React.FC = () => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: REACT_APP_GOOGLE_MAP_API_KEY || "",
    libraries,
  });

  const [searchType, setSearchType] = useState<"name" | "address" | "location" | "service" | "">("");

  const [providerName, setProviderName] = useState("");
  const [serviceAddress, setServiceAddress] = useState("");
  const [serviceName, setServiceName] = useState(""); // 🔥 NEW
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchBox, setSearchBox] = useState<google.maps.places.SearchBox | null>(null);
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [serviceType, setServiceType] = useState("");
  const [distanceRange, setDistanceRange] = useState("");

  const navigate = useNavigate();

  // =======================
  // 📍 AUTO-LOAD NEARBY PROVIDERS
  // =======================
  useEffect(() => {
    // Get user's current geo-location
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ lat: latitude, lng: longitude });

        // Automatically search nearby providers
        autoLoadNearbyProviders(latitude, longitude);
      },
      () => console.log("Location permission denied")
    );
  }, []);

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

  // ==================================================
  // 🔍 MAIN SEARCH FUNCTION (supports default auto-search)
  // ==================================================
  const DEFAULT_LAT = 12.9716;   // Bangalore Central
  const DEFAULT_LNG = 77.5946;

  const handleSearch = async (
    latOverride?: number,
    lngOverride?: number,
    isAutoLoad: boolean = false
  ) => {
    setLoading(true);
    setError("");
    setProviders([]);

    try {
      const params = new URLSearchParams();
      params.append("role", "provider");

      // --------------------------------------------------
      // 1️⃣ Determine final latitude & longitude to use
      // --------------------------------------------------

      let finalLat: number = DEFAULT_LAT;
      let finalLng: number = DEFAULT_LNG;

      if (latOverride && lngOverride) {
        finalLat = latOverride;
        finalLng = lngOverride;
      } else if (location) {
        // Browser location stored in state
        finalLat = location.lat;
        finalLng = location.lng;
      } else {
        // Fallback → default Bangalore
        finalLat = DEFAULT_LAT;
        finalLng = DEFAULT_LNG;
      }

      params.append("latitude", String(finalLat));
      params.append("longitude", String(finalLng));

      // --------------------------------------------------
      // 2️⃣ Other search filters
      // --------------------------------------------------

      if (searchType === "name") {
        if (!providerName.trim()) {
          setError("Please enter provider name.");
          setLoading(false);
          return;
        }
        params.append("name", providerName.trim());
      }

      if (searchType === "address") {
        if (!serviceAddress.trim()) {
          setError("Please enter service address.");
          setLoading(false);
          return;
        }
        params.append("address", serviceAddress.trim());
      }

      if (searchType === "service") {
        if (!serviceType?.trim()) {
          setError("Please select a service.");
          setLoading(false);
          return;
        }
        params.append("serviceType", serviceType.trim());

        if (distanceRange) {
          params.append("distanceRange", distanceRange);
        }
      }

      // --------------------------------------------------
      // 3️⃣ Make backend request
      // --------------------------------------------------
      const res = await axiosInstance.get(`${BASE_URL}/api/users/user/search`, {
        params: Object.fromEntries(params.entries()),
      });

      if (res.status !== 200 || !Array.isArray(res.data)) {
        setError("No service providers found.");
        return;
      }

      const list = res.data;

      if (list.length === 0) {
        setError("No service providers found.");
        return;
      }

      // --------------------------------------------------
      // 4️⃣ Enhance providers
      // --------------------------------------------------
      const enhanced = list
        .map((p: any) => {
          let dist = p.distance;

          // fallback calculation if backend didn't send distance
          if (!dist && p.location?.coordinates) {
            const [lng2, lat2] = p.location.coordinates;
            dist = calculateDistance(finalLat, finalLng, lat2, lng2);
          }

          const today = new Date().toLocaleDateString("en-US", {
            weekday: "long",
          });

          const availability = p.availability?.find((a: any) => a.day === today);
          const slot = availability?.slots?.[0];

          return {
            ...p,
            distance: Number(dist) || 0, // ALWAYS NUMBER
            statusInfo: slot
              ? getStatus(slot.start, slot.end)
              : { status: "N/A", color: "default" },
          };
        })
       

      setProviders(enhanced);
      
    } catch (error) {
      console.error(error);
      setError("Failed to fetch provider details.");
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

  const autoLoadNearbyProviders = async (lat: number, lng: number) => {
    try {
      setLoading(true);

      const res = await axiosInstance.get(`${BASE_URL}/api/users/user/search`, {
        params: { role: "provider", latitude: lat, longitude: lng ,distanceRange: 5000}
      });

      if (Array.isArray(res.data)) {
        const list = res.data.map((p: any) => {
          const [lng2 = 0, lat2 = 0] = p.location?.coordinates || [];
          const dist = calculateDistance(lat, lng, lat2, lng2);

          return { ...p, distance: dist };
        });

        setProviders(list);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loadError) return <div>Error loading map</div>;
  if (!isLoaded) return <CircularProgress />;



  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5">🔍 Search Service Providers</Typography>
      <SEO {...seoConfig.searchProvider} />

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
                setServiceName(""); // NEW
                setAddress("");
                setServiceType("");
                setLocation(null);
              }}
            >
              <MenuItem value="name">Provider Name</MenuItem>
              <MenuItem value="service">Service Name</MenuItem>
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

        {searchType === "service" && (
          <>
            <Grid size={{ xs: 12, md: 5 }}>
              <FormControl fullWidth>
                <InputLabel>Select Service</InputLabel>
                <Select
                  value={serviceType}
                  label="Select Service"
                  onChange={(e) => setServiceType(e.target.value)}
                >
                  <MenuItem value="doctor">Doctor</MenuItem>
                  <MenuItem value="pharmacy">Pharmacy</MenuItem>
                  <MenuItem value="lawyer">Lawyer</MenuItem>
                  <MenuItem value="salon">Salon</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* ⭐ Distance Range Dropdown */}
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Distance Range</InputLabel>
                <Select
                  value={distanceRange}
                  label="Distance Range"
                  onChange={(e) => setDistanceRange(e.target.value)}
                >
                  <MenuItem value="1">1 km</MenuItem>
                  <MenuItem value="3">3 km</MenuItem>
                  <MenuItem value="5">5 km</MenuItem>
                  <MenuItem value="10">10 km</MenuItem>
                  <MenuItem value="15">15 km</MenuItem>
                  <MenuItem value="20">20 km</MenuItem>
                   <MenuItem value="30">30 km</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </>
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

      <Button variant="contained" fullWidth onClick={() => handleSearch()}>
        {loading ? "Searching..." : "Search Providers"}
      </Button>

      {/* RESULTS */}
      <Box sx={{ mt: 3 }}>
        {error && <Typography color="error">{error}</Typography>}

        <Grid container spacing={2}>
          {providers.map((provider) => {
            const statusText = provider?.statusInfo?.status || "N/A";
            const statusColor = provider?.statusInfo?.color || "default";
            const serviceType = provider?.serviceType || "Other";

            // 🔥 SERVICE TYPE ICONS
            const serviceIcons: any = {
              Doctor: "🩺",
              Pharmacy: "💊",
              Lawyer: "⚖️",
              Salon: "💇",
              Other: "⭐",
            };

            // 🎨 SERVICE TYPE COLORS
            const serviceColors: any = {
              Doctor: "primary",
              Pharmacy: "success",
              Lawyer: "default",
              Salon: "secondary",
              Other: "warning",
            };

            return (
              <Grid key={provider._id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: 4,
                    p: 2,
                    pt: 5,
                    position: "relative",
                    transition: "0.25s",
                    "&:hover": { transform: "scale(1.02)" },
                  }}
                >
                  {/* 🔥 SERVICE TYPE BADGE */}
                  <Chip
                    icon={<span>{serviceIcons[serviceType]}</span>}
                    label={serviceType}
                    color={serviceColors[serviceType]}
                    sx={{
                      position: "absolute",
                      top: 12,
                      left: 16,
                      fontWeight: 600,
                      fontSize: "0.8rem",
                    }}
                  />

                  {/* ✔️ VERIFIED BADGE */}
                  {provider.isVerified && (
                    <Chip
                      label="✔ Verified"
                      color="info"
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 12,
                        right: 16,
                        fontSize: "0.7rem",
                        fontWeight: 700,
                      }}
                    />
                  )}

                  <CardContent sx={{ p: 2 }}>
                    {/* Avatar */}
                    <Box sx={{ display: "flex", justifyContent: "center" }}>
                      <Avatar
                        src={provider.profileImage || undefined}
                        sx={{
                          width: 72,
                          height: 72,
                          mb: 1.5,
                          border: "3px solid #f3f4f6",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          bgcolor: provider.profileImage ? "transparent" : "#1976d2",
                          color: "white",
                          fontSize: "1.3rem",
                          fontWeight: 600,
                        }}
                      >
                        {provider.name?.[0] || "U"}
                      </Avatar>
                    </Box>

                    {/* Name */}
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        textAlign: "center",
                        color: "#1e293b",
                        letterSpacing: "0.3px",
                      }}
                    >
                      {provider.name}
                    </Typography>

                    {/* Service / specialization */}
                    <Typography
                      sx={{
                        textAlign: "center",
                        mt: 0.5,
                        fontSize: "0.9rem",
                        color: "#64748b",
                      }}
                    >
                      {provider.specialization || "No specialization available"}
                    </Typography>

                    {/* Address */}
                    {provider.locationAddress && (
                      <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1 }}>
                        <LocationOnIcon sx={{ fontSize: 18, color: "#475569" }} />
                        <Typography sx={{ color: "#475569", fontSize: "0.9rem" }}>
                          {provider.locationAddress}
                        </Typography>
                      </Box>
                    )}

                    {/* Distance */}
                    {provider.distance !== undefined && (
                      <Typography
                        sx={{ mt: 1, color: "#475569", fontSize: "0.9rem", ml: 0.3 }}
                      >
                        🚗 {provider.distance.toFixed(2)} km away
                      </Typography>
                    )}

                    {/* Status + Map button */}
                    <Box
                      sx={{
                        mt: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 1.2,
                      }}
                    >
                      <Chip
                        label={statusText}
                        color={statusColor}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />

                      {provider.location?.coordinates && (
                        <IconButton
                          sx={{
                            background: "#e3f2fd",
                            color: "#1565c0",
                            p: "5px",
                            "&:hover": { background: "#bbdefb" },
                          }}
                          onClick={() =>
                            window.open(
                              `https://www.google.com/maps?q=${provider.location.coordinates[1]},${provider.location.coordinates[0]}`,
                              "_blank"
                            )
                          }
                        >
                          <LocationOnIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                      )}
                    </Box>

                    {/* Buttons */}
                    <Box sx={{ mt: 2.5, display: "flex", gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        sx={{ textTransform: "none", fontWeight: 600 }}
                        onClick={() => openDialogHandler(provider)}
                      >
                        Availability
                      </Button>

                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        fullWidth
                        sx={{ textTransform: "none", fontWeight: 600 }}
                        onClick={() => navigate(`/book-appointment/${provider._id}`)}
                      >
                        Book
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* Availability Dialog */}
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