import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Field from "../components/Field";
import { AuthSplit, Notice, btnDark, display, linkClass } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../api/api";

export default function Login() {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const location = useLocation();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await login(formData);
        } catch (err) {
            setError(getErrorMessage(err));
            setLoading(false);
        }
    };

    return (
        <AuthSplit title={<>Welcome<br />back.</>} text="Pick up where you left off.">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <h1 className={`${display} text-[2.125rem] leading-tight`}>Log in</h1>
                    <p className="mt-1 text-[15px] text-mute">Enter your details to continue.</p>
                </div>

                {location.state?.registered && <Notice type="success">Account created. Log in to continue.</Notice>}

                <Field id="email" label="Email" type="email" placeholder="you@example.com"
                    autoComplete="email" value={formData.email} onChange={handleChange} required />
                <Field id="password" label="Password" type="password" placeholder="Your password"
                    autoComplete="current-password" value={formData.password} onChange={handleChange} required />

                <p className="text-right text-[13px]">
                    <Link to="/forgot-password" className={linkClass}>Forgot password?</Link>
                </p>

                <Notice>{error}</Notice>

                <button type="submit" disabled={loading} className={`${btnDark} w-full`}>
                    {loading ? "Logging in…" : "Log in"}
                </button>

                <p className="pt-1 text-center text-sm text-mute">
                    New here? <Link to="/signup" className={linkClass}>Create an account</Link>
                </p>
            </form>
        </AuthSplit>
    );
}
