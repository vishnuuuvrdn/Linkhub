import { useNavigate } from "react-router-dom";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";

export default function Home() {
    const navigate = useNavigate();

    return (
        <div className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden bg-green-950 bg-[url('/auth-bg.svg')] bg-cover bg-bottom-right bg-no-repeat p-[clamp(1rem,4vw,3rem)] text-stone-100">
            <main className="relative w-full max-w-xl">
                <div className="flex items-center gap-3">
                    <span className="flex h-[clamp(2.25rem,5vh,3rem)] w-[clamp(2.25rem,5vh,3rem)] items-center justify-center rounded-xl bg-amber-400 text-green-950">
                        <LinkRoundedIcon className="-rotate-45" />
                    </span>
                    <span className="text-[clamp(1.125rem,2.6vh,1.375rem)] font-semibold tracking-tight">
                        LinkHub
                    </span>
                </div>

                <h1 className="mt-[clamp(1.25rem,6vh,3.5rem)] text-[clamp(1.75rem,min(4vw,6vh),3rem)] font-semibold leading-[1.08] tracking-tight">
                    One link. Endless possibilities.
                </h1>
                <p className="mt-[clamp(0.5rem,2vh,1.25rem)] max-w-md text-[clamp(0.9rem,2.2vh,1.0625rem)] leading-7 text-stone-300">
                    Shorten links, build your personal page, and discover what gets clicked.
                    Everything you share, connected in one place.
                </p>

                <div className="mt-[clamp(1.25rem,4vh,2rem)] rounded-2xl bg-stone-50 p-[clamp(1rem,3vh,1.5rem)] text-stone-900 shadow-xl shadow-black/20">
                    <h2 className="text-[clamp(1.125rem,2.8vh,1.375rem)] font-semibold tracking-tight">
                        Create your account
                    </h2>
                    <p className="mt-1 text-sm text-stone-600">
                        Start building your online presence today.
                    </p>

                    <button
                        type="button"
                        onClick={() => navigate("/signup")}
                        className="mt-[clamp(0.75rem,2.5vh,1.25rem)] w-full cursor-pointer rounded-lg bg-green-950 px-4 py-[clamp(0.55rem,1.6vh,0.8rem)] text-sm font-semibold text-stone-50 shadow-sm transition duration-200 hover:bg-green-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-400/50 active:scale-[0.99]"
                    >
                        Get started for free &rarr;
                    </button>
                </div>

                <p className="mt-[clamp(0.75rem,2.4vh,1.25rem)] text-center text-sm text-stone-400">
                    One account. All your links.
                </p>
            </main>
        </div>
    );
}