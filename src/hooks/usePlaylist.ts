import { useCallback, useEffect, useState } from "react";

const KEY = "mr.playlist.url.v1";
export const DEFAULT_PLAYLIST_URL =
  "https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M?utm_source=generator&theme=0";

function read(): string {
  try {
    return localStorage.getItem(KEY) || DEFAULT_PLAYLIST_URL;
  } catch {
    return DEFAULT_PLAYLIST_URL;
  }
}

function normalize(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return DEFAULT_PLAYLIST_URL;
  // Convert open.spotify.com/playlist/ID to embed form
  const m = trimmed.match(
    /^https?:\/\/open\.spotify\.com\/(?:embed\/)?(playlist|album|track|episode|show)\/([A-Za-z0-9]+)/
  );
  if (m) {
    const [, type, id] = m;
    return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;
  }
  return trimmed;
}

export function usePlaylist() {
  const [url, setUrl] = useState<string>(() => read());

  useEffect(() => {
    const sync = () => setUrl(read());
    window.addEventListener("mr.playlist.update", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("mr.playlist.update", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const save = useCallback((next: string) => {
    const value = normalize(next);
    localStorage.setItem(KEY, value);
    window.dispatchEvent(new CustomEvent("mr.playlist.update"));
    setUrl(value);
    return value;
  }, []);

  const reset = useCallback(() => {
    localStorage.removeItem(KEY);
    window.dispatchEvent(new CustomEvent("mr.playlist.update"));
    setUrl(DEFAULT_PLAYLIST_URL);
  }, []);

  return { url, save, reset };
}
