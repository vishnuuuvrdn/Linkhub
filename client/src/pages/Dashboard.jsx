import { useCallback, useEffect, useState } from "react";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { useAuth } from "../context/AuthContext";
import { Notice, Spinner, btnOutline, cardClass, display, hardShadow, iconBtn } from "../components/ui";
import { linksApi } from "../api/services";
import { getErrorMessage } from "../api/api";
import { domainOf, greeting, timeAgo } from "../utils/format";

const LIMIT = 8;
const heroInput =
    "min-w-0 rounded-[14px] border-2 border-ink bg-white px-4 py-3.5 text-base text-ink placeholder:text-mute/60 focus:outline-none sm:text-[15px]";

function Stat({ label, value, lime = false }) {
    return (
        <div className={`${cardClass} min-w-0 p-5 ${lime ? "bg-pop" : ""}`}>
            <p className="text-[13px] text-mute">{label}</p>
            <p className={`${display} mt-1 truncate text-[clamp(1.5rem,3vw,2.25rem)] leading-tight`}>{value}</p>
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

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const [{ data }, analytics] = await Promise.all([
                linksApi.list(page, LIMIT),
                linksApi.analytics().catch(() => []),
            ]);
            setLinks(data.links);
            setPagination(data.pagination);
            setStats(analytics);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => { load(); }, [load]);

    const clicks = Object.fromEntries(stats.map((s) => [s.customSlung, s.totalClicks]));
    const totalClicks = stats.reduce((sum, s) => sum + s.totalClicks, 0);
    const topLink = [...stats].sort((a, b) => b.totalClicks - a.totalClicks)[0];
    const maxClicks = Math.max(1, ...stats.map((s) => s.totalClicks));

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
            if (page === 1) load(); else setPage(1);
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
            if (links.length === 1 && page > 1) setPage((p) => p - 1); else load();
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    const copy = async (text, key) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(key);
            setTimeout(() => setCopied(""), 1500);
        } catch {}
    };

    return (
        <div className="space-y-8">
            <section>
                <p className="text-[15px] text-mute">{greeting()}, {user?.name?.split(" ")[0]}</p>
                <h1 className={`${display} mt-1 text-[clamp(2rem,5vw,3.25rem)] leading-none`}>Make a link worth sharing.</h1>

                <form onSubmit={handleCreate}
                    className={`mt-7 flex flex-col gap-3 rounded-3xl border-2 border-ink bg-pop p-3.5 ${hardShadow} lg:flex-row`}>
                    <input name="originalUrl" type="url" required placeholder="Paste a long URL…"
                        value={form.originalUrl} onChange={handleChange} aria-label="Destination URL"
                        className={`${heroInput} flex-1`} />
                    <label className="flex items-center rounded-[14px] border-2 border-ink bg-white lg:w-72">
                        <span className="whitespace-nowrap pl-4 text-sm text-mute">{user?.handle ? `${user.handle}/` : ""}</span>
                        <input name="customSlung" placeholder="custom-slug" value={form.customSlung}
                            onChange={handleChange} pattern="[a-zA-Z0-9_\-]*" aria-label="Custom slug (optional)"
                            title="Letters, numbers, hyphens and underscores only"
                            className="min-w-0 flex-1 bg-transparent py-3.5 pl-1 pr-4 text-base text-ink placeholder:text-mute/60 focus:outline-none sm:text-[15px]" />
                    </label>
                    <button type="submit" disabled={creating}
                        className="cursor-pointer rounded-[14px] bg-ink px-8 py-3.5 text-[15px] font-bold text-white transition hover:bg-ink-soft focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-60">
                        {creating ? "Shortening…" : "Shorten"}
                    </button>
                </form>

                {(formError || created) && (
                    <div className="mt-4 space-y-3">
                        <Notice>{formError}</Notice>
                        {created && (
                            <div className="flex items-center justify-between gap-3 rounded-2xl border-2 border-ink bg-white px-4 py-3 text-sm">
                                <span className="min-w-0 truncate">Ready: <strong>{created}</strong></span>
                                <button type="button" onClick={() => copy(created, "created")} className={btnOutline}>
                                    {copied === "created" ? "Copied" : "Copy"}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </section>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <Stat label="Links" value={pagination?.totalLinks ?? "–"} />
                <Stat label="Total clicks" value={totalClicks} />
                <Stat label="Top link" value={topLink ? `/${topLink.customSlung}` : "–"} lime />
            </div>

            <section className={`${cardClass} overflow-hidden`}>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink px-6 py-5">
                    <h2 className={`${display} text-xl`}>Your links</h2>
                    <label className="flex w-full items-center gap-2 rounded-full border-2 border-ink bg-white px-4 py-1.5 text-mute sm:w-64">
                        <SearchRoundedIcon sx={{ fontSize: 18 }} />
                        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search this page"
                            aria-label="Search links"
                            className="w-full bg-transparent text-base text-ink placeholder:text-mute/60 focus:outline-none sm:text-sm" />
                    </label>
                </div>

                {error && <div className="p-4"><Notice>{error}</Notice></div>}

                {loading ? (
                    <div className="flex justify-center py-16"><Spinner /></div>
                ) : visible.length === 0 ? (
                    <p className="px-6 py-16 text-center text-sm text-mute">
                        {links.length === 0 ? "No links yet. Paste a URL above to create your first one." : "No links match your search."}
                    </p>
                ) : (
                    <ul className="divide-y divide-line">
                        {visible.map((l) => {
                            const count = clicks[l.customSlung] ?? 0;
                            const top = count > 0 && count === maxClicks;
                            return (
                                <li key={l.customSlung} className="flex items-center gap-3 px-4 py-4 sm:gap-4 sm:px-6">
                                    <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ink font-display text-lg font-bold uppercase text-pop sm:flex">
                                        {domainOf(l.originalUrl)[0]}
                                    </span>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1">
                                            <a href={l.shortUrl} target="_blank" rel="noreferrer"
                                                className="truncate font-bold hover:underline">
                                                {l.shortUrl.replace(/^https?:\/\//, "")}
                                            </a>
                                            <button type="button" className={iconBtn} aria-label="Copy short link"
                                                onClick={() => copy(l.shortUrl, l.customSlung)}>
                                                {copied === l.customSlung
                                                    ? <CheckRoundedIcon sx={{ fontSize: 16 }} />
                                                    : <ContentCopyRoundedIcon sx={{ fontSize: 16 }} />}
                                            </button>
                                        </div>
                                        <p className="truncate text-[13px] text-mute">{domainOf(l.originalUrl)} · {timeAgo(l.createdAt)}</p>
                                    </div>

                                    <div className="w-20 shrink-0 sm:w-36">
                                        <p className="text-lg font-bold leading-none">{count}</p>
                                        <div className="mt-2 h-2 w-full rounded-full bg-track">
                                            <div style={{ width: `${(count / maxClicks) * 100}%` }}
                                                className={`h-full rounded-full ${top ? "box-border border-[1.5px] border-ink bg-pop" : "bg-ink"}`} />
                                        </div>
                                    </div>

                                    <div className="flex shrink-0 items-center">
                                        <a href={l.shortUrl} target="_blank" rel="noreferrer" className={`${iconBtn} hidden sm:block`} aria-label="Open link">
                                            <OpenInNewRoundedIcon sx={{ fontSize: 18 }} />
                                        </a>
                                        <button type="button" className={`${iconBtn} hover:text-rose-600`}
                                            aria-label={`Delete ${l.customSlung}`} onClick={() => handleDelete(l.customSlung)}>
                                            <DeleteOutlineRoundedIcon sx={{ fontSize: 20 }} />
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}

                {pagination && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between border-t-2 border-ink px-6 py-4">
                        <button type="button" className={btnOutline} disabled={!pagination.hasPreviousPage}
                            onClick={() => setPage((p) => p - 1)}>Previous</button>
                        <span className="text-sm text-mute">Page {pagination.currentPage} of {pagination.totalPages}</span>
                        <button type="button" className={btnOutline} disabled={!pagination.hasNextPage}
                            onClick={() => setPage((p) => p + 1)}>Next</button>
                    </div>
                )}
            </section>
        </div>
    );
}
