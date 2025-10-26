import { Alert, Box, Button, Grid, IconButton, TextField, Typography } from "@mui/material";
import React, { useRef, useState } from "react";
import { Autocomplete, GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { REACT_APP_GOOGLE_MAP_API_KEY } from "../../utils/constants";
import { Add, Remove } from "@mui/icons-material";



const mapContainerStyle = {
    width: "100%",
    height: "300px",
};

const center = {
    lat: 12.9716, // Default to Bangalore
    lng: 77.5946,
};


export const Doctor: React.FC = () => {

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: REACT_APP_GOOGLE_MAP_API_KEY || "YOUR_GOOGLE_MAPS_API_KEY",
        libraries: ["places"], // ✅ IMPORTANT: include Places library
    });

    const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
    const mapRef = useRef<google.maps.Map | null>(null);

    const handlePlaceChanged = () => {
        if (autocomplete) {
            const place = autocomplete.getPlace();
            if (place.geometry?.location) {
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                setForm((prev: any) => ({
                    ...prev,
                    location: { lat, lng },
                    clinicGeoLocation: place.formatted_address || "",
                }));
            }
        }
    };

    const handleLoad = (autoC: google.maps.places.Autocomplete) => setAutocomplete(autoC);

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        role: "doctor",
        specialization: "",
        clinicName: "",
        latitude: "",
        longitude: "",
        location: { lat: 12.9716, lng: 77.5946 },
        clinicAddress: "",
        clinicGeoLocation: "",
        availability: [
            { day: "Monday", slots: [{ start: "09:00", end: "17:00" }] },
            { day: "Tuesday", slots: [{ start: "09:00", end: "17:00" }] },
            { day: "Wednesday", slots: [{ start: "09:00", end: "17:00" }] },
            { day: "Thursday", slots: [{ start: "09:00", end: "17:00" }] },
            { day: "Friday", slots: [{ start: "09:00", end: "17:00" }] },
            { day: "Saturday", slots: [{ start: "09:00", end: "13:00" }] },
            { day: "Sunday", slots: [] },
        ],
    });

    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };


    const handleSlotChange = (
        dayIndex: number,
        slotIndex: number,
        field: "start" | "end",
        value: string
    ) => {
        const newAvailability = [...form.availability];
        newAvailability[dayIndex].slots[slotIndex][field] = value;
        setForm({ ...form, availability: newAvailability });
    };

    const addSlot = (dayIndex: number) => {
        const newAvailability = [...form.availability];
        newAvailability[dayIndex].slots.push({ start: "09:00", end: "17:00" });
        setForm({ ...form, availability: newAvailability });
    };

    const removeSlot = (dayIndex: number, slotIndex: number) => {
        const newAvailability = [...form.availability];
        newAvailability[dayIndex].slots.splice(slotIndex, 1);
        setForm({ ...form, availability: newAvailability });
    };

    const handleMapClick = (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
            setForm({
                ...form,
                location: {
                    lat: event.latLng.lat(),
                    lng: event.latLng.lng(),
                },
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMsg("");
        setErrorMsg("");

        try {
            console.log("Submitting form:", form);
            const response = await fetch("http://localhost:4000/api/users/user/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    role: "doctor",
                    latitude: Number(form.location.lat),
                    longitude: Number(form.location.lng),
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessMsg("Doctor record created successfully!");
                setForm({
                    name: "",
                    email: "",
                    phone: "",
                    role: "doctor",
                    latitude: "",
                    longitude: "",
                    specialization: "",
                    clinicName: "",
                    location: { lat: 12.9716, lng: 77.5946 },
                    clinicAddress: "",
                    clinicGeoLocation: "",
                    availability: [
                        { day: "Monday", slots: [{ start: "09:00", end: "17:00" }] },
                        { day: "Tuesday", slots: [{ start: "09:00", end: "17:00" }] },
                        { day: "Wednesday", slots: [{ start: "09:00", end: "17:00" }] },
                        { day: "Thursday", slots: [{ start: "09:00", end: "17:00" }] },
                        { day: "Friday", slots: [{ start: "09:00", end: "17:00" }] },
                        { day: "Saturday", slots: [{ start: "09:00", end: "13:00" }] },
                        { day: "Sunday", slots: [] },
                    ],
                });
                setSuccessMsg("Doctor record created successfully!");
            } else {
                setErrorMsg(data.message || "Failed to create doctor");
            }
        } catch (err) {
            console.error(err);
            setErrorMsg("Server error. Please try again later.");
        }
    };

    if (loadError) return <div>Error loading maps</div>;
    if (!isLoaded) return <div>Loading Google Maps...</div>;

    return (
        <Box sx={{ p: 3, maxWidth: 500, mx: "auto" }}>
            <h2>Create Doctor Record</h2>
            <TextField label="Name" name="name" value={form.name} onChange={handleChange} fullWidth margin="normal" />
            <TextField label="Email" name="email" value={form.email} onChange={handleChange} fullWidth margin="normal" />
            <TextField label="Phone" name="phone" value={form.phone} onChange={handleChange} fullWidth margin="normal" />
            <TextField label="specialization" name="specialization" value={form.specialization} onChange={handleChange} fullWidth margin="normal" />
            <TextField label="Clinic Name" name="clinicName" value={form.clinicName} onChange={handleChange} fullWidth margin="normal" />
            <TextField label="Clinic Address" name="clinicAddress" value={form.clinicAddress} onChange={handleChange} fullWidth margin="normal" />
            
            <Box sx={{ mt: 2 }}>
                <strong>Select Clinic GEO Location:</strong>

                {/* ✅ Address Search Field */}
                <Autocomplete onLoad={handleLoad} onPlaceChanged={handlePlaceChanged}>
                    <TextField
                        label="Search Clinic Address"
                        fullWidth
                        sx={{ my: 2 }}
                        value={form.clinicGeoLocation || ""}
                        onChange={(e) => setForm({ ...form, clinicGeoLocation: e.target.value })}
                    />
                </Autocomplete>

                {/* ✅ Google Map with Click Selection */}
                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={form.location}
                    zoom={13}
                    onClick={handleMapClick}
                    onLoad={(map) => { (mapRef.current = map) }}
                >
                    <Marker position={form.location} />
                </GoogleMap>

                {/* ✅ Show coordinates */}
                <Box sx={{ mt: 2 }}>
                    <TextField label="Latitude" value={form.location.lat} fullWidth InputProps={{ readOnly: true }} margin="dense" />
                    <TextField label="Longitude" value={form.location.lng} fullWidth InputProps={{ readOnly: true }} margin="dense" />
                </Box>
            </Box>

            <Box sx={{ mt: 3 }}>
                <Typography variant="h6">Set Weekly Availability</Typography>
                {form.availability.map((day, dayIndex) => (
                    <Box key={day.day} sx={{ mb: 2, border: "1px solid #ccc", p: 2, borderRadius: 2 }}>
                        <Typography variant="subtitle1">{day.day}</Typography>
                        {day.slots.map((slot, slotIndex) => (
                            <Grid container spacing={1} alignItems="center" key={slotIndex} sx={{ mb: 1 }}>
                                <Grid size={{ xs: 5 }}>
                                    <TextField
                                        type="time"
                                        label="Start"
                                        value={slot.start}
                                        fullWidth
                                        onChange={(e) => handleSlotChange(dayIndex, slotIndex, "start", e.target.value)}
                                    />
                                </Grid>
                                <Grid size={{ xs: 5 }}>
                                    <TextField
                                        type="time"
                                        label="End"
                                        value={slot.end}
                                        fullWidth
                                        onChange={(e) => handleSlotChange(dayIndex, slotIndex, "end", e.target.value)}
                                    />
                                </Grid>
                                <Grid size={{ xs: 2 }}>
                                    <IconButton onClick={() => removeSlot(dayIndex, slotIndex)} size="small" color="error">
                                        <Remove />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        ))}
                        <Button variant="outlined" size="small" onClick={() => addSlot(dayIndex)} startIcon={<Add />}>
                            Add Slot
                        </Button>
                    </Box>
                ))}
            </Box>

            <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }} onClick={handleSubmit}>
                Submit Request
            </Button>
        </Box>
    );
}   