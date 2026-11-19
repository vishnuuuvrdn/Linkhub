import { getIcon, hostOf, SOCIALS, toHref } from "../utils/bioIcons";

const rowBase = "block rounded-2xl px-4 py-3.5 text-center text-sm font-semibold transition";
const rowStyle = (i) =>
    i === 0 ? "bg-white text-ink" : i === 1 ? "bg-pop text-ink" : "border-[1.5px] border-ink-soft text-white";
const rowHover = " hover:-translate-y-0.5 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

export default function BioCard({ username, displayName, socialLinks = {}, customLinks = [], preview = false }) {
    const name = displayName || username || "Your name";

    const items = [
        ...customLinks.map((l, i) => {
            const href = toHref(l.url) || (preview ? "#" : null);
            const label = l.title?.trim() || (l.url?.trim() ? hostOf(toHref(l.url) || l.url) : (preview ? "Custom link" : ""));
            return {
                key: `custom-${l.id || i}`,
                label,
                Icon: getIcon(l.icon).Icon,
                href,
            };
        }),
        ...SOCIALS
            .filter(([key]) => socialLinks[key])
            .map(([key, label, Icon]) => ({ key, label, Icon, href: toHref(socialLinks[key]) })),
    ].filter((item) => item.href && (preview || item.label));

    return (
        <div className="text-center text-white">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-pop font-display text-3xl font-bold uppercase leading-none text-ink">
                {name[0]}
            </div>
            <h1 className="mt-3.5 font-display text-2xl font-bold tracking-[-0.03em]">{name}</h1>
            <p className="text-sm text-faint">@{username || "username"}</p>

            {items.length === 0 ? (
                <p className="mt-7 rounded-2xl border-[1.5px] border-dashed border-ink-soft px-4 py-6 text-sm text-faint">
                    {preview ? "Your links will appear here." : "No links added yet."}
                </p>
            ) : (
                <ul className="mt-7 space-y-3">
                    {items.map(({ key, label, Icon, href }, i) => (
                        <li key={key}>
                            {preview ? (
                                <div className={`${rowBase} ${rowStyle(i)} flex items-center justify-center gap-2`}>
                                    <Icon sx={{ fontSize: 18 }} />{label}
                                </div>
                            ) : (
                                <a href={href} target="_blank" rel="noreferrer"
                                    className={`${rowBase} ${rowStyle(i)} flex items-center justify-center gap-2${rowHover}`}>
                                    <Icon sx={{ fontSize: 18 }} />{label}
                                </a>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
