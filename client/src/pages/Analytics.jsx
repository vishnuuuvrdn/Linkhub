import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Notice, Spinner, cardClass, display, linkClass } from "../components/ui";
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

function Stat({ label, value, lime = false }) {
    return (
        <div className={`${cardClass} min-w-0 p-5 ${lime ? "bg-pop" : ""}`}>
            <p className={`text-[13px] ${lime ? "text-ink" : "text-mute"}`}>{label}</p>
            <p className={`${display} mt-1 truncate text-[clamp(1.5rem,3vw,2.375rem)] leading-tight`}>{value}</p>
        </div>
    );
}

function Split({ distribution }) {
    const total = sumDevices(distribution);
    return (
        <div className="flex h-2 w-full overflow-hidden rounded-full bg-track">
            {DEVICES.map(([key]) => (
                <div key={key} className={FILL[key]} style={{ width: total ? `${((distribution?.[key] || 0) / total) * 100}%` : 0 }} />
            ))}
        </div>
    );
}

export default function Analytics() {
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [sort, setSort] = useState("clicks");

    useEffect(() => {
        linksApi.analytics().then(setData).catch((err) => setError(getErrorMessage(err)));
    }, []);

    if (error) return <Notice>{error}</Notice>;
    if (!data) return <div className="flex justify-center py-20"><Spinner /></div>;

    if (data.length === 0) {
        return (
            <div className={`${cardClass} px-6 py-16 text-center`}>
                <h1 className={`${display} text-2xl`}>No clicks yet</h1>
                <p className="mt-2 text-sm text-mute">Share a short link and your numbers will show up here.</p>
                <Link to="/dashboard" className={`${linkClass} mt-4 inline-block text-sm`}>Go to your links</Link>
            </div>
        );
    }

    const byClicks = [...data].sort((a, b) => b.totalClicks - a.totalClicks);
    const byRecent = [...data].sort((a, b) => new Date(b.lastClickTimeStamp) - new Date(a.lastClickTimeStamp));
    const rows = sort === "clicks" ? byClicks : byRecent;

    const totalClicks = data.reduce((s, a) => s + a.totalClicks, 0);
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
    const maxTop = Math.max(1, top[0].totalClicks);

    return (
        <div className="space-y-8">
            <div>
                <h1 className={`${display} text-[clamp(2rem,5vw,3.25rem)] leading-none`}>Analytics</h1>
                <p className="mt-2 text-mute">How your links are performing.</p>
            </div>

            <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
                <Stat label="Total clicks" value={totalClicks} lime />
                <Stat label="Links clicked" value={data.length} />
                <Stat label="Mobile share" value={`${m}%`} />
                <Stat label="Latest click" value={timeAgo(byRecent[0]?.lastClickTimeStamp)} />
            </div>

            <div className="grid gap-6 lg:grid-cols-[21rem_1fr]">
                <section className={`${cardClass} p-7 text-center`}>
                    <h2 className="text-left font-bold">Devices</h2>
                    <div className="mx-auto my-6 flex h-44 w-44 items-center justify-center rounded-full" style={{ background: donut }}>
                        <div className={`${display} flex h-28 w-28 items-center justify-center rounded-full bg-white text-2xl`}>{totalClicks}</div>
                    </div>
                    <div className="flex flex-wrap justify-center gap-2 text-[13px] font-semibold">
                        {DEVICES.map(([key, tone]) => (
                            <span key={key} className={`rounded-full px-3 py-1.5 ${tone}`}>{key} {pct(key)}%</span>
                        ))}
                    </div>
                </section>

                <section className={`${cardClass} p-7`}>
                    <h2 className="font-bold">Top links</h2>
                    <ul className="mt-5 space-y-5">
                        {top.map((a, i) => (
                            <li key={a.customSlung}>
                                <div className="flex items-baseline justify-between gap-3 font-semibold">
                                    <span className="truncate">/{a.customSlung}</span>
                                    <span>{a.totalClicks}</span>
                                </div>
                                <div className="mt-2 h-3.5 w-full rounded-full bg-track">
                                    <div style={{ width: `${(a.totalClicks / maxTop) * 100}%` }}
                                        className={`h-full rounded-full ${i === 0 ? "box-border border-2 border-ink bg-pop" : "bg-ink"}`} />
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>

            <section className={`${cardClass} overflow-hidden`}>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink px-6 py-5">
                    <h2 className={`${display} text-xl`}>All links</h2>
                    <div className="flex rounded-full border-2 border-ink p-0.5 text-[13px] font-semibold" role="group" aria-label="Sort links">
                        {[["clicks", "Most clicks"], ["recent", "Most recent"]].map(([key, label]) => (
                            <button key={key} type="button" onClick={() => setSort(key)} aria-pressed={sort === key}
                                className={`cursor-pointer rounded-full px-4 py-1.5 transition ${sort === key ? "bg-pop" : "text-mute hover:text-ink"}`}>
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
                <ul className="divide-y divide-line">
                    {rows.map((a) => (
                        <li key={a.customSlung} className="grid items-center gap-x-6 gap-y-2 px-6 py-4 sm:grid-cols-[1fr_9rem_9rem]">
                            <div className="min-w-0">
                                <p className="truncate font-bold">/{a.customSlung}</p>
                                <p className="text-xs text-mute">Last click {timeAgo(a.lastClickTimeStamp)}</p>
                            </div>
                            <Split distribution={a.deviceDistribution} />
                            <p className="text-sm sm:text-right">
                                <strong>{a.totalClicks}</strong>{" "}
                                <span className="text-mute">clicks · {totalClicks ? Math.round((a.totalClicks / totalClicks) * 100) : 0}%</span>
                            </p>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}
