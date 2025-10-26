import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    CircularProgress,
    Grid,
    RadioGroup,
    FormControlLabel,
    Radio,
    Snackbar,
    Alert,
    DialogActions,
    DialogContent,
    TextField,
    Dialog,
    DialogTitle,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";

// Utility to generate slots (e.g. every 30 minutes)
const generateSlots = (startHour: number, endHour: number, intervalMins: number) => {
    const slots: string[] = [];
    for (let hour = startHour; hour < endHour; hour++) {
        for (let min = 0; min < 60; min += intervalMins) {
            const start = `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
            const endHour = hour + Math.floor((min + intervalMins) / 60);
            const endMin = (min + intervalMins) % 60;
            const end = `${endHour.toString().padStart(2, "0")}:${endMin.toString().padStart(2, "0")}`;
            slots.push(`${start}-${end}`);
        }
    }
    return slots;
};

export const BookAppointment: React.FC = () => {
    const { doctorId } = useParams();
    const navigate = useNavigate();

    const [doctor, setDoctor] = useState<any>(null);
    const [selectedSlot, setSelectedSlot] = useState("");
    const [bookedSlots, setBookedSlots] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
    const [openDialog, setOpenDialog] = useState(false);
    const [patientName, setPatientName] = useState("");

    // Generate fixed slots for morning to evening (9 AM - 6 PM)
    const dailySlots = generateSlots(9, 18, 30); // every 30 mins

    useEffect(() => {
        const date = selectedDate === null ? new Date().toISOString().split("T")[0] : selectedDate.toISOString().split("T")[0];
        fetchDoctorDetails(doctorId, date);
    }, [doctorId, selectedDate]);

    const fetchDoctorDetails = async (doctorId: any, date: string) => {
        setLoading(true);
        try {
            // Fetch doctor details
            const res = await fetch(`http://localhost:4000/api/users/user/${doctorId}`);
            const data = await res.json();

            if (res.status === 200) {
                setDoctor(data);
            } else {
                setError(data.message || "Doctor not found");
            }

            // Fetch booked slots for today
            // yyyy-mm-dd
            const bookedRes = await fetch(
                `http://localhost:4000/api/appointments/booked-slots?doctorId=${doctorId}&date=${date}`
            );
            const bookedData = await bookedRes.json();
            if (bookedRes.status === 200) {
                setBookedSlots(bookedData.slots || []);
            }
        } catch (err) {
            console.error(err);
            setError("Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmBooking = async () => {
        if (!selectedSlot || !selectedDate || !patientName) return alert("Please fill all details");

        try {
            setLoading(true);
            const res = await fetch("http://localhost:4000/api/appointments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    doctorId,
                    patientName,
                    appointmentDate: selectedDate.format("YYYY-MM-DD"),
                    slot: selectedSlot,
                    paymentStatus: "pending",
                }),
            });

            if (!res.ok) {
                const errData = await res.json();
                alert(errData.message || "Failed to book slot");
            } else {
                alert("Appointment booked successfully!");
                setOpenDialog(false);
                const date = selectedDate.toISOString().split("T")[0];
                fetchDoctorDetails(doctorId, date);
            }
        } catch (err) {
            console.error("Booking error:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <CircularProgress sx={{ m: 3 }} />;
    if (error)
        return (
            <Box sx={{ p: 3 }}>
                <Typography color="error">{error}</Typography>
                <Button onClick={() => navigate("/")}>Go Back</Button>
            </Box>
        );

    if (!doctor) return null;

    return (
        <Box sx={{ p: 3 }}>
            {/* Doctor Details */}
            <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 2 }}>
                <CardContent>
                    <Typography variant="h6">{doctor.name}</Typography>
                    <Typography color="textSecondary">{doctor.specialization}</Typography>
                    <Typography color="textSecondary">{doctor.clinicAddress}</Typography>
                </CardContent>
            </Card>

            <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                    Select Appointment Date:
                </Typography>
                <DatePicker
                    value={selectedDate}
                    onChange={(newValue) => setSelectedDate(newValue)}
                    disablePast
                />
            </Box>

            {/* Slot Selection */}
            <Typography variant="h6" gutterBottom>
                Select a Time Slot (Today)
            </Typography>

            <RadioGroup value={selectedSlot} onChange={(e) => setSelectedSlot(e.target.value)}>
                <Grid container spacing={2}>
                    {dailySlots.map((slot, idx) => {
                        const isBooked = bookedSlots.includes(slot);
                        return (
                            <Grid key={idx} size={{ xs: 6, sm: 4, md: 3 }}>
                                <Button
                                    variant={isBooked ? "outlined" : selectedSlot === slot ? "contained" : "outlined"}
                                    color={isBooked ? "error" : "primary"}
                                    fullWidth
                                    disabled={isBooked}
                                    onClick={() => !isBooked && setSelectedSlot(slot)}
                                    sx={{
                                        textTransform: "none",
                                        fontWeight: isBooked ? 400 : 500,
                                        borderRadius: 2,
                                    }}
                                >
                                    {slot} {isBooked ? "(Booked)" : ""}
                                </Button>
                            </Grid>
                        );
                    })}
                </Grid>
            </RadioGroup>

            <Box sx={{ mt: 3 }}>
                <Button
                    variant="contained"
                    color="primary"
                    disabled={!selectedSlot}
                    onClick={() => setOpenDialog(true)}
                >
                    Proceed to Book
                </Button>
                <Button sx={{ ml: 2 }} onClick={() => navigate("/")}>
                    Cancel
                </Button>
            </Box>

            {/* Notifications */}
            <Snackbar open={!!error} autoHideDuration={3000} onClose={() => setError("")}>
                <Alert severity="error">{error}</Alert>
            </Snackbar>

            <Snackbar open={success} autoHideDuration={2000} onClose={() => setSuccess(false)}>
                <Alert severity="success">Appointment booked successfully!</Alert>
            </Snackbar>
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Confirm Appointment</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        Date: <strong>{selectedDate?.format("DD MMM YYYY")}</strong>
                        <br />
                        Slot: <strong>{selectedSlot}</strong>
                    </Typography>

                    <TextField
                        fullWidth
                        label="Patient Name"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleConfirmBooking}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={20} /> : "Confirm Booking"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};