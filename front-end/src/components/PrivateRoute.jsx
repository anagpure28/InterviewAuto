import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated } from "../utils/auth.js";

// Guards routes that require a logged-in user. Without a token we send them to
// the login page and remember where they were headed so we can return them
// there after a successful login.
export const PrivateRoute = ({ children }) => {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return children;
};
