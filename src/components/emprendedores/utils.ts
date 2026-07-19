export function safeUrl(raw: string): string {
  const t = raw.trim();
  if (/^https?:\/\//i.test(t)) return t;
  if (t.startsWith("@")) return `https://instagram.com/${t.slice(1)}`;
  return `https://${t}`;
}

export function displayHandle(raw: string): string {
  const clean = raw.trim().replace(/^https?:\/\//i, "").replace(/\/$/, "");
  const last = clean.split("/").pop() ?? clean;
  return last.startsWith("@") ? last : `@${last.replace(/^instagram\.com\/?/, "")}`;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith("1")) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return raw;
}
