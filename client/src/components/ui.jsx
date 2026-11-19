import { Link } from "react-router-dom";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";

export const cardClass = "rounded-3xl border-2 border-ink bg-white transition-all";
export const hardShadow = "shadow-[6px_6px_0_#0a0a0f] sm:shadow-[8px_8px_0_#0a0a0f]";
export const display = "font-display font-bold tracking-[-0.03em]";

const btnBase =
    "inline-flex items-center justify-center cursor-pointer rounded-full border-2 border-ink min-h-[46px] px-6 py-3 text-center text-[15px] font-bold transition-all duration-150 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-50 select-none";
export const btnDark = `${btnBase} bg-ink text-white hover:bg-ink-soft shadow-[3px_3px_0_#0a0a0f] active:shadow-none`;
export const btnLime = `${btnBase} bg-pop text-ink hover:bg-pop-dark shadow-[3px_3px_0_#0a0a0f] active:shadow-none`;
export const btnOutline =
    "inline-flex items-center justify-center cursor-pointer rounded-full border-2 border-ink bg-white min-h-[38px] px-4 py-1.5 text-[13px] font-semibold text-ink transition-all duration-150 hover:bg-pop hover:shadow-[2px_2px_0_#0a0a0f] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-40 select-none";
export const iconBtn =
    "inline-flex items-center justify-center cursor-pointer rounded-xl p-2 text-mute transition-all duration-150 hover:bg-track hover:text-ink active:scale-95 focus:outline-none focus-visible:outline-2 focus-visible:outline-ink";
export const linkClass =
    "font-bold text-ink underline decoration-pop decoration-[3px] underline-offset-4 hover:decoration-ink transition-colors focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink";

export function Logo({ to = "/" }) {
    return (
        <Link to={to} className="group flex items-center gap-2.5 font-display text-xl font-bold tracking-tight select-none">
            <span className="flex h-[36px] w-[36px] items-center justify-center rounded-[10px] border-2 border-ink bg-ink text-pop transition-all duration-200 group-hover:-translate-y-0.5 group-hover:bg-pop group-hover:text-ink group-hover:shadow-[2px_2px_0_#0a0a0f]">
                <LinkRoundedIcon sx={{ fontSize: 20 }} className="-rotate-45 transition-transform duration-200 group-hover:rotate-0" />
            </span>
            <span>LinkHub</span>
        </Link>
    );
}

export function Notice({ type = "error", children }) {
    if (!children) return null;
    const isErr = type === "error";
    const tone = isErr
        ? "border-rose-600 bg-rose-50/90 text-rose-800 shadow-[2px_2px_0_#e11d48]"
        : "border-ink bg-pop/90 text-ink shadow-[2px_2px_0_#0a0a0f]";
    const Icon = isErr ? ErrorOutlineRoundedIcon : CheckCircleOutlineRoundedIcon;

    return (
        <div role={isErr ? "alert" : "status"} className={`flex items-start gap-2.5 rounded-2xl border-2 px-4 py-3 text-sm font-semibold transition-all ${tone}`}>
            <Icon sx={{ fontSize: 18 }} className="mt-0.5 shrink-0" />
            <span className="flex-1 text-left leading-snug">{children}</span>
        </div>
    );
}

export function Spinner() {
    return (
        <span className="relative inline-block h-6 w-6">
            <span className="absolute inset-0 rounded-full border-[3px] border-line opacity-40" />
            <span className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-ink border-r-pop" />
        </span>
    );
}

export function PageLoader() {
    return (
        <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-white p-6">
            <Spinner />
            <p className="font-display text-xs font-bold uppercase tracking-widest text-mute">Loading LinkHub…</p>
        </div>
    );
}

export function AuthSplit({ title, text, reverse = false, children }) {
    return (
        <div className="grid min-h-dvh w-full bg-white text-ink lg:grid-cols-2">
            <aside className={`relative hidden flex-col justify-between overflow-hidden border-r-2 border-ink bg-pop p-14 lg:flex ${reverse ? "lg:order-2 border-r-0 border-l-2" : ""}`}>
                <div className="absolute inset-0 bg-dot-pattern opacity-60 pointer-events-none" />
                <div className="relative z-10"><Logo /></div>
                <div className="relative z-10 max-w-lg">
                    <p className="font-display text-[clamp(2.5rem,4.5vw,4rem)] font-bold leading-[0.98] tracking-[-0.03em]">{title}</p>
                    <p className="mt-5 text-[17px] leading-relaxed text-ink/80">{text}</p>
                </div>
                <div className="relative z-10 flex items-center gap-2 text-xs font-semibold text-ink/70">
                    <span className="h-2 w-2 rounded-full bg-ink animate-pulse" />
                    <span>Trusted for high-speed link routing & bio pages</span>
                </div>
            </aside>
            <main className="flex items-center justify-center p-6 sm:p-12">
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
        <div className="relative flex min-h-dvh flex-col bg-track/50 p-5 text-ink sm:p-10">
            <div className="absolute inset-0 bg-dot-pattern opacity-40 pointer-events-none" />
            <div className="relative z-10"><Logo /></div>
            <div className="relative z-10 flex flex-1 items-center justify-center py-8">
                <div className={`w-full max-w-md p-6 sm:p-8 ${cardClass} ${hardShadow} ${tone === "lime" ? "bg-pop text-center" : "bg-white"}`}>
                    <h1 className={`${display} text-[clamp(1.5rem,4vw,1.875rem)] leading-tight`}>{title}</h1>
                    {subtitle && <p className="mt-2 text-sm text-mute">{subtitle}</p>}
                    <div className="mt-6 space-y-4">{children}</div>
                </div>
            </div>
        </div>
    );
}
