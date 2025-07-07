import React from "react";
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const username = localStorage.getItem("username");

  const isValid = typeof username === "string" && username.trim() !== "";

  return isValid ? children : <Navigate to="/" replace />;
}
