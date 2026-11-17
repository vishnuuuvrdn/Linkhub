import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Logo, btnOutline } from "./ui";

const NAV = [
    ["/dashboard", "Links"],
    ["/analytics", "Analytics"],
    ["/bio", "My bio"],
];

export default function AppLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/login", { replace: true });
    };

    return (
        <div className="min-h-dvh bg-white text-ink">
            <header className="border-b-2 border-ink">
                <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-3 px-5 py-4 sm:h-20 sm:flex-nowrap sm:py-0">
                    <Logo to="/dashboard" />

                    <nav className="order-3 flex w-full gap-1.5 overflow-x-auto sm:order-none sm:w-auto">
                        {NAV.map(([to, label]) => (
                            <NavLink key={to} to={to}
                                className={({ isActive }) =>
                                    `whitespace-nowrap rounded-full border-2 px-4 py-2 text-sm font-semibold transition ${
                                        isActive ? "border-ink bg-pop" : "border-transparent text-mute hover:text-ink"
                                    }`}>
                                {label}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="flex items-center gap-3">
                        <button type="button" onClick={handleLogout} className={btnOutline}>Log out</button>
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink font-bold uppercase text-pop" title={user?.email}>
                            {user?.name?.[0] || "U"}
                        </span>
                    </div>
                </div>
            </header>

            {user && !user.emailVerified && (
                <div className="border-b-2 border-ink bg-pop">
                    <p className="mx-auto max-w-6xl px-5 py-2.5 text-sm font-medium">
                        Your email isn't verified yet.{" "}
                        <Link to="/verify-email" className="font-bold underline underline-offset-2">Verify it now</Link>
                    </p>
                </div>
            )}

            <main className="mx-auto w-full max-w-[68.75rem] px-5 py-10 sm:px-8 sm:py-12">
                <Outlet />
            </main>
        </div>
    );
}
