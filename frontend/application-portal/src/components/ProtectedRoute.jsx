import { Navigate } from "react-router-dom";

export function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/signin" replace />;
  }

  if (allowedRole && userRole !== allowedRole) {
    return <Navigate to="/signin" replace />;
  }

  return children;
}
