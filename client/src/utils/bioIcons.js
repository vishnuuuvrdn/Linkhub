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

export const SOCIALS = [
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

export const hostOf = (href) => {
    try { return new URL(href).hostname.replace(/^www\./, ""); } catch { return href; }
};
