import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import PhoneIphoneRoundedIcon from "@mui/icons-material/PhoneIphoneRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import DevicesRoundedIcon from "@mui/icons-material/DevicesRounded";
import { Notice, Spinner, cardClass, display, hardShadow, linkClass } from "../components/ui";
import { linksApi } from "../api/services";
import { getErrorMessage } from "../api/api";
import { timeAgo } from "../utils/format";

const DEVICES = [
    ["Desktop", "bg-ink text-white"],
    ["Mobile", "bg-pop text-ink"],
    ["Other", "bg-mist text-ink"],
];
const FILL = { Desktop: "bg-ink", Mobile: "bg-pop", Other: "bg-mist" };

const sumDevices = (d = {}) => DEVICES.reduce((s, [k]) => s + (d[k] || 0), 0);

function Stat({ label, value, icon: Icon, lime = false }) {
    return (
        <div className={`${cardClass} min-w-0 p-5 ${lime ? "bg-pop shadow-[4px_4px_0_#0a0a0f]" : "shadow-[4px_4px_0_#0a0a0f]"}`}>
            <div className="flex items-center justify-between">
                <p className={`text-[13px] font-bold uppercase tracking-wider ${lime ? "text-ink" : "text-mute"}`}>{label}</p>
                {Icon && (
                    <span className={`flex h-7 w-7 items-center justify-center rounded-lg border border-ink ${lime ? "bg-white text-ink" : "bg-pop text-ink"}`}>
                        <Icon sx={{ fontSize: 16 }} />
                    </span>
                )}
            </div>
            <p className={`${display} mt-2 truncate text-[clamp(1.5rem,3vw,2.375rem)] leading-tight`}>{value}</p>
        </div>
    );
}

function Split({ distribution }) {
    const total = sumDevices(distribution);
    return (
        <div className="flex h-2.5 w-full overflow-hidden rounded-full border border-ink/20 bg-track">
            {DEVICES.map(([key]) => {
                const count = distribution?.[key] || 0;
                const width = total ? (count / total) * 100 : 0;
                return (
                    <div
                        key={key}
                        className={`${FILL[key]} transition-all duration-300`}
                        style={{ width: `${width}%` }}
                        title={`${key}: ${count} (${Math.round(width)}%)`}
                    />
                );
            })}
        </div>
    );
}

export default function Analytics() {
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [sort, setSort] = useState("clicks");

    useEffect(() => {
        let active = true;
        linksApi.analytics()
            .then((res) => {
                if (active) setData(Array.isArray(res) ? res : []);
            })
            .catch((err) => {
                if (active) setError(getErrorMessage(err));
            });
        return () => { active = false; };
    }, []);

    if (error) return <Notice>{error}</Notice>;
    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
                <Spinner />
                <p className="text-xs font-bold uppercase tracking-wider text-mute">Loading metrics…</p>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className={`${cardClass} ${hardShadow} px-6 py-16 text-center max-w-lg mx-auto mt-6`}>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-ink bg-pop text-ink">
                    <TrendingUpRoundedIcon sx={{ fontSize: 32 }} />
                </div>
                <h1 className={`${display} mt-5 text-2xl`}>No analytics data yet</h1>
                <p className="mt-2 text-sm text-mute text-pretty">
                    Create and share a short link from your dashboard to start tracking clicks, devices, and engagement.
                </p>
                <Link to="/dashboard" className={`${linkClass} mt-6 inline-block text-sm`}>
                    Go to your links dashboard
                </Link>
            </div>
        );
    }

    const byClicks = [...data].sort((a, b) => b.totalClicks - a.totalClicks);
    const byRecent = [...data].sort((a, b) => new Date(b.lastClickTimeStamp) - new Date(a.lastClickTimeStamp));
    const rows = sort === "clicks" ? byClicks : byRecent;

    const totalClicks = data.reduce((s, a) => s + (a.totalClicks || 0), 0);
    const totals = DEVICES.reduce((acc, [k]) => {
        acc[k] = data.reduce((s, a) => s + (a.deviceDistribution?.[k] || 0), 0);
        return acc;
    }, {});
    const deviceTotal = sumDevices(totals);
    const pct = (k) => (deviceTotal ? Math.round((totals[k] / deviceTotal) * 100) : 0);
    const d = pct("Desktop");
    const m = pct("Mobile");
    const donut = deviceTotal
        ? `conic-gradient(#0a0a0f 0 ${d}%, #c6f432 ${d}% ${d + m}%, #dcdce2 ${d + m}% 100%)`
        : "#eeeef1";
    const top = byClicks.slice(0, 5);
    const maxTop = Math.max(1, top[0]?.totalClicks || 0);

    return (
        <div className="space-y-8">
            <div>
                <h1 className={`${display} text-[clamp(2rem,5vw,3.25rem)] leading-none text-balance`}>
                    Performance & Analytics
                </h1>
                <p className="mt-2 text-sm sm:text-base text-mute">
                    Real-time click engagement and device breakdown across all your links.
                </p>
            </div>

            {/* Metric Overview Cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Stat label="Total Clicks" value={totalClicks} icon={TrendingUpRoundedIcon} lime />
                <Stat label="Active Links" value={data.length} icon={LinkRoundedIcon} />
                <Stat label="Mobile Traffic" value={`${m}%`} icon={PhoneIphoneRoundedIcon} />
                <Stat label="Latest Click" value={timeAgo(byRecent[0]?.lastClickTimeStamp)} icon={AccessTimeRoundedIcon} />
            </div>

            {/* Split Breakdown: Devices & Top Performing Links */}
            <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
                {/* Devices Card */}
                <section className={`${cardClass} ${hardShadow} p-6 sm:p-7 text-center`}>
                    <div className="flex items-center justify-between">
                        <h2 className="font-display text-lg font-bold">Devices breakdown</h2>
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-ink bg-track text-ink">
                            <DevicesRoundedIcon sx={{ fontSize: 16 }} />
                        </span>
                    </div>

                    <div
                        className="mx-auto my-6 flex h-44 w-44 items-center justify-center rounded-full border-2 border-ink shadow-[4px_4px_0_#0a0a0f]"
                        style={{ background: donut }}
                    >
                        <div className={`${display} flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white border-2 border-ink shadow-inner text-2xl`}>
                            <span>{totalClicks}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-mute">Clicks</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-2 text-xs font-bold">
                        {DEVICES.map(([key, tone]) => (
                            <span
                                key={key}
                                className={`rounded-full border border-ink px-3 py-1.5 shadow-[1px_1px_0_#0a0a0f] ${tone}`}
                            >
                                {key}: <strong>{totals[key] || 0}</strong> ({pct(key)}%)
                            </span>
                        ))}
                    </div>
                </section>

                {/* Top 5 Links Card */}
                <section className={`${cardClass} ${hardShadow} p-6 sm:p-7`}>
                    <div className="flex items-center justify-between">
                        <h2 className="font-display text-lg font-bold">Top performing links</h2>
                        <span className="text-xs font-bold text-mute uppercase tracking-wider">By clicks</span>
                    </div>

                    <ul className="mt-5 space-y-4">
                        {top.map((a, i) => (
                            <li key={a.customSlung} className="rounded-xl border border-line p-3 bg-track/20">
                                <div className="flex items-baseline justify-between gap-3 text-sm font-bold">
                                    <span className="truncate font-display text-base">/{a.customSlung}</span>
                                    <span className="shrink-0 rounded-full border border-ink bg-pop px-2.5 py-0.5 text-xs font-extrabold text-ink">
                                        {a.totalClicks} {a.totalClicks === 1 ? "click" : "clicks"}
                                    </span>
                                </div>
                                <div className="mt-2.5 h-3 w-full rounded-full bg-track border border-ink/20 overflow-hidden">
                                    <div
                                        style={{ width: `${(a.totalClicks / maxTop) * 100}%` }}
                                        className={`h-full rounded-full transition-all duration-300 ${
                                            i === 0 ? "border-r border-ink bg-pop" : "bg-ink"
                                        }`}
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>

            {/* All Links Table / List */}
            <section className={`${cardClass} ${hardShadow} overflow-hidden`}>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink px-4 py-4 sm:px-6 sm:py-5 bg-white">
                    <h2 className={`${display} text-xl sm:text-2xl`}>All links activity</h2>
                    <div
                        className="flex rounded-full border-2 border-ink p-0.5 text-xs sm:text-sm font-bold"
                        role="group"
                        aria-label="Sort links"
                    >
                        {[
                            ["clicks", "Most clicks"],
                            ["recent", "Most recent"],
                        ].map(([key, label]) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setSort(key)}
                                aria-pressed={sort === key}
                                className={`cursor-pointer rounded-full px-3.5 py-1.5 transition-all duration-150 ${
                                    sort === key
                                        ? "bg-pop text-ink border border-ink shadow-[1px_1px_0_#0a0a0f]"
                                        : "text-mute hover:text-ink"
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                <ul className="divide-y-2 divide-line">
                    {rows.map((a) => (
                        <li
                            key={a.customSlung}
                            className="flex flex-col gap-3 p-4 sm:grid sm:grid-cols-[1fr_10rem_8rem] sm:items-center sm:gap-6 sm:px-6 sm:py-4 hover:bg-track/30 transition-colors"
                        >
                            <div className="min-w-0">
                                <p className="truncate font-bold font-display text-base">/{a.customSlung}</p>
                                <p className="text-xs text-mute mt-0.5">Last active: {timeAgo(a.lastClickTimeStamp)}</p>
                            </div>

                            <div className="w-full">
                                <div className="text-[11px] font-semibold text-mute flex justify-between mb-1 sm:hidden">
                                    <span>Device split</span>
                                    <span>D: {a.deviceDistribution?.Desktop || 0} · M: {a.deviceDistribution?.Mobile || 0}</span>
                                </div>
                                <Split distribution={a.deviceDistribution} />
                            </div>

                            <p className="text-sm font-bold sm:text-right">
                                <span className="font-display text-base">{a.totalClicks}</span>{" "}
                                <span className="text-xs text-mute font-medium">
                                    ({totalClicks ? Math.round((a.totalClicks / totalClicks) * 100) : 0}%)
                                </span>
                            </p>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}
