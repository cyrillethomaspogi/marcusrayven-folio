import { useCallback, useEffect, useState } from "react";

export interface SocialItem {
  id: string;
  label: string;       // e.g. "Instagram"
  iconName: string;    // lucide icon key OR "custom"
  iconImage: string;   // used when iconName === "custom" (URL or data URI)
  url: string;
  newTab: boolean;
}

const STORAGE_KEY = "socials_list_v1";
const EVENT = "mr.socials.update";

// Curated list of available lucide icons for social platforms.
// Keep keys in sync with src/components/SocialIcons.tsx ICON_MAP.
export const SOCIAL_ICON_OPTIONS: { value: string; label: string }[] = [
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "twitter", label: "Twitter / X" },
  { value: "youtube", label: "YouTube" },
  { value: "twitch", label: "Twitch" },
  { value: "github", label: "GitHub" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "music", label: "Spotify / Music" },
  { value: "send", label: "Telegram" },
  { value: "message-circle", label: "Discord / Chat" },
  { value: "mail", label: "Email" },
  { value: "globe", label: "Website" },
  { value: "rss", label: "Blog / RSS" },
  { value: "book-open", label: "Wattpad / Books" },
  { value: "pen-tool", label: "Writing" },
  { value: "feather", label: "Feather" },
  { value: "link", label: "Generic link" },
  { value: "custom", label: "Custom image…" },
];

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function migrateLegacy(): SocialItem[] | null {
  // Migrate the old per-platform keys (Fix 6 era: facebook + instagram only).
  const out: SocialItem[] = [];
  for (const key of ["facebook", "instagram"] as const) {
    const url = localStorage.getItem(`social_${key}_url`);
    if (url && url.trim()) {
      const newTabRaw = localStorage.getItem(`social_${key}_newtab`);
      const iconImage = localStorage.getItem(`social_${key}_icon`) ?? "";
      out.push({
        id: uid(),
        label: key.charAt(0).toUpperCase() + key.slice(1),
        iconName: iconImage ? "custom" : key,
        iconImage,
        url,
        newTab: newTabRaw === null ? true : newTabRaw === "true",
      });
    }
    // Clean up legacy keys regardless
    localStorage.removeItem(`social_${key}_url`);
    localStorage.removeItem(`social_${key}_icon`);
    localStorage.removeItem(`social_${key}_newtab`);
  }
  return out.length ? out : null;
}

function read(): SocialItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as SocialItem[];
    }
    const migrated = migrateLegacy();
    if (migrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    }
    return [];
  } catch {
    return [];
  }
}

function write(items: SocialItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function useSocials() {
  const [socials, setSocials] = useState<SocialItem[]>(() => read());

  useEffect(() => {
    const sync = () => setSocials(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const addSocial = useCallback((item: Omit<SocialItem, "id">) => {
    const next = [...read(), { ...item, id: uid() }];
    write(next);
    setSocials(next);
  }, []);

  const updateSocial = useCallback((id: string, patch: Partial<SocialItem>) => {
    const next = read().map((s) => (s.id === id ? { ...s, ...patch } : s));
    write(next);
    setSocials(next);
  }, []);

  const deleteSocial = useCallback((id: string) => {
    const next = read().filter((s) => s.id !== id);
    write(next);
    setSocials(next);
  }, []);

  const reorder = useCallback((id: string, direction: "up" | "down") => {
    const list = read();
    const idx = list.findIndex((s) => s.id === id);
    if (idx === -1) return;
    const swap = direction === "up" ? idx - 1 : idx + 1;
    if (swap < 0 || swap >= list.length) return;
    [list[idx], list[swap]] = [list[swap], list[idx]];
    write(list);
    setSocials(list);
  }, []);

  return { socials, addSocial, updateSocial, deleteSocial, reorder };
}
