import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import { useAuth } from "../context/AuthContext";
import { Logo, btnDark, cardClass, hardShadow } from "../components/ui";

const bars = [35, 60, 45, 95, 75, 100, 85];

export default function Home() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [copied, setCopied] = useState(false);

    const handleCopyDemo = async () => {
        try {
            await navigator.clipboard.writeText("https://linkhub.vishnuuuvrdn.me/r/vishnu/portfolio");
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // ignore
        }
    };

    return (
        <div className="relative min-h-dvh overflow-x-hidden bg-white text-ink selection:bg-pop selection:text-ink">
            {/* Subtle background dot pattern */}
            <div className="absolute inset-0 bg-dot-pattern opacity-40 pointer-events-none" />

            {/* Header */}
            <header className="sticky top-0 z-40 border-b-2 border-ink bg-white/90 backdrop-blur-md">
                <div className="mx-auto flex h-16 sm:h-20 max-w-6xl items-center justify-between px-4 sm:px-8">
                    <Logo />
                    <nav className="flex items-center gap-3 sm:gap-4 text-sm font-bold">
                        {user ? (
                            <Link
                                to="/dashboard"
                                className="inline-flex min-h-[44px] items-center rounded-full border-2 border-ink bg-pop px-5 py-2 shadow-[2px_2px_0_#0a0a0f] hover:bg-pop-dark active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all duration-150"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="hidden sm:inline-block px-4 py-2 hover:text-ink/70 transition-colors"
                                >
                                    Log in
                                </Link>
                                <Link
                                    to="/signup"
                                    className="inline-flex min-h-[44px] items-center rounded-full border-2 border-ink bg-pop px-5 py-2 shadow-[2px_2px_0_#0a0a0f] hover:bg-pop-dark active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all duration-150"
                                >
                                    Sign up free
                                </Link>
                            </>
                        )}
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <main className="relative z-10 mx-auto max-w-6xl px-4 pt-10 pb-20 sm:px-8 sm:pt-16 sm:pb-28 text-center">
                {/* Pill badge */}
                <div className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-white px-4 py-1.5 text-xs sm:text-sm font-bold shadow-[2px_2px_0_#0a0a0f]">
                    <span className="flex h-2 w-2 rounded-full bg-pop animate-pulse" />
                    <span>Next-Gen Link Shortener & Bio Builder</span>
                </div>

                {/* Hero Title */}
                <h1 className="mx-auto mt-6 max-w-4xl font-display text-[clamp(2.75rem,8.5vw,5.75rem)] font-extrabold leading-[0.96] tracking-[-0.04em] text-balance">
                    Your entire online presence in{" "}
                    <span className="relative inline-block -rotate-1 rounded-2xl border-2 border-ink bg-pop px-4 py-0.5 shadow-[4px_4px_0_#0a0a0f]">
                        one link.
                    </span>
                </h1>

                {/* Subtitle */}
                <p className="mx-auto mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-mute text-pretty">
                    Shorten links with custom slugs, build a personalized public bio page, and track clicks across desktop and mobile in real time.
                </p>

                {/* Call to action buttons */}
                <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                    <button
                        type="button"
                        onClick={() => navigate(user ? "/dashboard" : "/signup")}
                        className={`${btnDark} w-full sm:w-auto px-8 py-3.5 text-base flex items-center justify-center gap-2`}
                    >
                        <span>{user ? "Open your dashboard" : "Get started free"}</span>
                        <ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />
                    </button>
                    {!user && (
                        <Link
                            to="/login"
                            className="inline-flex min-h-[46px] w-full sm:w-auto items-center justify-center rounded-full border-2 border-ink bg-white px-6 py-3 text-sm font-bold text-ink shadow-[3px_3px_0_#0a0a0f] hover:bg-track active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-150"
                        >
                            Log in to existing account
                        </Link>
                    )}
                </div>

                {/* Dynamic showcase cards */}
                <div className="mt-14 sm:mt-20 flex flex-col lg:flex-row items-center justify-center gap-6 sm:gap-8">
                    {/* Bio Showcase Card */}
                    <div className="w-full max-w-xs rounded-[32px] border-2 border-ink bg-ink p-6 text-white shadow-[8px_8px_0_#c6f432] transition-transform duration-200 hover:-translate-y-1 lg:-rotate-2">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-pop font-display text-2xl font-bold uppercase text-ink">
                            V
                        </div>
                        <p className="mt-3 font-display text-lg font-bold">Vishnu Vardhan</p>
                        <p className="text-xs text-faint">@vishnu</p>
                        <div className="mt-5 space-y-2.5">
                            <div className="flex items-center justify-center gap-2 rounded-xl bg-white p-3 text-xs font-bold text-ink shadow-[2px_2px_0_#fff]">
                                <PersonRoundedIcon sx={{ fontSize: 16 }} /> Portfolio & Work
                            </div>
                            <div className="flex items-center justify-center gap-2 rounded-xl bg-pop p-3 text-xs font-bold text-ink shadow-[2px_2px_0_#c6f432]">
                                <LinkRoundedIcon sx={{ fontSize: 16 }} /> Latest Project
                            </div>
                            <div className="flex items-center justify-center gap-2 rounded-xl border-2 border-ink-soft p-2.5 text-xs font-bold text-white hover:border-white transition-colors">
                                GitHub Profile
                            </div>
                        </div>
                    </div>

                    {/* Short Link Card */}
                    <div className={`w-full max-w-sm p-6 sm:p-7 text-left ${cardClass} ${hardShadow} bg-pop transition-transform duration-200 hover:-translate-y-1`}>
                        <div className="flex items-center justify-between">
                            <span className="inline-block rounded-full border border-ink bg-white px-2.5 py-0.5 text-[11px] font-bold tracking-wider uppercase">
                                Instant Short Link
                            </span>
                            <span className="text-xs font-bold text-ink/70">Custom Slug</span>
                        </div>
                        <p className="mt-3 font-display text-xl sm:text-2xl font-bold leading-tight">
                            linkhub.me/r/vishnu/portfolio
                        </p>
                        <p className="mt-1 text-xs text-ink/80 truncate">
                            Redirects to https://vishnuuuvrdn.me
                        </p>
                        <button
                            type="button"
                            onClick={handleCopyDemo}
                            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border-2 border-ink bg-ink px-4 py-2.5 text-xs font-bold text-white shadow-[2px_2px_0_#0a0a0f] hover:bg-ink-soft active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all duration-150"
                        >
                            {copied ? (
                                <>
                                    <CheckRoundedIcon sx={{ fontSize: 16 }} />
                                    <span>Copied to clipboard!</span>
                                </>
                            ) : (
                                <>
                                    <ContentCopyRoundedIcon sx={{ fontSize: 16 }} />
                                    <span>Copy demo link</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Analytics Card */}
                    <div className={`w-full max-w-xs p-6 sm:p-7 text-left ${cardClass} ${hardShadow} transition-transform duration-200 hover:-translate-y-1 lg:rotate-2`}>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold tracking-wider text-mute uppercase">Clicks this week</span>
                            <span className="rounded-full bg-pop px-2 py-0.5 text-[11px] font-bold text-ink">+42%</span>
                        </div>
                        <p className="mt-2 font-display text-4xl font-extrabold leading-none">2,840</p>
                        <div className="mt-5 flex h-24 items-end gap-2" aria-hidden="true">
                            {bars.map((h, i) => (
                                <div
                                    key={i}
                                    style={{ height: `${h}%` }}
                                    className={`flex-1 rounded-t-md transition-all duration-300 ${
                                        h === 100
                                            ? "border-2 border-ink bg-pop"
                                            : i % 2 === 0
                                            ? "bg-ink"
                                            : "bg-ink/70"
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Features Grid */}
                <section className="mt-20 sm:mt-32 text-left">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-balance">
                            Everything you need to share, track, and brand your links
                        </h2>
                        <p className="mt-3 text-mute text-base text-pretty">
                            Built with modern web standards for exceptional speed and usability across any screen size.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className={`${cardClass} p-6 sm:p-8 ${hardShadow}`}>
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-ink bg-pop text-ink">
                                <LinkRoundedIcon sx={{ fontSize: 26 }} />
                            </div>
                            <h3 className="mt-5 font-display text-xl font-bold">Fast Custom Slugs</h3>
                            <p className="mt-2 text-sm text-mute leading-relaxed text-pretty">
                                Create memorable, branded short links with custom paths like <span className="font-semibold text-ink">/r/you/portfolio</span> for high conversion.
                            </p>
                        </div>

                        <div className={`${cardClass} p-6 sm:p-8 ${hardShadow}`}>
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-ink bg-ink text-pop">
                                <PersonRoundedIcon sx={{ fontSize: 26 }} />
                            </div>
                            <h3 className="mt-5 font-display text-xl font-bold">Branded Bio Card</h3>
                            <p className="mt-2 text-sm text-mute leading-relaxed text-pretty">
                                Showcase your portfolio, social profiles, and custom projects on a sleek bio page with live editing and instant sharing.
                            </p>
                        </div>

                        <div className={`${cardClass} p-6 sm:p-8 ${hardShadow}`}>
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-ink bg-track text-ink">
                                <InsightsRoundedIcon sx={{ fontSize: 26 }} />
                            </div>
                            <h3 className="mt-5 font-display text-xl font-bold">Real-time Analytics</h3>
                            <p className="mt-2 text-sm text-mute leading-relaxed text-pretty">
                                Measure total engagement, track device breakdowns (Mobile vs. Desktop), and spot your top-performing links at a glance.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Bottom Callout */}
                <div className="mt-16 sm:mt-24 rounded-3xl border-2 border-ink bg-pop p-8 sm:p-12 text-center shadow-[6px_6px_0_#0a0a0f] sm:shadow-[10px_10px_0_#0a0a0f]">
                    <h2 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight">
                        Ready to elevate your link sharing?
                    </h2>
                    <p className="mx-auto mt-3 max-w-lg text-sm sm:text-base text-ink/80 text-pretty">
                        Join LinkHub now and create your personalized link hub in under 60 seconds.
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate(user ? "/dashboard" : "/signup")}
                        className={`${btnDark} mt-6 px-8 py-3.5`}
                    >
                        {user ? "Go to your dashboard" : "Create free account"}
                    </button>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t-2 border-ink bg-white py-8 text-center text-xs font-semibold text-mute">
                <div className="mx-auto flex max-w-6xl flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-8">
                    <Logo />
                    <p>© {new Date().getFullYear()} LinkHub · Crafted for speed and clarity</p>
                    <div className="flex items-center gap-4 text-ink">
                        <Link to="/login" className="hover:underline">Log in</Link>
                        <Link to="/signup" className="hover:underline">Sign up</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
