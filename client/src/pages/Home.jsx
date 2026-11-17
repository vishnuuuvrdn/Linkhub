import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Logo, btnDark, cardClass, hardShadow } from "../components/ui";

const bars = [35, 55, 45, 100, 70];

export default function Home() {
    const navigate = useNavigate();
    const { user } = useAuth();

    return (
        <div className="min-h-dvh overflow-hidden bg-white px-5 pb-20 text-center text-ink sm:px-10">
            <header className="mx-auto flex h-20 max-w-6xl items-center justify-between text-left">
                <Logo />
                <div className="flex items-center gap-5 text-[15px] font-semibold">
                    {user ? (
                        <Link to="/dashboard" className="rounded-full border-2 border-ink bg-pop px-5 py-2.5">Dashboard</Link>
                    ) : (
                        <>
                            <Link to="/login">Log in</Link>
                            <Link to="/signup" className="rounded-full border-2 border-ink bg-pop px-5 py-2.5">Sign up free</Link>
                        </>
                    )}
                </div>
            </header>

            <h1 className="mx-auto mt-10 max-w-4xl font-display text-[clamp(2.75rem,9vw,5.75rem)] font-bold leading-[.98] tracking-[-0.04em]">
                Your links,<br />one{" "}
                <span className="inline-block -rotate-2 rounded-[20px] bg-pop px-4">page.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-mute">
                Build a bio page, shorten anything and watch the clicks roll in.
            </p>
            <button type="button" onClick={() => navigate(user ? "/dashboard" : "/signup")} className={`${btnDark} mt-9 px-9`}>
                {user ? "Open your dashboard" : "Get started free"}
            </button>

            <div className="mt-16 flex flex-col items-center justify-center gap-8 md:flex-row md:items-start">
                <div className="w-64 rounded-[28px] bg-ink p-6 text-white md:rotate-[5deg]">
                    <div className="mx-auto h-13 w-13 rounded-full bg-pop" />
                    <p className="mt-2.5 font-display text-[17px] font-bold">Vishnu</p>
                    <p className="text-xs text-faint">@vishnuuu</p>
                    <div className="mt-4 rounded-xl bg-white p-3 text-[13px] font-semibold text-ink cursor-pointer" onClick={() => navigate(user ? "/dashboard" : "/signup")}>Portfolio</div>
                    <div className="mt-2 rounded-xl bg-pop p-3 text-[13px] font-semibold text-ink cursor-pointer" onClick={() => navigate(user ? "/dashboard" : "/signup")} >Latest video</div>
                    <div className="mt-2 rounded-xl border-[1.5px] border-ink-soft p-2.5 text-[13px] font-semibold cursor-pointer" onClick={() => navigate(user ? "/dashboard" : "/signup")} >GitHub</div>
                </div>

                <div className={`w-72 p-6 text-left md:mt-9 ${cardClass} ${hardShadow} bg-pop`}>
                    <p className="text-xs font-bold tracking-wider">SHORT LINK</p>
                    <p className="mt-2 font-display text-xl font-bold leading-snug">linkhub.vishnuuuvrdn.me/a1b2c3<br />portfolio</p>
                    <span className="mt-5 inline-block rounded-full bg-ink px-4 py-2.5 text-[13px] font-semibold text-white cursor-pointer" onClick={() => navigate(user ? "/dashboard" : "/signup")} >Copy link</span>
                </div>

                <div className={`w-64 p-6 text-left md:mt-1.5 md:rotate-[5deg] ${cardClass} rounded-[28px]`}>
                    <p className="text-xs font-bold tracking-wider text-mute">THIS WEEK</p>
                    <p className="font-display text-[2.75rem] font-bold leading-tight">1,204</p>
                    <div className="mt-4 flex h-28 items-end gap-2" aria-hidden="true">
                        {bars.map((h, i) => (
                            <div key={i} style={{ height: `${h}%` }}
                                className={`flex-1 rounded-md ${h === 100 ? "border-[1.5px] border-ink bg-pop" : "bg-ink"}`} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
