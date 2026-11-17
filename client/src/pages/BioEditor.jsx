import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import Field from "../components/Field";
import BioCard, { ICONS, getIcon } from "../components/BioCard";
import { Notice, Spinner, btnLime, btnOutline, cardClass, display, iconBtn } from "../components/ui";
import { bioApi } from "../api/services";
import { getErrorMessage } from "../api/api";

const KEY = "linkhub_username";
const EMPTY = { username: "", displayName: "", github: "", linkedin: "", twitter: "", instagram: "" };
const MAX_CUSTOM = 10;

const uid = () => Math.random().toString(36).slice(2, 10);
const miniInput =
    "w-full rounded-[10px] border-2 border-line bg-white px-3 py-2.5 text-base text-ink placeholder:text-mute/60 transition hover:border-mist focus:border-ink focus:outline-none sm:text-sm";

export default function BioEditor() {
    const [saved, setSaved] = useState(() => localStorage.getItem(KEY) || "");
    const [form, setForm] = useState({ ...EMPTY, username: saved });
    const [customLinks, setCustomLinks] = useState([]);
    const [openPicker, setOpenPicker] = useState(null);
    const [loading, setLoading] = useState(Boolean(saved));
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState({ type: "", message: "" });
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!saved) return;
        bioApi.get(saved)
            .then(({ data }) => {
                const s = data.socialLinks || {};
                setForm({
                    username: data.username,
                    displayName: data.displayName || "",
                    github: s.github || "",
                    linkedin: s.linkedin || "",
                    twitter: s.twitter || "",
                    instagram: s.instagram || "",
                });
                setCustomLinks(
                    (data.customLinks || []).map((l) => ({ id: uid(), title: l.title || "", url: l.url || "", icon: l.icon || "link" }))
                );
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const addLink = () => {
        const id = uid();
        setCustomLinks((prev) => [...prev, { id, title: "", url: "", icon: "link" }]);
        setOpenPicker(id);
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
            const payload = {
                ...form,
                customLinks: customLinks
                    .filter((l) => l.url.trim())
                    .map(({ title, url, icon }) => ({ title: title.trim(), url: url.trim(), icon })),
            };
            const { data } = await bioApi.update(payload);
            localStorage.setItem(KEY, form.username);
            setSaved(form.username);
            setStatus({ type: "success", message: data.message });
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
            setTimeout(() => setCopied(false), 1500);
        } catch {}
    };

    if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

    const socialLinks = { github: form.github, linkedin: form.linkedin, twitter: form.twitter, instagram: form.instagram };

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className={`${display} text-[clamp(2rem,5vw,3.25rem)] leading-none`}>Your bio page</h1>
                    <p className="mt-2 text-mute">One public page for all your links.</p>
                </div>
                {saved && (
                    <div className="flex min-w-0 max-w-full items-center gap-2 rounded-full border-2 border-ink py-1.5 pl-4 pr-1.5 text-sm">
                        <span className="min-w-0 truncate font-medium">{publicUrl.replace(/^https?:\/\//, "")}</span>
                        <button type="button" onClick={copy} className={btnOutline}>{copied ? "Copied" : "Copy"}</button>
                        <Link to={`/u/${saved}`} className={`${btnOutline} bg-pop`}>View</Link>
                    </div>
                )}
            </div>

            <div className="grid items-start gap-8 lg:grid-cols-[1fr_21rem]">
                <form onSubmit={handleSubmit} className={`${cardClass} divide-y-2 divide-line`}>
                    <div className="space-y-4 p-7">
                        <h2 className="text-lg font-bold">Profile</h2>
                        <Field id="username" label="Username" placeholder="yourname" value={form.username}
                            onChange={handleChange} disabled={Boolean(saved)} required pattern="[a-zA-Z0-9_\-]+"
                            title="Letters, numbers, hyphens and underscores only">
                            {saved && <p className="mt-1.5 text-xs text-mute">Your username is fixed once your bio is created.</p>}
                        </Field>
                        <Field id="displayName" label="Display name" placeholder="Your Name" value={form.displayName}
                            onChange={handleChange} disabled={Boolean(saved)} />
                    </div>

                    <div className="space-y-4 p-7">
                        <h2 className="text-lg font-bold">Social links</h2>
                        <Field id="github" label="GitHub" type="url" placeholder="https://github.com/you" value={form.github} onChange={handleChange} />
                        <Field id="linkedin" label="LinkedIn" type="url" placeholder="https://linkedin.com/in/you" value={form.linkedin} onChange={handleChange} />
                        <Field id="twitter" label="Twitter / X" type="url" placeholder="https://x.com/you" value={form.twitter} onChange={handleChange} />
                        <Field id="instagram" label="Instagram" type="url" placeholder="https://instagram.com/you" value={form.instagram} onChange={handleChange} />
                    </div>

                    <div className="space-y-4 p-7">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-bold">Custom links</h2>
                                <p className="mt-0.5 text-xs text-mute">Portfolio, blog, resume, store… pick an icon for each.</p>
                            </div>
                            <button type="button" onClick={addLink} disabled={customLinks.length >= MAX_CUSTOM}
                                className={`${btnOutline} flex shrink-0 items-center gap-1 bg-pop`}>
                                <AddRoundedIcon sx={{ fontSize: 16 }} /> Add link
                            </button>
                        </div>

                        {customLinks.length === 0 ? (
                            <p className="rounded-2xl border-2 border-dashed border-mist px-4 py-6 text-center text-sm text-mute">
                                No custom links yet. Click “Add link” to create one.
                            </p>
                        ) : (
                            <ul className="space-y-3">
                                {customLinks.map((l) => {
                                    const { Icon } = getIcon(l.icon);
                                    const open = openPicker === l.id;
                                    return (
                                        <li key={l.id} className="rounded-2xl border-2 border-ink p-3">
                                            <div className="flex items-start gap-2">
                                                <button type="button" onClick={() => setOpenPicker(open ? null : l.id)}
                                                    aria-label={`Choose icon (current: ${getIcon(l.icon).label})`} aria-expanded={open}
                                                    className="flex h-[42px] w-[42px] shrink-0 cursor-pointer items-center justify-center rounded-[10px] bg-ink text-pop transition hover:bg-ink-soft focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
                                                    <Icon sx={{ fontSize: 22 }} />
                                                </button>

                                                <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[9rem_1fr]">
                                                    <input value={l.title} onChange={(e) => updateLink(l.id, { title: e.target.value })}
                                                        placeholder="Title (e.g. Portfolio)" maxLength={40} aria-label="Link title" className={miniInput} />
                                                    <input value={l.url} onChange={(e) => updateLink(l.id, { url: e.target.value })}
                                                        placeholder="https://yourportfolio.com" aria-label="Link URL" className={miniInput} />
                                                </div>

                                                <button type="button" onClick={() => removeLink(l.id)} aria-label="Remove link"
                                                    className={`${iconBtn} hover:text-rose-600`}>
                                                    <CloseRoundedIcon sx={{ fontSize: 20 }} />
                                                </button>
                                            </div>

                                            {open && (
                                                <div role="group" aria-label="Pick an icon"
                                                    className="mt-3 grid grid-cols-5 gap-1.5 rounded-xl bg-track p-2 sm:grid-cols-7">
                                                    {ICONS.map(({ key, label, Icon: Opt }) => (
                                                        <button key={key} type="button" title={label} aria-label={label} aria-pressed={l.icon === key}
                                                            onClick={() => { updateLink(l.id, { icon: key }); setOpenPicker(null); }}
                                                            className={`flex h-10 cursor-pointer items-center justify-center rounded-lg transition focus:outline-none focus-visible:outline-2 focus-visible:outline-ink ${
                                                                l.icon === key ? "border-2 border-ink bg-pop text-ink" : "text-mute hover:bg-white hover:text-ink"
                                                            }`}>
                                                            <Opt sx={{ fontSize: 22 }} />
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>

                    <div className="space-y-4 p-7">
                        <Notice type={status.type || "error"}>{status.message}</Notice>
                        <button type="submit" disabled={saving} className={`${btnLime} w-full`}>
                            {saving ? "Saving…" : saved ? "Save changes" : "Create bio page"}
                        </button>
                    </div>
                </form>

                <aside className="lg:sticky lg:top-6">
                    <p className="mb-3 text-center text-xs font-bold tracking-wider text-mute">LIVE PREVIEW</p>
                    <div className="mx-auto w-full max-w-[21rem] rounded-[36px] bg-ink p-8 shadow-[8px_8px_0_#c6f432]">
                        <BioCard preview username={form.username} displayName={form.displayName}
                            socialLinks={socialLinks} customLinks={customLinks} />
                    </div>
                </aside>
            </div>
        </div>
    );
}
