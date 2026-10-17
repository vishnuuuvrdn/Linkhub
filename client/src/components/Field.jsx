import { useState } from 'react';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';


const inputClass =
    "w-full rounded-lg border border-stone-300 bg-white px-3.5 py-[clamp(0.4rem,1.1vh,0.625rem)] " +
    "text-base sm:text-sm text-stone-900 placeholder:text-stone-400 shadow-sm transition duration-200 " +
    "hover:border-stone-400 focus:border-green-900 focus:outline-none focus:ring-4 focus:ring-amber-400/30";

    
function Field({ id, label, type = "text", placeholder, autoComplete, value, onChange, children }) {
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    return (
        <div>
            <div className="mb-[clamp(0.15rem,0.6vh,0.375rem)] flex items-center justify-between">
                <label htmlFor={id} className="text-[13px] font-medium text-stone-800">
                    {label}
                </label>

                {isPassword && (
                    <span className="flex items-center">
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            aria-label={showPassword ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
                            aria-pressed={showPassword}
                            title={showPassword ? 'Hide password' : 'Show password'}
                            className="cursor-pointer rounded-md text-stone-500 transition duration-200 hover:text-green-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-400/40"
                        >
                            {showPassword
                                ? <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} />
                                : <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />}
                        </button>
                    </span>
                )}
            </div>

            <input
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