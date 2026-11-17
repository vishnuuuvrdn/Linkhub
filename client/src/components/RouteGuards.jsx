import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PageLoader } from "./ui";

export function ProtectedRoute() {
    const { user, checking } = useAuth();
    const location = useLocation();
    if (checking) return <PageLoader />;
    return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />;
}

export function PublicOnlyRoute() {
    const { user, checking } = useAuth();
    const location = useLocation();
    if (checking) return <PageLoader />;
    return user ? <Navigate to={location.state?.from?.pathname || "/dashboard"} replace /> : <Outlet />;
}
