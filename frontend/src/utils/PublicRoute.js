import React from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "./auth";

const PublicRoute = ({ children }) => {
  return isAuthenticated() ? <Navigate to="/dashboard" /> : children;
};

export default PublicRoute;
