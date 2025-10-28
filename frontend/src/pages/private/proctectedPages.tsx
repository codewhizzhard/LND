import { Navigate, Outlet } from "react-router-dom";



function ProtectedRoute() {
  const isAuthenticated = localStorage.getItem("token"); 
  // later replace with your real auth (wallet check)
 return isAuthenticated ? <Outlet /> : <Navigate to="/signin" replace />;
}

export default ProtectedRoute;
