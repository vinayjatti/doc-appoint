import React, { useMemo, useState } from "react";
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
} from "@mui/material";
import type { ColDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry, themeQuartz } from "ag-grid-community";
// Core CSS
import { AgGridReact } from "ag-grid-react";

ModuleRegistry.registerModules([AllCommunityModule]);

interface Appointment {
    _id: string;
    patientName: string;
    patientNumber: string;
    appointmentDate: string;
    slot?: string;
    paymentStatus?: string;
    patientQueueNumber?: number;
}

interface Doctor {
    _id: string;
    name: string;
}

const MyAppointments: React.FC = () => {
    const [doctorName, setDoctorName] = useState("");
    const [doctor, setDoctor] = useState<Doctor | null>(null);
    const [appointmentDate, setAppointmentDate] = useState("");
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const myTheme = themeQuartz.withParams({
        spacing: 12,
    });



    // Automatically size columns to fit container
    const onGridReady = (params: any) => {
        params.api.sizeColumnsToFit();
    };

    // ✅ AG Grid Columns

    const columnDefs: ColDef[] = useMemo(() => [
        {
            headerName: "#",
            valueGetter: (params: any) => params.node.rowIndex + 1,
            width: 80,
            pinned: "left",
        },
        { headerName: "Patient Name", field: "patientName", flex: 1 },
        { headerName: "Number", field: "patientNumber", flex: 1 },
        { headerName: "Slot", field: "slot", flex: 1 },
        {
            headerName: "Status",
            field: "paymentStatus",
            flex: 1,
            cellClass: (params: any) =>
                params.value === "paid" ? "status-paid" : "status-pending",
        },
    ], []);

    const defaultColDef = useMemo(() => ({
        sortable: true,
        filter: true,
        resizable: true,
        headerClass: "header-cell",
    }), []);

    // 🔍 Find doctor by name
    const findDoctor = async () => {
        try {
            setError("");
            setDoctor(null);
            setAppointments([]);
            setLoading(true);

            const res = await axios.get(`http://localhost:4000/api/users?name=${doctorName}`);
            if (res.data && res.data.doctor) {
                setDoctor(res.data.doctor);
            } else {
                setError("Doctor not found");
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to fetch doctor");
        } finally {
            setLoading(false);
        }
    };

    // 📅 Fetch appointments
    const fetchAppointments = async () => {
        if (!doctor || !appointmentDate) return;
        try {
            setLoading(true);
            setError("");

            const res = await axios.get(
                `http://localhost:4000/api/appointments?doctorId=${doctor._id}&date=${appointmentDate}`
            );
            setAppointments(res.data.appointments || []);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to fetch appointments");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                maxWidth: 900,
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

            {/* 🔍 Doctor Search */}
            <Box display="flex" gap={2} mb={3}>
                <TextField
                    label="Doctor Name"
                    variant="outlined"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    fullWidth
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={findDoctor}
                    disabled={!doctorName || loading}
                >
                    Search
                </Button>
            </Box>

            {doctor && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    Found Doctor: <strong>{doctor.name}</strong>
                </Alert>
            )}

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
                <Paper elevation={2} sx={{ height: 400, width: "100%" }}>
                    <div className="ag-theme-alpine" style={{ height: "100%", width: "100%" }}>
                        <AgGridReact
                            rowData={appointments}
                            columnDefs={columnDefs}
                            defaultColDef={defaultColDef}
                            theme={myTheme}
                            rowSelection={{ mode: "singleRow" }}
                        />
                    </div>
                </Paper>
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