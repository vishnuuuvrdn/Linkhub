import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Field from "../components/Field";
import { AuthSplit, Notice, btnLime, display, linkClass } from "../components/ui";
import { authApi } from "../api/services";
import { getErrorMessage } from "../api/api";

export default function Signup() {
    const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const hasConfirm = formData.confirmPassword.length > 0;
    const isMismatch = hasConfirm && formData.password !== formData.confirmPassword;
    const passMatch = !hasConfirm ? "" : isMismatch ? "Passwords don't match" : "Passwords match";

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isMismatch) return;
        setError("");
        setLoading(true);
        try {
            const { confirmPassword, ...payload } = formData;
            await authApi.register(payload);
            navigate("/login", { state: { registered: true } });
        } catch (err) {
            setError(getErrorMessage(err));
            setLoading(false);
        }
    };

    return (
        <AuthSplit reverse title={<>One link.<br />Endless<br />possibilities.</>} text="Shorten links, build your bio page and see what gets clicked.">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <h1 className={`${display} text-[2.125rem] leading-tight`}>Create your account</h1>
                    <p className="mt-1 text-[15px] text-mute">Free to start. No credit card.</p>
                </div>

                <Field id="name" label="Name" placeholder="John" autoComplete="given-name"
                    value={formData.name} onChange={handleChange} required />
                <Field id="email" label="Email" type="email" placeholder="you@example.com"
                    autoComplete="email" value={formData.email} onChange={handleChange} required />
                <Field id="password" label="Password" type="password" placeholder="Create a password"
                    autoComplete="new-password" value={formData.password} onChange={handleChange} required />
                <Field id="confirmPassword" label="Confirm password" type="password" placeholder="Re-enter your password"
                    autoComplete="new-password" value={formData.confirmPassword} onChange={handleChange} required>
                    <p aria-live="polite" className={`mt-1.5 min-h-4 text-xs font-semibold ${isMismatch ? "text-rose-600" : "text-ink"}`}>
                        {passMatch}
                    </p>
                </Field>

                <Notice>{error}</Notice>

                <button type="submit" disabled={loading || isMismatch} className={`${btnLime} w-full`}>
                    {loading ? "Creating account…" : "Sign up"}
                </button>

                <p className="pt-1 text-center text-sm text-mute">
                    Already have an account? <Link to="/login" className={linkClass}>Log in</Link>
                </p>
            </form>
        </AuthSplit>
    );
}
