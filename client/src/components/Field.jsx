import { useState } from "react";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";

const inputClass =
    "mt-1.5 block w-full min-h-[48px] rounded-2xl border-2 border-ink bg-white px-4 py-3 text-base text-ink sm:text-[15px] " +
    "placeholder:text-mute/60 transition-all duration-150 focus:outline-none focus:border-ink focus:shadow-[4px_4px_0_#c6f432] " +
    "disabled:cursor-not-allowed disabled:border-line disabled:bg-track disabled:text-mute";

function Field({ id, label, type = "text", placeholder, autoComplete, value, onChange, children, ...rest }) {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;
    const inputMode = type === "email" ? "email" : type === "url" ? "url" : rest.inputMode;

    return (
        <div className="w-full">
            <div className="flex items-center justify-between">
                <label htmlFor={id} className="text-[13px] font-bold tracking-tight text-ink">{label}</label>
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
                        aria-pressed={showPassword}
                        className="inline-flex min-h-[32px] min-w-[32px] items-center justify-center rounded-lg p-1 text-mute transition hover:bg-track hover:text-ink focus:outline-none focus-visible:outline-2 focus-visible:outline-ink"
                    >
                        {showPassword
                            ? <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} />
                            : <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />}
                    </button>
                )}
            </div>
            <input
                {...rest}
                id={id}
                name={id}
                type={inputType}
                inputMode={inputMode}
                placeholder={placeholder}
                autoComplete={autoComplete}
                value={value}
                onChange={onChange}
                className={inputClass}
            />
            {children}
        </div>
    );
}

export default Field;
