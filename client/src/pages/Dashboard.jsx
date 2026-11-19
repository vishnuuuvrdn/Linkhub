import { useCallback, useEffect, useState } from "react";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import { useAuth } from "../context/AuthContext";
import { Notice, Spinner, btnOutline, cardClass, display, hardShadow, iconBtn } from "../components/ui";
import { linksApi } from "../api/services";
import { getErrorMessage } from "../api/api";
import { domainOf, greeting, timeAgo } from "../utils/format";

const LIMIT = 8;
const heroInput =
    "min-w-0 rounded-[14px] border-2 border-ink bg-white px-4 py-3.5 text-base text-ink placeholder:text-mute/60 focus:outline-none focus:ring-2 focus:ring-ink sm:text-[15px] min-h-[48px]";

function Stat({ label, value, icon: Icon, lime = false }) {
    return (
        <div className={`${cardClass} min-w-0 p-5 ${lime ? "bg-pop shadow-[4px_4px_0_#0a0a0f]" : "shadow-[4px_4px_0_#0a0a0f]"}`}>
            <div className="flex items-center justify-between">
                <p className="text-[13px] font-bold text-mute uppercase tracking-wider">{label}</p>
                {Icon && (
                    <span className={`flex h-7 w-7 items-center justify-center rounded-lg border border-ink ${lime ? "bg-white text-ink" : "bg-pop text-ink"}`}>
                        <Icon sx={{ fontSize: 16 }} />
                    </span>
                )}
            </div>
            <p className={`${display} mt-2 truncate text-[clamp(1.5rem,3vw,2.25rem)] leading-tight`}>{value}</p>
        </div>
    );
}

export default function Dashboard() {
    const { user } = useAuth();
    const [form, setForm] = useState({ originalUrl: "", customSlung: "" });
    const [creating, setCreating] = useState(false);
    const [formError, setFormError] = useState("");
    const [created, setCreated] = useState("");

    const [links, setLinks] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [stats, setStats] = useState([]);
    const [page, setPage] = useState(1);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState("");
    const [reloadKey, setReloadKey] = useState(0);

    const refresh = useCallback(() => {
        setReloadKey((k) => k + 1);
    }, []);

    useEffect(() => {
        let active = true;
        Promise.all([
            linksApi.list(page, LIMIT),
            linksApi.analytics().catch(() => []),
        ])
            .then(([{ data }, analytics]) => {
                if (!active) return;
                setLinks(data?.links || []);
                setPagination(data?.pagination || null);
                setStats(Array.isArray(analytics) ? analytics : []);
            })
            .catch((err) => {
                if (!active) return;
                setError(getErrorMessage(err));
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => { active = false; };
    }, [page, reloadKey]);

    const clicks = Object.fromEntries(stats.map((s) => [s.customSlung, s.totalClicks]));
    const totalClicks = stats.reduce((sum, s) => sum + (s.totalClicks || 0), 0);
    const topLink = [...stats].sort((a, b) => (b.totalClicks || 0) - (a.totalClicks || 0))[0];
    const maxClicks = Math.max(1, ...stats.map((s) => s.totalClicks || 0));

    const visible = links.filter((l) =>
        `${l.customSlung} ${l.originalUrl}`.toLowerCase().includes(query.trim().toLowerCase())
    );

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setFormError("");
        setCreated("");
        setCreating(true);
        try {
            const payload = { originalUrl: form.originalUrl.trim() };
            if (form.customSlung.trim()) payload.customSlung = form.customSlung.trim();
            const { data } = await linksApi.create(payload);
            setCreated(data.shortUrl);
            setForm({ originalUrl: "", customSlung: "" });
            if (page === 1) refresh(); else setPage(1);
        } catch (err) {
            setFormError(getErrorMessage(err));
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (slug) => {
        if (!window.confirm(`Delete the link "${slug}"? This can't be undone.`)) return;
        try {
            await linksApi.remove(slug);
            if (links.length === 1 && page > 1) setPage((p) => p - 1); else refresh();
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    const copy = async (text, key) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(key);
            setTimeout(() => setCopied(""), 1800);
        } catch {
            // Ignore clipboard errors
        }
    };

    return (
        <div className="space-y-8">
            {/* Header Greeting & Shortener Box */}
            <section>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm font-semibold text-mute">
                        {greeting()}, <span className="text-ink">{user?.displayName?.split(" ")[0] || user?.name?.split(" ")[0] || "Friend"}</span>
                    </p>
                    <span className="text-xs font-semibold text-mute">
                        Handle: <strong className="text-ink">@{user?.handle || user?.username || "user"}</strong>
                    </span>
                </div>
                <h1 className={`${display} mt-1 text-[clamp(2rem,5vw,3.25rem)] leading-none text-balance`}>
                    Make a link worth sharing.
                </h1>

                {/* Shortener Form */}
                <form
                    onSubmit={handleCreate}
                    className={`mt-6 flex flex-col gap-3 rounded-3xl border-2 border-ink bg-pop p-3.5 sm:p-4 ${hardShadow} lg:flex-row`}
                >
                    <input
                        name="originalUrl"
                        type="url"
                        inputMode="url"
                        enterKeyHint="go"
                        autoComplete="url"
                        required
                        placeholder="Paste long URL (e.g. https://github.com/...)"
                        value={form.originalUrl}
                        onChange={handleChange}
                        aria-label="Destination URL"
                        className={`${heroInput} flex-1`}
                    />
                    <label className="flex min-h-[48px] items-center rounded-[14px] border-2 border-ink bg-white lg:w-80">
                        <span className="whitespace-nowrap pl-4 text-xs sm:text-sm font-semibold text-mute select-none">
                            {(user?.handle || user?.username) ? `${user.handle || user.username}/` : ""}
                        </span>
                        <input
                            name="customSlung"
                            placeholder="custom-slug (optional)"
                            value={form.customSlung}
                            onChange={handleChange}
                            inputMode="text"
                            enterKeyHint="done"
                            pattern="[a-zA-Z0-9_\-]*"
                            aria-label="Custom slug (optional)"
                            title="Letters, numbers, hyphens and underscores only"
                            className="min-w-0 flex-1 bg-transparent py-3.5 pl-1 pr-4 text-base text-ink placeholder:text-mute/60 focus:outline-none sm:text-[15px]"
                        />
                    </label>
                    <button
                        type="submit"
                        disabled={creating}
                        className="cursor-pointer min-h-[48px] rounded-[14px] bg-ink px-8 py-3.5 text-[15px] font-bold text-white shadow-[3px_3px_0_#0a0a0f] transition hover:bg-ink-soft active:translate-x-[2px] active:translate-y-[2px] active:shadow-none focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {creating ? "Shortening…" : "Shorten link"}
                    </button>
                </form>

                {/* Feedback notices */}
                {(formError || created) && (
                    <div className="mt-4 space-y-3">
                        {formError && <Notice>{formError}</Notice>}
                        {created && (
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border-2 border-ink bg-white p-4 shadow-[4px_4px_0_#c6f432]">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-pop font-bold text-ink border border-ink">
                                        <CheckRoundedIcon sx={{ fontSize: 18 }} />
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-mute uppercase tracking-wider">Ready to share</p>
                                        <p className="truncate font-display font-bold text-base sm:text-lg">{created}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <button
                                        type="button"
                                        onClick={() => copy(created, "created")}
                                        className={`${btnOutline} flex-1 sm:flex-initial min-h-[40px] gap-1 bg-pop`}
                                    >
                                        {copied === "created" ? (
                                            <>
                                                <CheckRoundedIcon sx={{ fontSize: 16 }} />
                                                <span>Copied!</span>
                                            </>
                                        ) : (
                                            <>
                                                <ContentCopyRoundedIcon sx={{ fontSize: 16 }} />
                                                <span>Copy</span>
                                            </>
                                        )}
                                    </button>
                                    <a
                                        href={created}
                                        target="_blank"
                                        rel="noreferrer"
                                        className={`${btnOutline} flex-1 sm:flex-initial min-h-[40px] gap-1`}
                                    >
                                        <span>Visit</span>
                                        <OpenInNewRoundedIcon sx={{ fontSize: 16 }} />
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Stat label="Total Links" value={pagination?.totalLinks ?? "–"} icon={LinkRoundedIcon} />
                <Stat label="Total Clicks" value={totalClicks} icon={TrendingUpRoundedIcon} />
                <Stat label="Top Performing" value={topLink ? `/${topLink.customSlung}` : "–"} icon={StarRoundedIcon} lime />
            </div>

            {/* Links List Section */}
            <section className={`${cardClass} overflow-hidden ${hardShadow}`}>
                {/* Section Header & Search */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink px-4 py-4 sm:px-6 sm:py-5 bg-white">
                    <div className="flex items-center gap-3">
                        <h2 className={`${display} text-xl sm:text-2xl`}>Your links</h2>
                        <span className="rounded-full border border-ink bg-pop px-2.5 py-0.5 text-xs font-bold text-ink">
                            {visible.length} {visible.length === 1 ? "link" : "links"}
                        </span>
                    </div>

                    <label className="relative flex w-full items-center rounded-full border-2 border-ink bg-white px-3.5 py-1.5 text-mute sm:w-72">
                        <SearchRoundedIcon sx={{ fontSize: 18 }} className="shrink-0" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Filter by slug or URL…"
                            inputMode="search"
                            enterKeyHint="search"
                            aria-label="Search links"
                            className="w-full bg-transparent pl-2 pr-6 text-sm text-ink placeholder:text-mute/60 focus:outline-none"
                        />
                        {query && (
                            <button
                                type="button"
                                onClick={() => setQuery("")}
                                aria-label="Clear search query"
                                className="absolute right-2 text-mute hover:text-ink"
                            >
                                <ClearRoundedIcon sx={{ fontSize: 16 }} />
                            </button>
                        )}
                    </label>
                </div>

                {error && <div className="p-4"><Notice>{error}</Notice></div>}

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Spinner />
                        <p className="text-xs font-bold uppercase tracking-wider text-mute">Loading links…</p>
                    </div>
                ) : visible.length === 0 ? (
                    <div className="px-6 py-16 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-ink bg-pop text-ink">
                            <LinkRoundedIcon sx={{ fontSize: 30 }} />
                        </div>
                        <h3 className="mt-4 font-display text-lg font-bold">
                            {links.length === 0 ? "No shortened links yet" : "No links found"}
                        </h3>
                        <p className="mt-1 text-sm text-mute">
                            {links.length === 0
                                ? "Paste your first URL into the shortener above to get started."
                                : "Try clearing your search query to see all links."}
                        </p>
                    </div>
                ) : (
                    <ul className="divide-y-2 divide-line">
                        {visible.map((l) => {
                            const count = clicks[l.customSlung] ?? 0;
                            const top = count > 0 && count === maxClicks;
                            return (
                                <li key={l.customSlung} className="p-4 sm:px-6 sm:py-4 transition-colors hover:bg-track/30">
                                    {/* Desktop View */}
                                    <div className="hidden sm:flex items-center gap-4">
                                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-ink bg-ink font-display text-lg font-bold uppercase text-pop">
                                            {domainOf(l.originalUrl)[0]}
                                        </span>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-1.5">
                                                <a
                                                    href={l.shortUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="truncate font-bold text-ink hover:underline"
                                                >
                                                    {l.shortUrl.replace(/^https?:\/\//, "")}
                                                </a>
                                                <button
                                                    type="button"
                                                    className={iconBtn}
                                                    aria-label="Copy short link"
                                                    onClick={() => copy(l.shortUrl, l.customSlung)}
                                                >
                                                    {copied === l.customSlung ? (
                                                        <CheckRoundedIcon sx={{ fontSize: 16 }} className="text-emerald-600" />
                                                    ) : (
                                                        <ContentCopyRoundedIcon sx={{ fontSize: 16 }} />
                                                    )}
                                                </button>
                                            </div>
                                            <p className="truncate text-xs text-mute">
                                                <span className="font-semibold text-ink/70">{domainOf(l.originalUrl)}</span> · {timeAgo(l.createdAt)}
                                            </p>
                                        </div>

                                        <div className="w-36 shrink-0">
                                            <div className="flex items-baseline justify-between text-xs font-bold">
                                                <span>{count} {count === 1 ? "click" : "clicks"}</span>
                                                {top && <span className="text-[10px] uppercase tracking-wider text-ink font-extrabold bg-pop px-1 rounded">Top</span>}
                                            </div>
                                            <div className="mt-1.5 h-2 w-full rounded-full bg-track overflow-hidden">
                                                <div
                                                    style={{ width: `${(count / maxClicks) * 100}%` }}
                                                    className={`h-full rounded-full transition-all duration-300 ${top ? "bg-pop border border-ink" : "bg-ink"}`}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex shrink-0 items-center gap-1">
                                            <a
                                                href={l.shortUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className={iconBtn}
                                                aria-label="Open link in new tab"
                                            >
                                                <OpenInNewRoundedIcon sx={{ fontSize: 18 }} />
                                            </a>
                                            <button
                                                type="button"
                                                className={`${iconBtn} hover:text-rose-600 hover:bg-rose-50`}
                                                aria-label={`Delete ${l.customSlung}`}
                                                onClick={() => handleDelete(l.customSlung)}
                                            >
                                                <DeleteOutlineRoundedIcon sx={{ fontSize: 20 }} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Mobile Responsive Card View (Ergonomic layout) */}
                                    <div className="sm:hidden flex flex-col gap-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0 flex-1">
                                                <a
                                                    href={l.shortUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="block truncate font-bold text-ink hover:underline text-base"
                                                >
                                                    {l.shortUrl.replace(/^https?:\/\//, "")}
                                                </a>
                                                <p className="truncate text-xs text-mute mt-0.5">
                                                    {domainOf(l.originalUrl)} · {timeAgo(l.createdAt)}
                                                </p>
                                            </div>
                                            <span className="shrink-0 rounded-full border border-ink bg-pop px-2 py-0.5 text-xs font-extrabold text-ink">
                                                {count} {count === 1 ? "click" : "clicks"}
                                            </span>
                                        </div>

                                        <div className="h-1.5 w-full rounded-full bg-track overflow-hidden">
                                            <div
                                                style={{ width: `${(count / maxClicks) * 100}%` }}
                                                className={`h-full rounded-full ${top ? "bg-pop border border-ink" : "bg-ink"}`}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between pt-1">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => copy(l.shortUrl, l.customSlung)}
                                                    className="inline-flex min-h-[44px] items-center gap-1 rounded-xl border border-ink bg-track px-3 py-1.5 text-xs font-bold text-ink active:scale-95 transition-all"
                                                >
                                                    {copied === l.customSlung ? (
                                                        <>
                                                            <CheckRoundedIcon sx={{ fontSize: 16 }} className="text-emerald-600" />
                                                            <span>Copied</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ContentCopyRoundedIcon sx={{ fontSize: 16 }} />
                                                            <span>Copy</span>
                                                        </>
                                                    )}
                                                </button>
                                                <a
                                                    href={l.shortUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex min-h-[44px] items-center gap-1 rounded-xl border border-ink bg-white px-3 py-1.5 text-xs font-bold text-ink active:scale-95 transition-all"
                                                >
                                                    <OpenInNewRoundedIcon sx={{ fontSize: 16 }} />
                                                    <span>Open</span>
                                                </a>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handleDelete(l.customSlung)}
                                                aria-label={`Delete ${l.customSlung}`}
                                                className="inline-flex min-h-[44px] items-center gap-1 rounded-xl border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 active:scale-95 transition-all"
                                            >
                                                <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
                                                <span>Delete</span>
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}

                {/* Pagination Controls */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between border-t-2 border-ink px-4 py-4 sm:px-6 bg-white">
                        <button
                            type="button"
                            className={`${btnOutline} min-h-[44px] px-4`}
                            disabled={!pagination.hasPreviousPage}
                            onClick={() => setPage((p) => p - 1)}
                        >
                            Previous
                        </button>
                        <span className="text-xs sm:text-sm font-semibold text-mute">
                            Page <strong className="text-ink">{pagination.currentPage}</strong> of {pagination.totalPages}
                        </span>
                        <button
                            type="button"
                            className={`${btnOutline} min-h-[44px] px-4`}
                            disabled={!pagination.hasNextPage}
                            onClick={() => setPage((p) => p + 1)}
                        >
                            Next
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
}
