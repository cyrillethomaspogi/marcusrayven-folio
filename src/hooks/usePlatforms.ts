import { useEffect, useState, useCallback } from "react";

export interface Platform {
  id: string;
  name: string;
  handle: string;
  line: string;
  url: string;
  mark: string;
}

const KEY = "mr.platforms.v1";

const seed: Platform[] = [
  {
    id: "wattpad-default",
    name: "Wattpad",
    handle: "@redlinedboi on Wattpad",
    line: "BL fiction, Omegaverse, and more.",
    url: "https://www.wattpad.com/user/redlinedboi",
    mark: "W",
  },
  {
    id: "dreame-default",
    name: "Dreame",
    handle: "Marcus Rayven on Dreame",
    line: "Premium stories, unlocked worlds.",
    url: "https://www.dreame.com/author/4504265819",
    mark: "D",
  },
];

function read(): Platform[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seed;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : seed;
  } catch {
    return seed;
  }
}

function write(items: Platform[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("mr.platforms.update"));
}

export function usePlatforms() {
  const [platforms, setPlatforms] = useState<Platform[]>(() => read());

  useEffect(() => {
    const sync = () => setPlatforms(read());
    window.addEventListener("mr.platforms.update", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("mr.platforms.update", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const addPlatform = useCallback((p: Omit<Platform, "id">) => {
    const next = [...read(), { ...p, id: crypto.randomUUID() }];
    write(next);
  }, []);

  const updatePlatform = useCallback((id: string, patch: Partial<Platform>) => {
    write(read().map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }, []);

  const deletePlatform = useCallback((id: string) => {
    write(read().filter((p) => p.id !== id));
  }, []);

  return { platforms, addPlatform, updatePlatform, deletePlatform };
}
