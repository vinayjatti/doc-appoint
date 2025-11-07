import { Alert, Box, Button, FormControl, Grid, IconButton, InputLabel, MenuItem, Select, SelectChangeEvent, Snackbar, TextField, Typography } from "@mui/material";
import React, { useRef, useState } from "react";
import { Autocomplete, GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { BASE_URL, REACT_APP_GOOGLE_MAP_API_KEY } from "../../utils/constants";
import { Add, Remove } from "@mui/icons-material";
import WeeklyAvailabilityAccordion from "./WeeklyAvailabilityAccordion";
import axios from "axios";



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
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const [step, setStep] = useState(1);
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
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "doctor",
    specialization: "",
    clinicName: "",
    latitude: "",
    longitude: "",
    bookingSlotsType: "number",
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

  const [errors, setErrors] = useState<any>({});

  const validateField = (name: string, value: string) => {
    let error = "";

    switch (name) {
      case "name":
        if (!value.trim()) error = "Name is required.";
        break;
      case "email":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          error = "Enter a valid email.";
        break;
      case "phone":
        if (!/^[0-9]{10}$/.test(value))
          error = "Phone number must be 10 digits.";
        break;
      case "password":
        if (value.length < 8)
          error = "Password must be at least 8 characters.";
        break;
      case "confirmPassword":
        if (value !== form.password) error = "Passwords do not match.";
        break;
      case "specialization":
        if (!value.trim()) error = "Specialization is required.";
        break;
      case "clinicName":
        if (!value.trim()) error = "Clinic name is required.";
        break;
      case "clinicAddress":
        if (!value.trim()) error = "Clinic address is required.";
        break;
      case "bookingSlotsType":
        if (!value) error = "Please select a booking type.";
        break;
      default:
        break;
    }

    setErrors((prev: any) => ({ ...prev, [name]: error }));
    return error;
  };

  const handleSelectChange = (event: any) => {
    const { name, value } = event.target;
    setForm({ ...form, [name]: value });
    validateField(name, value);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>
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

  const handleVerifyOtp = async (email: string, otp: any) => {
    try {
      const res = await fetch(BASE_URL + "/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();

      if (res.ok) {
        setSnackbar({ open: true, message: "OTP Verified Successfully!", severity: "success" });
        setStep(3); // go to password setup
      } else {
        throw new Error(data.message || "Invalid OTP");
      }
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message, severity: "error" });
    }
  };

  const handleSendOtp = async (email: string) => {
    try {
      await axios.post(BASE_URL + "/api/auth/send-otp-email", { email });
      setOtpSent(true);
      alert("OTP has been sent to your email!");
    } catch (error) {
      alert("Failed to send OTP. Please try again.");
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {

    const fields = Object.keys(form);
    let hasError = false;
    const newErrors: any = {};

    fields.forEach((field) => {
      const error = validateField(field, (form as any)[field]);
      if (error) hasError = true;
      newErrors[field] = error;
    });

    if (hasError) {
      setErrors(newErrors);
      return;
    }


    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    try {
      console.log("Submitting form:", form);
      const response = await fetch(BASE_URL + "/api/users/user/create", {
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
          password: "",
          confirmPassword: "",
          role: "doctor",
          latitude: "",
          longitude: "",
          bookingSlotsType: "number",
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
        setSnackbar({
          open: true,
          message: "Doctor record created successfully!",
          severity: "success",
        });

      } else {
        setErrorMsg(data.message || "Failed to create doctor");
        setSnackbar({
          open: true,
          message: data.message || "Failed to create doctor",
          severity: "error",
        });
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Server error. Please try again later.");
      setSnackbar({
        open: true,
        message: "Failed to create doctor",
        severity: "error",
      });
    }
  };

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Google Maps...</div>;

  return (
    <Box sx={{ p: 3, maxWidth: 500, mx: "auto" }}>
      {step === 1 && (
        <>
          <h2>Create Doctor Record</h2>
          <TextField label="Name" name="name" value={form.name} onChange={handleChange} fullWidth margin="normal" error={!!errors.name} helperText={errors.name} />
          <TextField label="Email" name="email" value={form.email} onChange={handleChange} fullWidth margin="normal" error={!!errors.email} helperText={errors.email} />

          <TextField label="Phone" name="phone" value={form.phone} onChange={handleChange} fullWidth margin="normal" error={!!errors.phone} helperText={errors.phone} />
          <TextField label="Enter Passsword" name="password" type="password" value={form.password} onChange={handleChange} fullWidth margin="normal" error={!!errors.password} helperText={errors.password} />
          <TextField label="Confirm Password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} fullWidth margin="normal" error={!!errors.confirmPassword} helperText={errors.confirmPassword} />
          <TextField label="specialization" name="specialization" value={form.specialization} onChange={handleChange} fullWidth margin="normal" error={!!errors.specialization} helperText={errors.specialization} />
          <TextField label="Clinic Name" name="clinicName" value={form.clinicName} onChange={handleChange} fullWidth margin="normal" error={!!errors.clinicName} helperText={errors.clinicName} />
          <TextField label="Clinic Address" name="clinicAddress" value={form.clinicAddress} onChange={handleChange} fullWidth margin="normal" error={!!errors.clinicAddress} helperText={errors.clinicAddress} />
          <FormControl fullWidth margin="normal">
            <InputLabel id="booking-type-label">Booking Type</InputLabel>
            <Select
              labelId="booking-type-label"
              name="bookingSlotType"
              value={form.bookingSlotsType || ""}
              label="Booking Type"
              onChange={handleChange}
            >
              <MenuItem value="slots">Slot Based (Time)</MenuItem>
              <MenuItem value="number">Queue Based (Token)</MenuItem>
            </Select>
          </FormControl>
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
            <Box sx={{ mt: 2 }} style={{ display: "none", gap: "1rem" }}>
              <TextField label="Latitude" value={form.location.lat} fullWidth InputProps={{ readOnly: true }} margin="dense" />
              <TextField label="Longitude" value={form.location.lng} fullWidth InputProps={{ readOnly: true }} margin="dense" />
            </Box>
          </Box>
          <WeeklyAvailabilityAccordion
            form={form}
            handleSlotChange={handleSlotChange}
            addSlot={addSlot}
            removeSlot={removeSlot}
          />

          <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }} onClick={handleSubmit}>
            Register
          </Button>
          <Snackbar
            open={snackbar.open}
            autoHideDuration={4000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
              {snackbar.message}
            </Alert>
          </Snackbar>
        </>
      )}
      {step === 2 && (
        <>
          <Typography variant="h6" mb={2}>Verify Email</Typography>

          {/* Display the user's email */}
          <Typography variant="body1" mb={2}>
            OTP will be sent to your EMail: <strong>{form.email}</strong>
          </Typography>

          {/* Send / Resend OTP button */}
          <Button
            variant="contained"
            fullWidth
            sx={{ mb: 2 }}
            onClick={() => handleSendOtp(form.email)}
          >
            {otpSent ? "Resend OTP" : "Send OTP"}
          </Button>

          {/* Show field only after OTP is sent */}
          {otpSent && (
            <>
              <TextField
                label="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                fullWidth
                margin="normal"
              />

              <Button
                variant="contained"
                color="success"
                fullWidth
                sx={{ mt: 1 }}
                onClick={() => handleVerifyOtp(form.email, otp)}
              >
                Verify OTP
              </Button>
            </>
          )}

          <Button
            variant="outlined"
            fullWidth
            sx={{ mt: 2 }}
            onClick={() => setStep(1)}
          >
            Back
          </Button>
        </>
      )}



    </Box>
  );
}   