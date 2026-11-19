import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import BioCard from "../components/BioCard";
import { Notice, Spinner, btnDark } from "../components/ui";
import { bioApi } from "../api/services";
import { getErrorMessage } from "../api/api";

export default function PublicBio() {
    const { username } = useParams();
    const [bio, setBio] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        let active = true;
        bioApi.get(username)
            .then(({ data }) => {
                if (active) {
                    setBio(data);
                    setError("");
                    setLoading(false);
                }
            })
            .catch((err) => {
                if (active) {
                    setBio(null);
                    setError(err.response?.status === 404 ? "This bio page doesn't exist yet." : getErrorMessage(err));
                    setLoading(false);
                }
            });
        return () => { active = false; };
    }, [username]);

    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: bio?.displayName || username,
                    text: `Check out @${username}'s links on LinkHub`,
                    url,
                });
            } catch {
                // User cancelled
            }
        } else {
            try {
                await navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch {
                // Clipboard error
            }
        }
    };

    return (
        <div className="relative flex min-h-dvh flex-col items-center justify-center bg-pop p-4 sm:p-8 selection:bg-white selection:text-ink">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-dot-pattern opacity-50 pointer-events-none" />

            {/* Top Share Bar */}
            {bio && (
                <div className="relative z-10 mb-4 flex w-full max-w-sm justify-end">
                    <button
                        type="button"
                        onClick={handleShare}
                        className="inline-flex min-h-[42px] items-center gap-1.5 rounded-full border-2 border-ink bg-white px-4 py-1.5 text-xs font-bold text-ink shadow-[3px_3px_0_#0a0a0f] hover:bg-track active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all duration-150"
                        aria-label="Share this bio page"
                    >
                        {copied ? (
                            <>
                                <CheckRoundedIcon sx={{ fontSize: 16 }} className="text-emerald-600" />
                                <span>Link copied!</span>
                            </>
                        ) : (
                            <>
                                <ShareRoundedIcon sx={{ fontSize: 16 }} />
                                <span>Share profile</span>
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Main Bio Container */}
            <div className="relative z-10 w-full max-w-sm rounded-[36px] border-2 border-ink bg-ink p-7 sm:p-9 shadow-[10px_10px_0_#0a0a0f]">
                {loading && !error && (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <Spinner />
                        <p className="text-xs font-bold uppercase tracking-wider text-faint">Loading bio…</p>
                    </div>
                )}

                {error && (
                    <div className="space-y-5 text-center text-white py-6">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-pop">
                            <LinkRoundedIcon sx={{ fontSize: 30 }} />
                        </div>
                        <h2 className="font-display text-xl font-bold">Profile not found</h2>
                        <Notice>{error}</Notice>
                        <Link to="/" className={`${btnDark} inline-flex border-white bg-white text-ink hover:bg-pop hover:text-ink w-full`}>
                            Create your own bio page
                        </Link>
                    </div>
                )}

                {bio && (
                    <>
                        <BioCard
                            username={bio.username}
                            displayName={bio.displayName}
                            socialLinks={bio.socialLinks}
                            customLinks={bio.customLinks || []}
                        />

                        {/* LinkHub footer branding badge */}
                        <div className="mt-8 pt-6 border-t border-ink-soft text-center">
                            <Link
                                to="/"
                                className="group inline-flex items-center gap-1.5 rounded-full border border-ink-soft bg-ink-soft/40 px-3.5 py-1.5 text-xs font-semibold text-faint hover:text-white hover:border-white transition-all"
                            >
                                <span className="flex h-4 w-4 items-center justify-center rounded-sm bg-pop text-ink font-bold text-[10px]">L</span>
                                <span>Made with LinkHub</span>
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
