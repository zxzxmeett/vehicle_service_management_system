import { Navigate } from "react-router-dom";

//allowed roles are passed as props from App.jsx
//children is component Admin, Security etc
function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Not logged in
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Logged in but role not allowed
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  // Allowed
  return children;
}

export default ProtectedRoute;