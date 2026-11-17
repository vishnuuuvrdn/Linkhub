import { Link } from "react-router-dom";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";

export const cardClass = "rounded-3xl border-2 border-ink bg-white";
export const hardShadow = "shadow-[8px_8px_0_#0a0a0f]";
export const display = "font-display font-bold tracking-[-0.03em]";

const btnBase =
    "inline-block cursor-pointer rounded-full border-2 border-ink px-6 py-3.5 text-center text-[15px] font-bold transition focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-60";
export const btnDark = `${btnBase} bg-ink text-white hover:bg-ink-soft`;
export const btnLime = `${btnBase} bg-pop text-ink hover:bg-pop-dark`;
export const btnOutline =
    "cursor-pointer rounded-full border-2 border-ink bg-white px-4 py-1.5 text-[13px] font-semibold text-ink transition hover:bg-pop focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-40";
export const iconBtn =
    "cursor-pointer rounded-lg p-1.5 text-mute transition hover:bg-track hover:text-ink focus:outline-none focus-visible:outline-2 focus-visible:outline-ink";
export const linkClass =
    "font-bold text-ink underline decoration-pop decoration-[3px] underline-offset-4 hover:decoration-ink focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink";

export function Logo({ to = "/" }) {
    return (
        <Link to={to} className="flex items-center gap-2.5 font-display text-xl font-bold tracking-tight">
            <span className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] bg-ink text-pop">
                <LinkRoundedIcon sx={{ fontSize: 20 }} className="-rotate-45" />
            </span>
            LinkHub
        </Link>
    );
}

export function Notice({ type = "error", children }) {
    if (!children) return null;
    const tone = type === "error" ? "border-rose-600 bg-rose-50 text-rose-700" : "border-ink bg-pop text-ink";
    return (
        <p role={type === "error" ? "alert" : "status"} className={`rounded-xl border-2 px-3.5 py-2.5 text-sm font-semibold ${tone}`}>
            {children}
        </p>
    );
}

export function Spinner() {
    return <span className="inline-block h-6 w-6 animate-spin rounded-full border-[3px] border-line border-t-ink" />;
}

export function PageLoader() {
    return <div className="flex min-h-dvh items-center justify-center bg-white"><Spinner /></div>;
}

export function AuthSplit({ title, text, reverse = false, children }) {
    return (
        <div className="grid min-h-dvh w-full bg-white text-ink lg:grid-cols-2">
            <aside className={`hidden flex-col justify-between bg-pop p-14 lg:flex ${reverse ? "lg:order-2" : ""}`}>
                <Logo />
                <div>
                    <p className="font-display text-[clamp(2.5rem,4.2vw,3.75rem)] font-bold leading-none tracking-[-0.03em]">{title}</p>
                    <p className="mt-4 max-w-sm text-[17px]">{text}</p>
                </div>
            </aside>
            <main className="flex items-center justify-center p-6 sm:p-10">
                <div className="w-full max-w-sm">
                    <div className="mb-8 lg:hidden"><Logo /></div>
                    {children}
                </div>
            </main>
        </div>
    );
}

export function AuthCard({ title, subtitle, tone = "white", children }) {
    return (
        <div className="flex min-h-dvh flex-col bg-white p-6 text-ink sm:p-10">
            <Logo />
            <div className="flex flex-1 items-center justify-center py-10">
                <div className={`w-full max-w-sm p-8 ${cardClass} ${hardShadow} ${tone === "lime" ? "bg-pop text-center" : ""}`}>
                    <h1 className={`${display} text-[1.75rem] leading-tight`}>{title}</h1>
                    {subtitle && <p className="mt-2 text-sm text-mute">{subtitle}</p>}
                    <div className="mt-6 space-y-4">{children}</div>
                </div>
            </div>
        </div>
    );
}
