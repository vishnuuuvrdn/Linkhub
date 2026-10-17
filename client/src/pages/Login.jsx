import Field from "../components/Field";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
    };

    return (
        <div className="grid min-h-dvh w-full bg-stone-100 lg:grid-cols-2">
            <aside className="relative hidden min-h-0 overflow-hidden bg-green-950 bg-[url('/auth-bg.svg')] bg-cover bg-bottom-right bg-no-repeat p-[clamp(2rem,5vw,4.5rem)] text-stone-100 lg:flex lg:flex-col lg:justify-between">

                <span className="relative text-[clamp(1rem,1.4vw,1.25rem)] font-semibold tracking-tight">
                    LinkHub
                </span>

                <div className="relative max-w-[min(28rem,100%)]">
                    <p className="text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.08] tracking-tight">
                        One link. Endless possibilities.
                    </p>
                    <p className="mt-[clamp(0.75rem,2vh,1.25rem)] max-w-sm text-[clamp(0.9rem,1.1vw,1rem)] leading-7 text-stone-300">
                        Bring your content, socials, and favorite links together.
                    </p>
                </div>
            </aside>

            <main className="flex min-h-0 items-center justify-center p-[clamp(0.75rem,3vw,3.5rem)]">
                <form
                    onSubmit={handleSubmit}
                    className="w-full max-w-md rounded-2xl bg-stone-50 p-[clamp(1.25rem,4.5vh,2.5rem)] shadow-xl shadow-stone-900/10 ring-1 ring-stone-200 sm:px-[clamp(1.5rem,3vw,2.5rem)]"
                >
                    <h1 className="text-[clamp(1.25rem,3.4vh,1.5rem)] font-semibold tracking-tight text-stone-900">
                        Welcome back
                    </h1>
                    <p className="mt-1 text-sm text-stone-600">Log in to pick up where you left off.</p>

                    <div className="mt-[clamp(0.75rem,3vh,2rem)] flex flex-col gap-[clamp(0.5rem,2vh,1.25rem)]">
                        <Field
                            id="email"
                            label="Email"
                            type="email"
                            placeholder="example@gmail.com"
                            autoComplete="email"
                            value={formData.email}
                            onChange={handleChange}
                        />

                        <Field
                            id="password"
                            label="Password"
                            type="password"
                            placeholder="Your password"
                            autoComplete="current-password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>

                    <button
                        type="submit"
                        className="mt-[clamp(0.75rem,3vh,2rem)] w-full cursor-pointer rounded-lg bg-green-950 px-4 py-[clamp(0.55rem,1.6vh,0.8rem)] text-sm font-semibold text-stone-50 shadow-sm transition duration-200 hover:bg-green-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-400/50 active:scale-[0.99]"
                    >
                        Log in
                    </button>

                    <p className="mt-[clamp(0.75rem,2.4vh,1.5rem)] text-center text-sm text-stone-600">
                        New here?{" "}
                        <button
                            type="button"
                            onClick={() => navigate("/signup")}
                            className="cursor-pointer font-semibold text-green-900 underline decoration-amber-400 decoration-2 underline-offset-4 hover:text-green-950 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-400/50"
                        >
                            Create an account
                        </button>
                    </p>
                </form>
            </main>
        </div>
    );
}