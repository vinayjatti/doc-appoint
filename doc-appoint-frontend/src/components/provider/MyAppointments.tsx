import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
    Box,
    TextField,
    Button,
    Typography,
    CircularProgress,
    Paper,
    Alert,
    createTheme,
    useMediaQuery,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from "@mui/material";
import type { ColDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry, themeQuartz } from "ag-grid-community";
// Core CSS
import { AgGridReact } from "ag-grid-react";
import { BASE_URL } from "../../utils/constants";
import { useDoctorStore } from "../../store/useDoctorStore";

ModuleRegistry.registerModules([AllCommunityModule]);

interface Appointment {
    _id: string;
    patientName: string;
    patientNumber: string;
    appointmentDate: string;
    slot?: string;
    bookingStatus?: string;
    paymentStatus?: string;
    patientQueueNumber?: number;
}

interface Doctor {
    _id: string;
    name: string;
     bookingSlotsType: "slots" | "number";
}

const MyAppointments: React.FC = () => {
    const [doctor, setDoctor] = useState<Doctor | null>(null);
    const [appointmentDate, setAppointmentDate] = useState("");
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedRows, setSelectedRows] = useState<Appointment[]>([]);
    const [bookingStatus, setBookingStatus] = useState("");
    const [paymentStatus, setPaymentStatus] = useState("");
    const { doctorId, doctorName, token,bookingSlotsType } = useDoctorStore();


    const myTheme = themeQuartz.withParams({
        spacing: 12,
    });



    // Automatically size columns to fit container
    const onGridReady = (params: any) => {
        params.api.sizeColumnsToFit();
    };

    // ✅ AG Grid Columns

    const columnDefs: ColDef[] = useMemo(() => {
       const cols: ColDef[] =  [
        {
            headerCheckboxSelection: true,   // ✅ Checkbox in header for "select all"
            checkboxSelection: true,          // ✅ Checkbox in each row
            width: 60,
            pinned: "left",
            headerName: "",                   // optional: hide header label
        },
        {
            headerName: "#",
            valueGetter: (params: any) => params.node.rowIndex + 1,
            width: 50,
            pinned: "left",
        },
        { headerName: "Patient Name", field: "patientName", flex: 1 },
        { headerName: "Number", field: "patientNumber", flex: 1 },
       
        {
            headerName: "Booking Status",
            field: "bookingStatus",
            flex: 1,
            cellStyle: (params: any) => {
                const value = params.value?.toLowerCase();
                if (value === "confirmed") {
                    return { color: "green", fontWeight: 600 };
                } else if (value === "closed") {
                    return { color: "orange", fontWeight: 600 };
                } else {
                    return { color: "gray", fontWeight: 500 };
                }
            }

        },
        {
            headerName: "Payment Status",
            field: "paymentStatus",
            flex: 1,
            cellClass: (params: any) =>
                params.value === "paid" ? "status-paid" : "status-pending",
            cellStyle: (params: any) => {
                const value = params.value?.toLowerCase();
                if (value === "paid") {
                    return { color: "green", fontWeight: 600 };
                } else if (value === "unpaid") {
                    return { color: "gray", fontWeight: 500 };
                } else {
                    return { color: "orange", fontWeight: 600 };
                }
            },
        },

    ]
    if (bookingSlotsType === "number") {
        cols.push({ headerName: "Queue Number", field: "patientQueueNumber", flex: 1 });
    } else {
        cols.push({ headerName: "Slots booked", field: "slot", flex: 1 });
    }
    return cols;
    }, []);

    const defaultColDef = useMemo(() => ({
        sortable: true,
        filter: true,
        resizable: true,
        headerClass: "header-cell",
    }), []);

    useEffect(() => {
        if (!doctorId) {
            setError("Doctor not logged in. Please log in again.");
            return;
        }

        const fetchDoctor = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${BASE_URL}/api/users/user/${doctorId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setDoctor(res.data);
            } catch (err: any) {
                setError(err.response?.data?.message || "Failed to load doctor info");
            } finally {
                setLoading(false);
            }
        };

        fetchDoctor();
    }, []);


    const onSelectionChanged = (event: any) => {
        setSelectedRows(event.api.getSelectedRows());
    };

    // 📅 Fetch appointments
    const fetchAppointments = async () => {
        if (!doctor || !appointmentDate) return;
        try {
            setLoading(true);
            setError("");

            const res = await axios.get(
                `${BASE_URL}/api/appointments?doctorId=${doctor._id}&date=${appointmentDate}`
            );
            setAppointments(res.data.appointments || []);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to fetch appointments");
        } finally {
            setLoading(false);
        }
    };

    const handleBulkUpdate = async () => {
        if (selectedRows.length === 0) {
            setError("Please select at least one appointment to update.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const updates = selectedRows.map((row) => ({
                appointmentId: row._id,
                bookingStatus: bookingStatus || row.bookingStatus,
                paymentStatus: paymentStatus || row.paymentStatus,
            }));

            await axios.put(`${BASE_URL}/api/appointments/bulk-update`, { updates });

            // Refresh list after update
            fetchAppointments();
            setBookingStatus("");
            setPaymentStatus("");
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to update appointments");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                maxWidth: 1200,
                minWidth: 900,
                mx: "auto",
                mt: 6,
                p: 4,
                backgroundColor: "background.paper",
                boxShadow: 3,
                borderRadius: 3,
            }}
        >
            <Typography variant="h5" fontWeight={600} mb={3}>
                My Appointments
            </Typography>

            {/* 📅 Date Picker */}
            {doctor && (
                <Box display="flex" gap={2} mb={3}>
                    <TextField
                        type="date"
                        label="Appointment Date"
                        InputLabelProps={{ shrink: true }}
                        value={appointmentDate}
                        onChange={(e) => setAppointmentDate(e.target.value)}
                        fullWidth
                    />
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={fetchAppointments}
                        disabled={!appointmentDate || loading}
                    >
                        View Appointments
                    </Button>
                </Box>
            )}

            {appointments.length > 0 && (
                <Box display="flex" gap={2} mb={3} flexWrap="wrap">
                    <FormControl sx={{ minWidth: 160 }}>
                        <InputLabel>Booking Status</InputLabel>
                        <Select
                            value={bookingStatus}
                            onChange={(e) => setBookingStatus(e.target.value)}
                            label="Booking Status"
                        >
                            <MenuItem value="confirmed">Confirmed</MenuItem>
                            <MenuItem value="cancelled">Cancelled</MenuItem>
                            <MenuItem value="pending">Pending</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl sx={{ minWidth: 160 }}>
                        <InputLabel>Payment Status</InputLabel>
                        <Select
                            value={paymentStatus}
                            onChange={(e) => setPaymentStatus(e.target.value)}
                            label="Payment Status"
                        >
                            <MenuItem value="paid">Paid</MenuItem>
                            <MenuItem value="unpaid">Unpaid</MenuItem>
                            <MenuItem value="partial">Partial</MenuItem>
                        </Select>
                    </FormControl>

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleBulkUpdate}
                        disabled={loading || selectedRows.length === 0}
                    >
                        Update Selected
                    </Button>
                </Box>
            )}


            {/* ⚠️ Error */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {/* ⏳ Loading */}
            {loading && (
                <Box display="flex" justifyContent="center" mt={4}>
                    <CircularProgress />
                </Box>
            )}

            {/* 📋 Appointments Table */}
            {!loading && appointments.length > 0 && (
                <>

                    <Box
                        className="ag-theme-alpine"
                        sx={{
                            width: "100%",
                            minWidth: 600, // ✅ ensures table doesn’t collapse too much
                            height: { xs: 400, md: 500 }, // ✅ responsive height
                        }}
                    >
                        <AgGridReact
                            rowData={appointments}
                            columnDefs={columnDefs}
                            defaultColDef={defaultColDef}
                            rowSelection={"multiple"}
                            suppressRowClickSelection={true}
                            onSelectionChanged={onSelectionChanged}
                            theme={myTheme}
                            domLayout="autoHeight" // ✅ adjusts grid height automatically
                        />
                    </Box>
                </>
            )}

            {!loading && doctor && appointments.length === 0 && (
                <Typography variant="body1" color="text.secondary" mt={2}>
                    No appointments found for the selected date.
                </Typography>
            )}
        </Box>
    );
};

export default MyAppointments;