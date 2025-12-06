
import React, { useState } from "react";
import { BASE_URL } from "../utils/constants";
import { axiosInstance } from "../utils/AxiosInstance";
export const Appoint: React.FC = () => {
    const [form, setForm] = useState({
        doctorId: '',
        patientId: '',
        startTime: '',
        endTime: '',
        reason: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prevForm) => ({
            ...prevForm,
            [name]: value,
        }));
    };

    const toObjectId = (num: string | number): string => {
        const hex = Number(num).toString(16);
        return hex.padStart(24, '0'); // ensures it's 24 characters
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const payload = {
                ...form,
                doctorId: form.doctorId, // Ensure it's valid ObjectId
            };

            const response = await axiosInstance.post(
                `${BASE_URL}/api/appointments`,
                payload
            );

            alert("Appointment created successfully!");
        } catch (error: any) {
            console.error("Error creating appointment:", error);

            const msg =
                error.response?.data?.message ||
                error.message ||
                "An error occurred while creating the appointment.";

            alert(`Error: ${msg}`);
        }
    };

    return (
        <div>
            <h1>Create Appointment</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Doctor ID:
                    <input
                        type="text"
                        name="doctorId"
                        value={form.doctorId}
                        onChange={handleChange}
                        required
                    />
                </label>
                <br />
                <label>
                    Patient ID:
                    <input
                        type="text"
                        name="patientId"
                        value={form.patientId}
                        onChange={handleChange}
                        required
                    />
                </label>
                <br />
                <label>
                    Start Time:
                    <input
                        type="datetime-local"
                        name="startTime"
                        value={form.startTime}
                        onChange={handleChange}
                        required
                    />
                </label>
                <br />
                <label>
                    End Time:
                    <input
                        type="datetime-local"
                        name="endTime"
                        value={form.endTime}
                        onChange={handleChange}
                        required
                    />
                </label>
                <br />
                <label>
                    Reason:
                    <textarea
                        name="reason"
                        value={form.reason}
                        onChange={handleChange}
                    />
                </label>
                <br />
                <button type="submit">Create Appointment</button>
            </form>
        </div>
    );
}