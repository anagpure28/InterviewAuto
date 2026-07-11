import React from "react";
import { Navigate } from "react-router-dom";

// Guards the interview screen: a course must be selected via the language
// picker first. Without one we send the user back to /language — this also
// re-locks /screen after an interview ends, since ScreenPage clears the
// selected course on completion.
export const CourseRoute = ({ children }) => {
  const course = localStorage.getItem("course");

  if (!course) {
    return <Navigate to="/language" replace />;
  }
  return children;
};
