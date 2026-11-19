import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { useAuth } from "../context/AuthContext";
import { Logo, btnOutline } from "./ui";

const NAV = [
    { to: "/dashboard", label: "Links", Icon: LinkRoundedIcon },
    { to: "/analytics", label: "Analytics", Icon: InsightsRoundedIcon },
    { to: "/bio", label: "My bio", Icon: PersonRoundedIcon },
];

export default function AppLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/login", { replace: true });
    };

    const initial = (user?.displayName?.[0] || user?.name?.[0] || user?.email?.[0] || "U").toUpperCase();

    return (
        <div className="min-h-dvh bg-white text-ink flex flex-col">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-40 border-b-2 border-ink bg-white/90 backdrop-blur-md">
                <div className="mx-auto flex h-16 sm:h-20 max-w-6xl items-center justify-between px-4 sm:px-8">
                    <Logo to="/dashboard" />

                    {/* Desktop Navigation */}
                    <nav className="hidden sm:flex items-center gap-2" aria-label="Main Navigation">
                        {NAV.map(({ to, label, Icon }) => (
                            <NavLink
                                key={to}
                                to={to}
                                className={({ isActive }) =>
                                    `flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-semibold transition-all duration-150 ${isActive
                                        ? "border-ink bg-pop shadow-[2px_2px_0_#0a0a0f] text-ink"
                                        : "border-transparent text-mute hover:text-ink hover:bg-track"
                                    }`
                                }
                            >
                                <Icon sx={{ fontSize: 18 }} />
                                <span>{label}</span>
                            </NavLink>
                        ))}
                    </nav>

                    {/* User profile & logout */}
                    <div className="flex items-center gap-2.5 sm:gap-3">
                        <div
                            className="hidden sm:flex items-center gap-2 rounded-full border-2 border-ink bg-track/50 py-1 pl-1 pr-3"
                            title={user?.email}
                        >
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink font-bold text-xs uppercase text-pop">
                                {initial}
                            </span>
                            <span className="max-w-[120px] truncate text-xs font-bold text-ink">
                                {user?.displayName || user?.name || user?.email?.split("@")[0]}
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className={`${btnOutline} flex items-center gap-1.5`}
                            aria-label="Log out of account"
                        >
                            <LogoutRoundedIcon sx={{ fontSize: 16 }} className="hidden sm:inline" />
                            <span>Log out</span>
                        </button>

                        <div className="sm:hidden flex h-9 w-9 items-center justify-center rounded-full bg-ink font-bold text-xs uppercase text-pop" title={user?.email}>
                            {initial}
                        </div>
                    </div>
                </div>
            </header>

            {/* Email verification reminder */}
            {user && !user.emailVerified && (
                <aside aria-label="Account status" className="border-b-2 border-ink bg-pop">
                    <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2 text-sm font-semibold">
                        <p className="truncate text-balance">
                            Your email isn't verified yet.
                        </p>
                        <Link
                            to="/verify-email"
                            className="shrink-0 rounded-full border-2 border-ink bg-white px-3 py-1 text-xs font-bold hover:bg-ink hover:text-white transition-colors"
                        >
                            Verify now
                        </Link>
                    </div>
                </aside>
            )}

            {/* Main view container with bottom padding on mobile for nav bar */}
            <main className="mx-auto w-full max-w-[68.75rem] flex-1 px-4 py-6 sm:px-8 sm:py-10 pb-28 sm:pb-12">
                <Outlet />
            </main>

            {/* Mobile Bottom Navigation Bar (Thumb Zone) */}
            <nav
                className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t-2 border-ink bg-white/95 px-2 py-2 backdrop-blur-lg sm:hidden shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
                aria-label="Mobile Navigation"
            >
                {NAV.map(({ to, label, Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            `flex min-h-[48px] min-w-[72px] flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl py-1 text-xs font-bold transition-all duration-150 ${isActive
                                ? "bg-pop text-ink border-2 border-ink shadow-[2px_2px_0_#0a0a0f]"
                                : "text-mute hover:text-ink active:scale-95"
                            }`
                        }
                    >
                        <Icon sx={{ fontSize: 20 }} />
                        <span>{label}</span>
                    </NavLink>
                ))}
            </nav>
        </div>
    );
}
