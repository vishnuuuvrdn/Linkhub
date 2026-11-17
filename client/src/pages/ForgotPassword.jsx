import { useState } from "react";
import { Link } from "react-router-dom";
import Field from "../components/Field";
import { AuthCard, Notice, btnDark, linkClass } from "../components/ui";
import { authApi } from "../api/services";
import { getErrorMessage } from "../api/api";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState({ type: "", message: "" });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: "", message: "" });
        setLoading(true);
        try {
            const { data } = await authApi.forgotPassword(email, `${window.location.origin}/reset-password`);
            setStatus({ type: "success", message: data.message });
        } catch (err) {
            setStatus({ type: "error", message: getErrorMessage(err) });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthCard title="Forgot your password?" subtitle="We'll email you a reset link.">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Field id="email" label="Email" type="email" placeholder="you@example.com"
                    autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <Notice type={status.type || "error"}>{status.message}</Notice>
                <button type="submit" disabled={loading} className={`${btnDark} w-full`}>
                    {loading ? "Sending…" : status.type === "success" ? "Resend link" : "Send reset link"}
                </button>
            </form>
            <p className="text-center text-sm text-mute">
                Remembered it? <Link to="/login" className={linkClass}>Back to log in</Link>
            </p>
        </AuthCard>
    );
}
