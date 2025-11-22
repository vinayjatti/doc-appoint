import React, { useState } from "react";
import axios from "axios";
import { useProviderStore } from "../store/useProviderStore";
import { TextField, Button, Box, Typography, Alert } from "@mui/material";
import { BASE_URL } from "../utils/constants";

export const AdminCreateAdmin: React.FC = () => {
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "", role: "admin" });
  const [message, setMessage] = useState("");
  const { token } = useProviderStore();

  // Restrict non-admins from seeing the page
  if (!token) {
    return <Alert severity="error">Unauthorized: Please login as admin.</Alert>;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/users/admin/create`,
        { ...form },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("✅ Admin created successfully!");
      setForm({ name: "", phone: "", email: "", password: "", role: "admin" }); // ✅ Reset form
      setTimeout(() => setMessage(""), 3000);
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Failed to create admin");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <Box maxWidth={400} mx="auto" mt={4}>
      <Typography variant="h5" mb={2}>
        Create New Admin
      </Typography>

      <TextField
        fullWidth
        margin="normal"
        name="name"
        label="Name"
        value={form.name}
        onChange={handleChange}
      />
      <TextField
        fullWidth
        margin="normal"
        name="phone"
        label="Phone"
        value={form.phone}
        onChange={handleChange}
      />
      <TextField
        fullWidth
        margin="normal"
        name="email"
        label="Email"
        value={form.email}
        onChange={handleChange}
      />
      <TextField
        fullWidth
        margin="normal"
        name="password"
        label="Password"
        type="password"
        value={form.password}
        onChange={handleChange}
      />

      <Button fullWidth variant="contained" onClick={handleSubmit}>
        Create Admin
      </Button>

      {message && (
        <Alert severity={message.startsWith("✅") ? "success" : "error"} sx={{ mt: 2 }}>
          {message}
        </Alert>
      )}
    </Box>
  );
};