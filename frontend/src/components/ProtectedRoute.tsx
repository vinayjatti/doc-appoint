import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem("doctorToken");
  return token ? <>{children}</> : <Navigate to="/doctor-login" replace />;
};

export default ProtectedRoute;