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
import { BASE_URL } from "../../utils/constants";
import { axiosInstance } from "../../utils/AxiosInstance";
import SEO from "../home/SEO";
import { seoConfig } from "../seoConfig";

// Utility to generate slots
const generateSlots = (startHour: number, endHour: number, intervalMins: number) => {
    const slots: string[] = [];
    for (let hour = startHour; hour < endHour; hour++) {
        for (let min = 0; min < 60; min += intervalMins) {
            const start = `${hour.toString().padStart(2, "0")}:${min
                .toString()
                .padStart(2, "0")}`;
            const endHourCalc = hour + Math.floor((min + intervalMins) / 60);
            const endMin = (min + intervalMins) % 60;
            const end = `${endHourCalc.toString().padStart(2, "0")}:${endMin
                .toString()
                .padStart(2, "0")}`;
            slots.push(`${start}-${end}`);
        }
    }
    return slots;
};

export const BookAppointment: React.FC = () => {
    const { providerId } = useParams();
    const navigate = useNavigate();

    const [provider, setProvider] = useState<any>(null);
    const [selectedSlot, setSelectedSlot] = useState("");
    const [bookedSlots, setBookedSlots] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
    const [openDialog, setOpenDialog] = useState(false);
    const [clientName, setClientName] = useState("");
    const [clientContact, setClientContact] = useState("");

    const dailySlots = generateSlots(9, 18, 30);

    useEffect(() => {
        const date = selectedDate
            ? selectedDate.toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0];

        fetchProviderDetails(providerId, date);
    }, [providerId, selectedDate]);

    const fetchProviderDetails = async (providerId: any, date: string) => {
        setLoading(true);
        try {
            // Fetch provider details
            const res = await axiosInstance.get(`${BASE_URL}/api/users/user/${providerId}`);
            setProvider(res.data);

            // Fetch booked slots
            const bookedRes = await axiosInstance.get(
                `${BASE_URL}/api/appointments/booked-slots`,
                {
                    params: { providerId, date },
                }
            );

            setBookedSlots(bookedRes.data.slots || []);
        } catch (err: any) {
            console.error(err);
            const msg =
                err.response?.data?.message ||
                "Failed to fetch provider or slots data";

            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmBooking = async () => {
        if (
            (provider.bookingSlotsType === "slots" && !selectedSlot) ||
            !selectedDate ||
            !clientName
        ) {
            return alert("Please fill all details");
        }

        try {
            setLoading(true);

            const res = await axiosInstance.post(`${BASE_URL}/api/appointments`, {
                providerId,
                clientName: clientName,
                clientContact: clientContact,
                appointmentDate: selectedDate.format("YYYY-MM-DD"),
                slot: selectedSlot,
                bookingStatus: "booked",
                paymentStatus: "pending",
            });

            // SUCCESS
            setSuccess(true);
            setOpenDialog(false);
            setClientName("");
            setClientContact("");
            setSelectedSlot("");

            // Refresh page data
            const date = selectedDate.toISOString().split("T")[0];
            fetchProviderDetails(providerId, date);
        } catch (err: any) {
            console.error("Booking error:", err);

            const msg =
                err.response?.data?.message ||
                "Something went wrong. Please try again.";

            setError(msg);
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

    if (!provider) return null;

    return (
        <Box sx={{ p: 3 }}>
            {/* Provider Details */}
            <SEO {...seoConfig.bookAppointment} />
           
            <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 2 }}>
                <CardContent>
                    <Typography variant="h6">{provider.name}</Typography>
                    <Typography color="textSecondary">{provider.serviceCategory}</Typography>
                    <Typography color="textSecondary">{provider.orgAddress}</Typography>
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
            {provider.bookingSlotsType === "slots" && (
                <Box>
                    <Typography variant="h6" gutterBottom>
                        Select a Time Slot
                    </Typography>

                    <RadioGroup
                        value={selectedSlot}
                        onChange={(e) => setSelectedSlot(e.target.value)}
                    >
                        <Grid container spacing={2}>
                            {dailySlots.map((slot, idx) => {
                                const isBooked = bookedSlots.includes(slot);
                                return (
                                    <Grid key={idx}  size={{xs:6, sm:4, md:3}}>
                                        <Button
                                            variant={
                                                isBooked
                                                    ? "outlined"
                                                    : selectedSlot === slot
                                                    ? "contained"
                                                    : "outlined"
                                            }
                                            color={isBooked ? "error" : "primary"}
                                            fullWidth
                                            disabled={isBooked}
                                            onClick={() => !isBooked && setSelectedSlot(slot)}
                                            sx={{ textTransform: "none", borderRadius: 2 }}
                                        >
                                            {slot} {isBooked ? "(Booked)" : ""}
                                        </Button>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </RadioGroup>
                </Box>
            )}

            <Box sx={{ mt: 3 }}>
                <Button
                    variant="contained"
                    color="primary"
                    disabled={provider.bookingSlotsType === "slots" && !selectedSlot}
                    onClick={() => setOpenDialog(true)}
                >
                    Proceed to Book
                </Button>
                <Button sx={{ ml: 2 }} onClick={() => navigate("/")}>
                    Cancel
                </Button>
            </Box>

            {/* Notifications */}
            <Snackbar
                open={!!error}
                autoHideDuration={3000}
                onClose={() => setError("")}
            >
                <Alert severity="error">{error}</Alert>
            </Snackbar>

            <Snackbar
                open={success}
                autoHideDuration={2000}
                onClose={() => setSuccess(false)}
            >
                <Alert severity="success">Appointment booked successfully!</Alert>
            </Snackbar>

            {/* Booking Dialog */}
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
                        label="Customer Name"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                    />
                    <p></p>
                    <TextField
                        fullWidth
                        label="Customer Contact Number"
                        value={clientContact}
                        onChange={(e) => setClientContact(e.target.value)}
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