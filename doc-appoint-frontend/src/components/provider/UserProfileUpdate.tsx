import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
    TextField,
    Button,
    Box,
    Typography,
    Alert,
    CircularProgress,
    Grid,
} from "@mui/material";
import { useDoctorStore } from "../../store/useDoctorStore";
import { Autocomplete, GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { BASE_URL, REACT_APP_GOOGLE_MAP_API_KEY } from "../../utils/constants";

export const UserProfileUpdate: React.FC = () => {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: REACT_APP_GOOGLE_MAP_API_KEY,
        libraries: ["places"], 
    });

    const mapContainerStyle = {
        width: "100%",
        height: "300px",
    };

    const { token, doctorId } = useDoctorStore();
    const mapRef = useRef<google.maps.Map | null>(null);

    const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);

    const [form, setForm] = useState({
        name: "",
        phone: "",
        specialization: "",
        clinicName: "",
        clinicAddress: "",
        clinicGeoLocation: "",
        location: { lat: 12.9716, lng: 77.5946 },
        doctorId: doctorId,
    });

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // -------------------------
    //  Google Map Click Handler
    // -------------------------
    const handleMapClick = (event: google.maps.MapMouseEvent) => {
        if (event.latLng && isEditMode) {
            setForm((prev) => ({
                ...prev,
                location: {
                    lat: event.latLng!.lat(),
                    lng: event.latLng!.lng(),
                },
            }));
        }
    };

    // -------------------------
    //  Autocomplete
    // -------------------------
    const handlePlaceChanged = () => {
        if (autocomplete) {
            const place = autocomplete.getPlace();
            if (place.geometry?.location) {
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                setForm((prev) => ({
                    ...prev,
                    location: { lat, lng },
                    clinicGeoLocation: place.formatted_address || "",
                }));
            }
        }
    };

    const handleLoad = (autoC: google.maps.places.Autocomplete) => setAutocomplete(autoC);

    // -------------------------
    // Fetch Profile on Load
    // -------------------------
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${BASE_URL}/api/users/user/${doctorId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const {
                    name,
                    phone,
                    specialization,
                    clinicName,
                    clinicAddress,
                    clinicGeoLocation,
                    location,
                } = res.data;

                setForm({
                    name: name || "",
                    phone: phone || "",
                    specialization: specialization || "",
                    clinicName: clinicName || "",
                    clinicAddress: clinicAddress || "",
                    clinicGeoLocation: clinicGeoLocation || "",
                    location: location || { lat: 12.9716, lng: 77.5946 },
                    doctorId,
                });
            } catch (err) {
                console.error(err);
                setMessage("Failed to load profile");
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchProfile();
    }, [token]);

    // -------------------------
    //  Validation
    // -------------------------
    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!form.name.trim()) newErrors.name = "Name is required";
        if (!form.phone.trim()) newErrors.phone = "Phone is required";
        if (!form.specialization.trim()) newErrors.specialization = "Specialization is required";
        if (!form.clinicName.trim()) newErrors.clinicName = "Clinic name is required";
        if (!form.clinicAddress.trim()) newErrors.clinicAddress = "Clinic address is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // -------------------------
    //  Update Profile
    // -------------------------
    const handleUpdate = async () => {
        if (!validateForm()) return;

        try {
            setLoading(true);

            const res = await axios.put(
                `${BASE_URL}/api/users/user/update`,
                { ...form },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setMessage("✅ Profile updated successfully!");
            setIsEditMode(false); // back to read-only
        } catch (err: any) {
            console.error("Error updating profile:", err);
            setMessage(err.response?.data?.message || "Failed to update profile");
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(""), 3000);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    };

    if (!token) {
        return <Alert severity="error">Unauthorized: Please log in to update your profile.</Alert>;
    }

    if (loadError) return <div>Error loading maps</div>;
    if (!isLoaded) return <div>Loading map…</div>;

    return (
        <Box maxWidth={500} mx="auto" mt={4}>
            <Typography variant="h5" mb={2}>
                Update Profile
            </Typography>

            {loading && (
                <Box textAlign="center" mb={2}>
                    <CircularProgress />
                </Box>
            )}

            <Grid container spacing={2}>
                {/* -------------------------
                    Text Fields
                -------------------------- */}
                {["name", "phone", "specialization", "clinicName", "clinicAddress"].map((field) => (
                    <Grid key={field}  size={{xs:12}}>
                        <TextField
                            fullWidth
                            required
                            disabled={!isEditMode}
                            label={field.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase())}
                            name={field}
                            value={(form as any)[field]}
                            onChange={handleChange}
                            error={!!errors[field]}
                            helperText={errors[field]}
                        />
                    </Grid>
                ))}

                {/* -------------------------
                    Autocomplete + Map
                -------------------------- */}
               

                {/* -------------------------
                    Edit / Save / Cancel Buttons
                -------------------------- */}
                <Grid  size={{xs:12}}>
                    {!isEditMode ? (
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => setIsEditMode(true)}
                        >
                            Edit Profile
                        </Button>
                    ) : (
                        <Box display="flex" gap={2}>
                            <Button
                                fullWidth
                                variant="contained"
                                color="primary"
                                onClick={handleUpdate}
                                disabled={loading}
                            >
                                Save Changes
                            </Button>

                            <Button
                                fullWidth
                                variant="outlined"
                                color="secondary"
                                onClick={() => setIsEditMode(false)}
                            >
                                Cancel
                            </Button>
                        </Box>
                    )}
                </Grid>
            </Grid>

            {message && (
                <Alert
                    severity={message.startsWith("✅") ? "success" : "error"}
                    sx={{ mt: 2 }}
                >
                    {message}
                </Alert>
            )}
        </Box>
    );
};