import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import LanguageIcon from "@mui/icons-material/Language";
import WorkOutlinedIcon from "@mui/icons-material/WorkOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import MailOutlinedIcon from "@mui/icons-material/MailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import YouTubeIcon from "@mui/icons-material/YouTube";
import FacebookIcon from "@mui/icons-material/Facebook";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import TelegramIcon from "@mui/icons-material/Telegram";
import CodeIcon from "@mui/icons-material/Code";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import MusicNoteOutlinedIcon from "@mui/icons-material/MusicNoteOutlined";

export const ICONS = [
    { key: "link", label: "Link", Icon: LinkRoundedIcon },
    { key: "website", label: "Website", Icon: LanguageIcon },
    { key: "portfolio", label: "Portfolio", Icon: WorkOutlinedIcon },
    { key: "blog", label: "Blog", Icon: ArticleOutlinedIcon },
    { key: "resume", label: "Resume", Icon: DescriptionOutlinedIcon },
    { key: "email", label: "Email", Icon: MailOutlinedIcon },
    { key: "phone", label: "Phone", Icon: PhoneOutlinedIcon },
    { key: "youtube", label: "YouTube", Icon: YouTubeIcon },
    { key: "facebook", label: "Facebook", Icon: FacebookIcon },
    { key: "whatsapp", label: "WhatsApp", Icon: WhatsAppIcon },
    { key: "telegram", label: "Telegram", Icon: TelegramIcon },
    { key: "code", label: "Code", Icon: CodeIcon },
    { key: "store", label: "Store", Icon: StorefrontOutlinedIcon },
    { key: "music", label: "Music", Icon: MusicNoteOutlinedIcon },
];

export const getIcon = (key) => ICONS.find((i) => i.key === key) || ICONS[0];

const SOCIALS = [
    ["github", "GitHub", GitHubIcon],
    ["linkedin", "LinkedIn", LinkedInIcon],
    ["twitter", "Twitter / X", TwitterIcon],
    ["instagram", "Instagram", InstagramIcon],
];

export const toHref = (value = "") => {
    const v = value.trim();
    if (!v) return null;
    if (/^(https?:|mailto:|tel:)/i.test(v)) return v;
    if (/^[a-z][a-z0-9+.-]*:/i.test(v)) return null;
    return `https://${v}`;
};

const hostOf = (href) => {
    try { return new URL(href).hostname.replace(/^www\./, ""); } catch { return href; }
};

const rowBase = "block rounded-2xl px-4 py-3.5 text-center text-sm font-semibold transition";
const rowStyle = (i) =>
    i === 0 ? "bg-white text-ink" : i === 1 ? "bg-pop text-ink" : "border-[1.5px] border-ink-soft text-white";
const rowHover = " hover:-translate-y-0.5 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

export default function BioCard({ username, displayName, socialLinks = {}, customLinks = [], preview = false }) {
    const name = displayName || username || "Your name";

    const items = [
        ...customLinks.map((l, i) => {
            const href = toHref(l.url);
            return { key: `custom-${i}`, label: l.title?.trim() || (href ? hostOf(href) : ""), Icon: getIcon(l.icon).Icon, href };
        }),
        ...SOCIALS
            .filter(([key]) => socialLinks[key])
            .map(([key, label, Icon]) => ({ key, label, Icon, href: toHref(socialLinks[key]) })),
    ].filter((item) => item.href);

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
