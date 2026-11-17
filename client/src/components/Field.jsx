import { useState } from "react";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";

const inputClass =
    "mt-1.5 block w-full rounded-[14px] border-2 border-ink bg-white px-4 py-3 text-base text-ink sm:text-[15px] " +
    "placeholder:text-mute/60 transition focus:outline-none focus:shadow-[4px_4px_0_#c6f432] " +
    "disabled:cursor-not-allowed disabled:border-line disabled:bg-track disabled:text-mute";

function Field({ id, label, type = "text", placeholder, autoComplete, value, onChange, children, ...rest }) {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;

    return (
        <div>
            <div className="flex items-center justify-between">
                <label htmlFor={id} className="text-[13px] font-semibold text-ink">{label}</label>
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
                        aria-pressed={showPassword}
                        className="cursor-pointer rounded-md text-mute transition hover:text-ink focus:outline-none focus-visible:outline-2 focus-visible:outline-ink"
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
