export const timeAgo = (value) => {
    if (!value) return "never";
    const seconds = Math.max(1, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
    const units = [["year", 31536000], ["month", 2592000], ["day", 86400], ["hour", 3600], ["minute", 60]];
    for (const [name, size] of units) {
        if (seconds >= size) {
            const n = Math.floor(seconds / size);
            return `${n} ${name}${n > 1 ? "s" : ""} ago`;
        }
    }
    return "just now";
};

export const domainOf = (url) => {
    try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; }
};

export const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
};
