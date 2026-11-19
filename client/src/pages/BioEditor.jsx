import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import Field from "../components/Field";
import BioCard from "../components/BioCard";
import { getIcon, hostOf, ICONS, toHref } from "../utils/bioIcons";
import { Notice, Spinner, btnLime, btnOutline, cardClass, display, hardShadow } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { bioApi } from "../api/services";
import { getErrorMessage } from "../api/api";

const KEY = "linkhub_username";
const EMPTY = { username: "", displayName: "", github: "", linkedin: "", twitter: "", instagram: "" };
const MAX_CUSTOM = 10;

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
const miniInput =
    "w-full rounded-[10px] border-2 border-line bg-white px-3 py-2.5 text-base text-ink placeholder:text-mute/60 transition hover:border-mist focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink sm:text-sm min-h-11";

export default function BioEditor() {
    const { user, updateUser } = useAuth();
    const [saved, setSaved] = useState(() => localStorage.getItem(KEY) || user?.username || user?.handle || "");
    const [form, setForm] = useState({
        ...EMPTY,
        username: localStorage.getItem(KEY) || user?.username || user?.handle || "",
        displayName: user?.displayName || user?.name || "",
    });
    const [customLinks, setCustomLinks] = useState([]);
    const [openPicker, setOpenPicker] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState({ type: "", message: "" });
    const [copied, setCopied] = useState(false);
    const [mobileTab, setMobileTab] = useState("editor");
    const userRef = useRef(user);

    useEffect(() => {
        userRef.current = user;
    }, [user]);

    useEffect(() => {
        let active = true;

        const safetyTimer = setTimeout(() => {
            if (active) setLoading(false);
        }, 4000);

        const fetchBio = async () => {
            try {
                let bioData = null;
                const currentUser = userRef.current;
                try {
                    const res = await bioApi.getMe();
                    bioData = res.data;
                } catch {
                    const fallbackName = currentUser?.username || currentUser?.handle || localStorage.getItem(KEY);
                    if (fallbackName) {
                        try {
                            const res = await bioApi.get(fallbackName);
                            bioData = res.data;
                        } catch {
                            // Fallback bio not found yet
                        }
                    }
                }

                if (!active) return;

                if (bioData) {
                    const s = bioData.socialLinks || {};
                    const fetchedUsername = bioData.username || "";
                    const fetchedDisplayName = bioData.displayName || currentUser?.displayName || currentUser?.name || "";

                    setForm({
                        username: fetchedUsername,
                        displayName: fetchedDisplayName,
                        github: s.github || "",
                        linkedin: s.linkedin || "",
                        twitter: s.twitter || "",
                        instagram: s.instagram || "",
                    });
                    setCustomLinks(
                        (bioData.customLinks || []).map((l) => ({
                            id: uid(),
                            title: l.title || "",
                            url: l.url || "",
                            icon: l.icon || "link",
                        }))
                    );

                    if (fetchedUsername && !bioData.isNew) {
                        setSaved(fetchedUsername);
                        localStorage.setItem(KEY, fetchedUsername);
                    }
                } else if (currentUser) {
                    setForm((prev) => ({
                        ...prev,
                        displayName: prev.displayName || currentUser.displayName || currentUser.name || "",
                        username: prev.username || currentUser.handle || "",
                    }));
                }
            } catch (err) {
                console.error("Failed to fetch bio from database:", err);
            } finally {
                clearTimeout(safetyTimer);
                if (active) setLoading(false);
            }
        };

        fetchBio();
        return () => {
            active = false;
            clearTimeout(safetyTimer);
        };
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const addLink = () => {
        if (customLinks.length >= MAX_CUSTOM) return;
        const id = uid();
        setCustomLinks((prev) => [...prev, { id, title: "", url: "", icon: "link" }]);
        setOpenPicker(null);
    };

    const updateLink = (id, patch) =>
        setCustomLinks((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));

    const removeLink = (id) => {
        setCustomLinks((prev) => prev.filter((l) => l.id !== id));
        setOpenPicker((cur) => (cur === id ? null : cur));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: "", message: "" });
        setSaving(true);
        try {
            const missingUrl = customLinks.find((l) => l.title?.trim() && !l.url?.trim());
            if (missingUrl) {
                setStatus({
                    type: "error",
                    message: `Please provide a URL for "${missingUrl.title.trim()}".`,
                });
                setSaving(false);
                return;
            }

            const linksWithUrl = customLinks.filter((l) => l && l.url && l.url.trim());

            const cleanedLinks = linksWithUrl.map(({ title, url, icon }) => {
                const rawUrl = url.trim();
                const href = toHref(rawUrl) || rawUrl;
                const cleanTitle = title?.trim() || hostOf(href);
                return {
                    title: cleanTitle.slice(0, 40),
                    url: href,
                    icon: icon || "link",
                };
            });

            const usernameToSubmit = (form.username || saved || user?.username || user?.handle || "").trim();
            if (!usernameToSubmit) {
                setStatus({ type: "error", message: "Please provide a username for your bio." });
                setSaving(false);
                return;
            }

            const payload = {
                ...form,
                username: usernameToSubmit,
                github: toHref(form.github) || "",
                linkedin: toHref(form.linkedin) || "",
                twitter: toHref(form.twitter) || "",
                instagram: toHref(form.instagram) || "",
                customLinks: cleanedLinks,
            };

            const { data } = await bioApi.update(payload);
            const savedUsername = (data?.response?.username || usernameToSubmit).trim();
            localStorage.setItem(KEY, savedUsername);
            setSaved(savedUsername);

            if (updateUser) {
                updateUser({
                    username: savedUsername,
                    handle: savedUsername,
                    displayName: (form.displayName || data?.response?.displayName || "").trim(),
                });
            }

            if (data?.response?.customLinks) {
                setCustomLinks(
                    data.response.customLinks.map((l) => ({
                        id: uid(),
                        title: l.title || "",
                        url: l.url || "",
                        icon: l.icon || "link",
                    }))
                );
            } else {
                setCustomLinks(
                    cleanedLinks.map((l) => ({
                        id: uid(),
                        title: l.title || "",
                        url: l.url || "",
                        icon: l.icon || "link",
                    }))
                );
            }

            setStatus({ type: "success", message: data.message || "Bio page updated successfully!" });
        } catch (err) {
            setStatus({ type: "error", message: getErrorMessage(err) });
        } finally {
            setSaving(false);
        }
    };

    const publicUrl = saved ? `${window.location.origin}/u/${saved}` : "";

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(publicUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch {
            // Ignore clipboard errors
        }
    };

    const share = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: form.displayName || form.username || "My LinkHub Bio",
                    text: `Check out my links on LinkHub!`,
                    url: publicUrl,
                });
            } catch {
                // User cancelled or share failed
            }
        } else {
            copy();
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
                <Spinner />
                <p className="text-xs font-bold uppercase tracking-wider text-mute">Loading bio settings…</p>
            </div>
        );
    }

    const socialLinks = {
        github: form.github,
        linkedin: form.linkedin,
        twitter: form.twitter,
        instagram: form.instagram,
    };

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Header */}
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className={`${display} text-[clamp(2rem,5vw,3.25rem)] leading-none text-balance`}>
                        Your Bio Page
                    </h1>
                    <p className="mt-2 text-sm sm:text-base text-mute">
                        One public link to showcase your social handles, custom links, and projects.
                    </p>
                </div>

                {saved && (
                    <div className="flex min-w-0 max-w-full items-center gap-2 rounded-full border-2 border-ink bg-white py-1.5 pl-4 pr-1.5 text-xs sm:text-sm shadow-[2px_2px_0_#0a0a0f]">
                        <span className="min-w-0 truncate font-semibold">{publicUrl.replace(/^https?:\/\//, "")}</span>
                        <button
                            type="button"
                            onClick={copy}
                            className={`${btnOutline} min-h-9 gap-1 px-3`}
                            aria-label="Copy public bio URL"
                        >
                            {copied ? <CheckRoundedIcon sx={{ fontSize: 16 }} className="text-emerald-600" /> : <ContentCopyRoundedIcon sx={{ fontSize: 15 }} />}
                            <span>{copied ? "Copied" : "Copy"}</span>
                        </button>
                        <button
                            type="button"
                            onClick={share}
                            className={`${btnOutline} min-h-9 gap-1 px-3`}
                            aria-label="Share public bio"
                        >
                            <ShareRoundedIcon sx={{ fontSize: 15 }} />
                            <span>Share</span>
                        </button>
                        <Link to={`/u/${saved}`} className={`${btnOutline} min-h-9 bg-pop px-3`}>
                            View
                        </Link>
                    </div>
                )}
            </div>

            {/* Mobile View Toggle Segmented Control (Ergonomic UX) */}
            <div className="flex lg:hidden rounded-2xl border-2 border-ink bg-track p-1 shadow-[2px_2px_0_#0a0a0f]">
                <button
                    type="button"
                    onClick={() => setMobileTab("editor")}
                    className={`flex-1 min-h-11 flex items-center justify-center gap-1.5 rounded-xl text-sm font-bold transition-all duration-150 ${
                        mobileTab === "editor"
                            ? "bg-white text-ink border-2 border-ink shadow-[2px_2px_0_#0a0a0f]"
                            : "text-mute hover:text-ink"
                    }`}
                >
                    <EditRoundedIcon sx={{ fontSize: 18 }} />
                    <span>Edit Profile</span>
                </button>
                <button
                    type="button"
                    onClick={() => setMobileTab("preview")}
                    className={`flex-1 min-h-11 flex items-center justify-center gap-1.5 rounded-xl text-sm font-bold transition-all duration-150 ${
                        mobileTab === "preview"
                            ? "bg-pop text-ink border-2 border-ink shadow-[2px_2px_0_#0a0a0f]"
                            : "text-mute hover:text-ink"
                    }`}
                >
                    <VisibilityRoundedIcon sx={{ fontSize: 18 }} />
                    <span>Live Preview</span>
                </button>
            </div>

            {/* Grid Layout: Editor on left, Live Preview on right */}
            <div className="grid items-start gap-8 lg:grid-cols-[1fr_22rem]">
                {/* Form Section */}
                <form
                    noValidate
                    onSubmit={handleSubmit}
                    className={`${cardClass} ${hardShadow} divide-y-2 divide-line ${
                        mobileTab === "preview" ? "hidden lg:block" : "block"
                    }`}
                >
                    {/* Basic Profile */}
                    <div className="space-y-4 p-5 sm:p-7">
                        <div className="flex items-center justify-between">
                            <h2 className="font-display text-lg font-bold">Profile Details</h2>
                            <span className="text-xs font-semibold text-mute">Public Information</span>
                        </div>
                        <Field
                            id="username"
                            label="Username handle"
                            placeholder="yourname"
                            value={form.username}
                            onChange={handleChange}
                            disabled={Boolean(saved)}
                            required
                            pattern="[a-zA-Z0-9_\-]+"
                            title="Letters, numbers, hyphens and underscores only"
                        >
                            {saved && (
                                <p className="mt-1.5 text-xs text-mute">
                                    Your username is permanent once your bio page is created.
                                </p>
                            )}
                        </Field>
                        <Field
                            id="displayName"
                            label="Display Name"
                            placeholder="Your Full Name (e.g. Alex Rivera)"
                            value={form.displayName}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Social Handles */}
                    <div className="space-y-4 p-5 sm:p-7">
                        <div className="flex items-center justify-between">
                            <h2 className="font-display text-lg font-bold">Social Handles & Profiles</h2>
                            <span className="text-xs font-semibold text-mute">Auto-formatted</span>
                        </div>
                        <Field
                            id="github"
                            label="GitHub"
                            type="url"
                            placeholder="https://github.com/username"
                            value={form.github}
                            onChange={handleChange}
                        />
                        <Field
                            id="linkedin"
                            label="LinkedIn"
                            type="url"
                            placeholder="https://linkedin.com/in/username"
                            value={form.linkedin}
                            onChange={handleChange}
                        />
                        <Field
                            id="twitter"
                            label="Twitter / X"
                            type="url"
                            placeholder="https://x.com/username"
                            value={form.twitter}
                            onChange={handleChange}
                        />
                        <Field
                            id="instagram"
                            label="Instagram"
                            type="url"
                            placeholder="https://instagram.com/username"
                            value={form.instagram}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Custom Links */}
                    <div className="space-y-4 p-5 sm:p-7">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h2 className="font-display text-lg font-bold">Custom Links & Projects</h2>
                                <p className="mt-0.5 text-xs text-mute">
                                    Add your portfolio, store, blog, or resume with custom icons. ({customLinks.length}/{MAX_CUSTOM})
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={addLink}
                                disabled={customLinks.length >= MAX_CUSTOM}
                                className={`${btnOutline} min-h-11 flex shrink-0 items-center gap-1.5 bg-pop font-bold`}
                            >
                                <AddRoundedIcon sx={{ fontSize: 18 }} />
                                <span>Add link</span>
                            </button>
                        </div>

                        {customLinks.length === 0 ? (
                            <div className="rounded-2xl border-2 border-dashed border-mist px-4 py-8 text-center text-sm text-mute">
                                <p className="font-semibold text-ink">No custom links added yet.</p>
                                <p className="mt-1 text-xs">Click “Add link” above or below to showcase your projects and sites.</p>
                                <button
                                    type="button"
                                    onClick={addLink}
                                    className={`${btnOutline} mt-4 min-h-11 inline-flex items-center gap-1.5 bg-pop font-bold px-4`}
                                >
                                    <AddRoundedIcon sx={{ fontSize: 18 }} />
                                    <span>Add your first link</span>
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <ul className="space-y-3">
                                    {customLinks.map((l, index) => {
                                        const { Icon } = getIcon(l.icon);
                                        const open = openPicker === l.id;
                                        return (
                                            <li key={l.id} className="rounded-2xl border-2 border-ink p-3.5 bg-white shadow-[2px_2px_0_#0a0a0f]">
                                                <div className="flex items-start gap-2.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => setOpenPicker(open ? null : l.id)}
                                                        aria-label={`Choose icon (current: ${getIcon(l.icon).label})`}
                                                        aria-expanded={open}
                                                        title={`Icon: ${getIcon(l.icon).label}. Click to change`}
                                                        className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-ink text-pop transition-all hover:bg-ink-soft focus:outline-none focus-visible:outline-2 focus-visible:outline-ink active:scale-95"
                                                    >
                                                        <Icon sx={{ fontSize: 22 }} />
                                                    </button>

                                                    <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[10rem_1fr]">
                                                        <input
                                                            value={l.title}
                                                            onChange={(e) => updateLink(l.id, { title: e.target.value })}
                                                            placeholder={`Link ${index + 1} Title (e.g. Portfolio)`}
                                                            maxLength={40}
                                                            aria-label="Link title"
                                                            className={miniInput}
                                                        />
                                                        <input
                                                            value={l.url}
                                                            type="text"
                                                            inputMode="url"
                                                            onChange={(e) => updateLink(l.id, { url: e.target.value })}
                                                            placeholder="https://yourportfolio.com or yoursite.com"
                                                            aria-label="Link URL"
                                                            className={miniInput}
                                                        />
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => removeLink(l.id)}
                                                        aria-label="Remove link"
                                                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-mute transition-colors hover:bg-rose-50 hover:text-rose-600 active:scale-95"
                                                    >
                                                        <CloseRoundedIcon sx={{ fontSize: 20 }} />
                                                    </button>
                                                </div>

                                                {/* Icon Picker Palette */}
                                                {open && (
                                                    <div
                                                        role="group"
                                                        aria-label="Pick an icon"
                                                        className="mt-3 rounded-xl border border-line bg-track/60 p-2.5"
                                                    >
                                                        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-mute">
                                                            Select Icon
                                                        </p>
                                                        <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-7">
                                                            {ICONS.map(({ key, label, Icon: Opt }) => (
                                                                <button
                                                                    key={key}
                                                                    type="button"
                                                                    title={label}
                                                                    aria-label={label}
                                                                    aria-pressed={l.icon === key}
                                                                    onClick={() => {
                                                                        updateLink(l.id, { icon: key });
                                                                        setOpenPicker(null);
                                                                    }}
                                                                    className={`flex h-11 cursor-pointer items-center justify-center rounded-xl transition-all focus:outline-none focus-visible:outline-2 focus-visible:outline-ink ${
                                                                        l.icon === key
                                                                            ? "border-2 border-ink bg-pop text-ink shadow-[2px_2px_0_#0a0a0f]"
                                                                            : "text-mute hover:bg-white hover:text-ink active:scale-95"
                                                                    }`}
                                                                >
                                                                    <Opt sx={{ fontSize: 22 }} />
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>

                                {customLinks.length < MAX_CUSTOM && (
                                    <button
                                        type="button"
                                        onClick={addLink}
                                        className="w-full min-h-11 flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink/40 py-2.5 text-sm font-bold text-ink transition hover:border-ink hover:bg-track active:scale-[0.99]"
                                    >
                                        <AddRoundedIcon sx={{ fontSize: 18 }} />
                                        <span>Add another link ({customLinks.length}/{MAX_CUSTOM})</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Submit Area */}
                    <div className="space-y-4 p-5 sm:p-7 bg-white rounded-b-3xl">
                        {status.message && (
                            <Notice type={status.type || "error"}>{status.message}</Notice>
                        )}
                        <button
                            type="submit"
                            disabled={saving}
                            className={`${btnLime} w-full min-h-12 text-base`}
                        >
                            {saving ? "Saving changes…" : saved ? "Save changes" : "Create bio page"}
                        </button>
                    </div>
                </form>

                {/* Live Preview Aside */}
                <aside
                    className={`lg:sticky lg:top-24 ${
                        mobileTab === "editor" ? "hidden lg:block" : "block"
                    }`}
                >
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <span className="flex h-2 w-2 rounded-full bg-pop animate-pulse" />
                        <p className="text-xs font-extrabold uppercase tracking-widest text-mute">Live Preview</p>
                    </div>
                    <div className="mx-auto w-full max-w-88 rounded-[38px] border-2 border-ink bg-ink p-7 sm:p-8 shadow-[8px_8px_0_#c6f432]">
                        <BioCard
                            preview
                            username={form.username}
                            displayName={form.displayName}
                            socialLinks={socialLinks}
                            customLinks={customLinks}
                        />
                    </div>
                </aside>
            </div>
        </div>
    );
}
