import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Field from "../components/Field";
import { AuthCard, Notice, Spinner, btnDark, linkClass } from "../components/ui";
import { authApi } from "../api/services";
import { getErrorMessage } from "../api/api";

export default function ResetPassword() {
    const [params] = useSearchParams();
    const token = params.get("token");
    const email = params.get("email");
    const navigate = useNavigate();

    const [step, setStep] = useState(token && email ? "verifying" : "invalid");
    const [message, setMessage] = useState(token && email ? "" : "This reset link is incomplete.");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const ran = useRef(false);

    useEffect(() => {
        if (!token || !email || ran.current) return;
        ran.current = true;
        authApi.verifyToken({ email, token, passReset: true })
            .then(() => setStep("ready"))
            .catch((err) => { setMessage(getErrorMessage(err)); setStep("invalid"); });
    }, [token, email]);

    const isMismatch = confirm.length > 0 && password !== confirm;
    const tooShort = password.length > 0 && password.length < 8;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isMismatch || tooShort) return;
        setMessage("");
        setLoading(true);
        try {
            await authApi.resetPassword(email, password);
            setStep("done");
            setTimeout(() => navigate("/login", { replace: true }), 1800);
        } catch (err) {
            setMessage(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    if (step === "verifying") {
        return (
            <AuthCard title="Checking your link…">
                <div className="flex justify-center py-2"><Spinner /></div>
            </AuthCard>
        );
    }

    if (step === "invalid") {
        return (
            <AuthCard title="Link problem">
                <Notice>{message || "This link is invalid or has expired."}</Notice>
                <Link to="/forgot-password" className={`${btnDark} w-full`}>Request a new link</Link>
            </AuthCard>
        );
    }

    if (step === "done") {
        return (
            <AuthCard title="Password updated">
                <Notice type="success">Your password was reset. Taking you to log in…</Notice>
                <p className="text-center text-sm"><Link to="/login" className={linkClass}>Go now</Link></p>
            </AuthCard>
        );
    }

    return (
        <AuthCard title="Set a new password" subtitle={`For ${email}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Field id="newPassword" label="New password" type="password" placeholder="At least 8 characters"
                    autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required>
                    <p className="mt-1.5 min-h-4 text-xs font-semibold text-rose-600">{tooShort ? "Use at least 8 characters" : ""}</p>
                </Field>
                <Field id="confirmNewPassword" label="Confirm password" type="password" placeholder="Re-enter it"
                    autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required>
                    <p className="mt-1.5 min-h-4 text-xs font-semibold text-rose-600">{isMismatch ? "Passwords don't match" : ""}</p>
                </Field>
                <Notice>{message}</Notice>
                <button type="submit" disabled={loading || isMismatch || tooShort} className={`${btnDark} w-full`}>
                    {loading ? "Saving…" : "Reset password"}
                </button>
            </form>
        </AuthCard>
    );
}
