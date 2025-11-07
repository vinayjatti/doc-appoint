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

export const SearchDoctor: React.FC = () => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: REACT_APP_GOOGLE_MAP_API_KEY || "YOUR_GOOGLE_MAPS_API_KEY",
    libraries,
  });

  // ✅ States
  const [searchType, setSearchType] = useState<"name" | "address" | "location" | "">("");
  const [doctorName, setDoctorName] = useState("");
  const [clinicAddress, setClinicAddress] = useState("");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchBox, setSearchBox] = useState<google.maps.places.SearchBox | null>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);

  const navigate = useNavigate();

  // ✅ Google map handlers
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

  // ✅ Utility: Calculate distance
  const calculateDistance = (userLat: number, userLng: number, docLat: number, docLng: number): number => {
    const R = 6371;
    const dLat = ((docLat - userLat) * Math.PI) / 180;
    const dLng = ((docLng - userLng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((userLat * Math.PI) / 180) *
        Math.cos((docLat * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // ✅ Utility: Get clinic open/close status
  const getClinicStatus = (open: string, close: string): { status: string; color: string } => {
    try {
      const now = new Date();
      const [openH, openM] = open.split(":").map(Number);
      const [closeH, closeM] = close.split(":").map(Number);
      const openTime = new Date();
      const closeTime = new Date();
      openTime.setHours(openH, openM, 0);
      closeTime.setHours(closeH, closeM, 0);

      return now >= openTime && now <= closeTime
        ? { status: "Open", color: "success" }
        : { status: "Closed", color: "error" };
    } catch {
      return { status: "Unknown", color: "default" };
    }
  };

  // ✅ Search button handler
  const handleSearch = async () => {
    setLoading(true);
    setError("");
    setDoctors([]);

    try {
      const queryParams = new URLSearchParams();
      queryParams.append("role", "doctor");

      if (searchType === "location" && location) {
        queryParams.append("latitude", location.lat.toString());
        queryParams.append("longitude", location.lng.toString());
      } else if (searchType === "name" && doctorName.trim()) {
        queryParams.append("name", doctorName);
      } else if (searchType === "address" && clinicAddress.trim()) {
        queryParams.append("address", clinicAddress);
      } else {
        setError("Please fill the required search field.");
        setLoading(false);
        return;
      }

      const res = await fetch(`${BASE_URL}/api/users/user/search?${queryParams}`);
      const data = await res.json();

      if (res.status !== 200) {
        setDoctors([]);
        setError(data.message || "No matching doctors found.");
        return;
      }

      const doctorsWithExtras = data.map((doc: any) => {
        const [docLng, docLat] = doc.location?.coordinates || [0, 0];
        const distance = location ? calculateDistance(location.lat, location.lng, docLat, docLng) : 0;
        const today = new Date().toLocaleString("en-US", { weekday: "long" });
        const todaySlots = doc.availability?.find((a: any) => a.day === today)?.slots[0] || null;
        const statusInfo = todaySlots
          ? getClinicStatus(todaySlots.start, todaySlots.end)
          : { status: "N/A", color: "default" };
        return { ...doc, distance, statusInfo };
      });

      setDoctors(doctorsWithExtras);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch doctors.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (doctor: any) => {
    setSelectedDoctor(doctor);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDoctor(null);
  };

  if (loadError) return <div>Error loading Google Maps</div>;
  if (!isLoaded) return <CircularProgress />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        🩺 Search Doctors
      </Typography>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid  size={{ xs:12, md:4 }}>
          <FormControl fullWidth>
            <InputLabel>Search By</InputLabel>
            <Select
              value={searchType}
              label="Search By"
              onChange={(e) => {
                setSearchType(e.target.value as any);
                setDoctorName("");
                setClinicAddress("");
                setAddress("");
                setLocation(null);
              }}
            >
              <MenuItem value="name">Doctor Name</MenuItem>
              <MenuItem value="address">Clinic Address</MenuItem>
              <MenuItem value="location">Location</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Conditional Search Field */}
        {searchType === "name" && (
          <Grid  size={{ xs:12, md:8 }}>
            <TextField
              fullWidth
              label="Enter Doctor Name"
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
            />
          </Grid>
        )}

        {searchType === "address" && (
          <Grid  size={{ xs:12, md:8 }}>
            <TextField
              fullWidth
              label="Enter Clinic Address"
              value={clinicAddress}
              onChange={(e) => setClinicAddress(e.target.value)}
            />
          </Grid>
        )}

        {searchType === "location" && (
          <Grid  size={{ xs:12, md:8 }}>
            <StandaloneSearchBox onLoad={onLoad} onPlacesChanged={onPlacesChanged}>
              <TextField
                fullWidth
                label="Enter Location"
                variant="outlined"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </StandaloneSearchBox>
          </Grid>
        )}
      </Grid>

      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleSearch}
        disabled={loading}
      >
        {loading ? "Searching..." : "Search"}
      </Button>

      {/* Results */}
      <Box sx={{ mt: 3 }}>
        {loading && <CircularProgress />}
        {!loading && error && <Typography color="error">{error}</Typography>}

        {!loading && doctors.length > 0 && (
          <Grid container spacing={2}>
            {doctors.map((doc, idx) => (
              <Grid  size={{ xs: 12, sm: 6, md: 4 }}>
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: 3,
                    transition: "0.2s",
                    "&:hover": { boxShadow: 6 },
                  }}
                >
                  <CardContent>
                    <Typography variant="h6">{doc.name}</Typography>
                    <Typography color="textSecondary">{doc.specialization}</Typography>
                    <Typography color="textSecondary">{doc.clinicAddress || "N/A"}</Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      📞 {doc.phone || "N/A"}
                    </Typography>

                    {/* 📍 Distance */}
                    {searchType === "location" && (
                      <Typography sx={{ mt: 1 }}>
                        📍 {doc.distance.toFixed(2)} km away
                      </Typography>
                    )}

                    {/* 🌐 Geo location */}
                    {doc.location?.coordinates && (
                      <Box sx={{ mt: 1 }}>
                        
                        <Button
                          variant="outlined"
                          size="small"
                          sx={{ textTransform: "none", mt: 0.5 }}
                          onClick={() =>
                            window.open(
                              `https://www.google.com/maps?q=${doc.location.coordinates[1]},${doc.location.coordinates[0]}`,
                              "_blank"
                            )
                          }
                        >
                          View on Google Maps
                        </Button>
                      </Box>
                    )}

                    {/* 🕒 Clinic Status */}
                    <Box sx={{ mt: 1 }}>
                      <Chip
                        label={doc.statusInfo.status}
                        color={doc.statusInfo.color as any}
                        size="small"
                      />
                    </Box>

                    {/* ⏰ Availability */}
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ mt: 1 }}
                      onClick={() => handleOpenDialog(doc)}
                    >
                      View Availability
                    </Button>

                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      sx={{ mt: 1 }}
                      onClick={() => navigate(`/book-appointment/${doc._id}`)}
                    >
                      Book Appointment
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Availability dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>🕒 Availability - {selectedDoctor?.name}</DialogTitle>
        <DialogContent>
          {selectedDoctor?.availability?.length ? (
            <List>
              {selectedDoctor.availability.map((dayObj: any, index: number) => (
                <ListItem key={index} divider>
                  <ListItemText
                    primary={dayObj.day}
                    secondary={dayObj.slots.map((s: any) => `${s.start} - ${s.end}`).join(", ")}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography>No availability details found.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};