import { useCallback, useEffect, useState } from "react";

export type SocialKey = "facebook" | "instagram";

export interface SocialConfig {
  icon: string; // image URL or data URI; empty = use text fallback
  url: string;  // profile URL
  newTab: boolean;
}

const FALLBACK_LABEL: Record<SocialKey, string> = {
  facebook: "FB",
  instagram: "IG",
};

const DEFAULTS: Record<SocialKey, SocialConfig> = {
  facebook: { icon: "", url: "", newTab: true },
  instagram: { icon: "", url: "", newTab: true },
};

const EVENT = "mr.socials.update";

function keys(k: SocialKey) {
  return {
    icon: `social_${k}_icon`,
    url: `social_${k}_url`,
    newTab: `social_${k}_newtab`,
  };
}

function readOne(k: SocialKey): SocialConfig {
  try {
    const ks = keys(k);
    const newTabRaw = localStorage.getItem(ks.newTab);
    return {
      icon: localStorage.getItem(ks.icon) ?? "",
      url: localStorage.getItem(ks.url) ?? "",
      newTab: newTabRaw === null ? true : newTabRaw === "true",
    };
  } catch {
    return DEFAULTS[k];
  }
}

function readAll(): Record<SocialKey, SocialConfig> {
  return {
    facebook: readOne("facebook"),
    instagram: readOne("instagram"),
  };
}

export function useSocials() {
  const [socials, setSocials] = useState<Record<SocialKey, SocialConfig>>(() => readAll());

  useEffect(() => {
    const sync = () => setSocials(readAll());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const save = useCallback((k: SocialKey, cfg: SocialConfig) => {
    const ks = keys(k);
    localStorage.setItem(ks.icon, cfg.icon);
    localStorage.setItem(ks.url, cfg.url);
    localStorage.setItem(ks.newTab, String(cfg.newTab));
    window.dispatchEvent(new CustomEvent(EVENT));
    setSocials(readAll());
  }, []);

  return { socials, save, fallback: FALLBACK_LABEL };
}
