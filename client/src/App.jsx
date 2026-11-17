import { Link, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute, PublicOnlyRoute } from "./components/RouteGuards";
import AppLayout from "./components/AppLayout";
import { AuthCard, btnDark } from "./components/ui";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import BioEditor from "./pages/BioEditor";
import PublicBio from "./pages/PublicBio";

function NotFound() {
    return (
        <AuthCard title="Page not found" subtitle="The page you're looking for doesn't exist.">
            <Link to="/" className={`${btnDark} w-full`}>Back home</Link>
        </AuthCard>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/u/:username" element={<PublicBio />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                <Route element={<PublicOnlyRoute />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                </Route>

                <Route element={<ProtectedRoute />}>
                    <Route element={<AppLayout />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/bio" element={<BioEditor />} />
                    </Route>
                </Route>

                <Route path="*" element={<NotFound />} />
            </Routes>
        </AuthProvider>
    );
}
