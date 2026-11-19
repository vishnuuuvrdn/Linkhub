import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import Field from "../components/Field";
import { AuthCard, Notice, Spinner, btnDark, linkClass } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../api/services";
import { getErrorMessage } from "../api/api";

export default function VerifyEmail() {
    const [params] = useSearchParams();
    const qToken = params.get("token");
    const qEmail = params.get("email");
    const { user, updateUser } = useAuth();
    const continueTo = user ? "/dashboard" : "/login";

    const [status, setStatus] = useState(qToken && qEmail ? "verifying" : "idle");
    const [message, setMessage] = useState("");
    const [email, setEmail] = useState(user?.email || "");
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const ran = useRef(false);

    useEffect(() => {
        if (!qToken || !qEmail || ran.current) return;
        ran.current = true;
        authApi.verifyToken({ email: qEmail, token: qToken })
            .then(({ data }) => {
                setStatus("success");
                setMessage(data.message);
                if (user?.email === qEmail) updateUser({ emailVerified: true });
            })
            .catch((err) => { setStatus("error"); setMessage(getErrorMessage(err)); });
    }, [qToken, qEmail, updateUser, user?.email]);

    const handleSend = async (e) => {
        e.preventDefault();
        setMessage("");
        setSending(true);
        try {
            const { data } = await authApi.sendVerification(email, `${window.location.origin}/verify-email`);
            setSent(true);
            setStatus("sent");
            setMessage(data.message);
        } catch (err) {
            setStatus("error");
            setMessage(getErrorMessage(err));
        } finally {
            setSending(false);
        }
    };

    if (qToken && qEmail) {
        if (status === "success") {
            return (
                <AuthCard title="Email verified" tone="lime">
                    <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-ink text-pop">
                        <CheckRoundedIcon sx={{ fontSize: 34 }} />
                    </span>
                    <p className="text-sm">{message}</p>
                    <Link to={continueTo} className={`${btnDark} w-full`}>Continue</Link>
                </AuthCard>
            );
        }
        return (
            <AuthCard title={status === "verifying" ? "Verifying your email…" : "Verification failed"}>
                {status === "verifying" && <div className="flex justify-center py-2"><Spinner /></div>}
                {status === "error" && <Notice>{message}</Notice>}
                {status !== "verifying" && <Link to={continueTo} className={`${btnDark} w-full`}>Continue</Link>}
                {status === "error" && (
                    <p className="text-center text-sm text-mute">
                        Need a new link? <Link to="/verify-email" className={linkClass}>Request one</Link>
                    </p>
                )}
            </AuthCard>
        );
    }

    return (
        <AuthCard title="Verify your email" subtitle="We'll email you a link to confirm your address.">
            <form onSubmit={handleSend} className="space-y-4">
                <Field id="email" label="Email" type="email" placeholder="you@example.com"
                    autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <Notice type={status === "error" ? "error" : "success"}>{message}</Notice>
                <button type="submit" disabled={sending} className={`${btnDark} w-full`}>
                    {sending ? "Sending…" : sent ? "Resend link" : "Send verification link"}
                </button>
            </form>
            <p className="text-center text-sm">
                <Link to={continueTo} className={linkClass}>{user ? "Skip for now" : "Back to log in"}</Link>
            </p>
        </AuthCard>
    );
}
