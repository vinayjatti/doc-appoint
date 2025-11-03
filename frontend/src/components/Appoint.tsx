
import React, { useState } from "react";
import { BASE_URL } from "../utils/constants";
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
            const response = await fetch(  BASE_URL + '/api/appointments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...form,
                    doctorId: form.doctorId, // Ensure doctorId is sent as a valid ObjectId
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(`Error: ${errorData.message}`);
            } else {
                alert('Appointment created successfully!');
            }
        } catch (error) {
            console.error('Error creating appointment:', error);
            alert('An error occurred while creating the appointment.');
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