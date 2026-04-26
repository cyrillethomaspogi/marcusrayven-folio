import { useEffect, useState, useCallback } from "react";

export interface Story {
  id: string;
  title: string;
  genre: string;
  blurb: string;
  platform: string;
  cover: string; // data URL or external URL
}

const KEY = "mr.stories.v1";

const seed: Story[] = [];

function read(): Story[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seed;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : seed;
  } catch {
    return seed;
  }
}

function write(stories: Story[]) {
  localStorage.setItem(KEY, JSON.stringify(stories));
  window.dispatchEvent(new CustomEvent("mr.stories.update"));
}

export function useStories() {
  const [stories, setStories] = useState<Story[]>(() => read());

  useEffect(() => {
    const sync = () => setStories(read());
    window.addEventListener("mr.stories.update", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("mr.stories.update", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const addStory = useCallback((s: Omit<Story, "id">) => {
    const next = [...read(), { ...s, id: crypto.randomUUID() }];
    write(next);
  }, []);

  const updateStory = useCallback((id: string, patch: Partial<Story>) => {
    const next = read().map((s) => (s.id === id ? { ...s, ...patch } : s));
    write(next);
  }, []);

  const deleteStory = useCallback((id: string) => {
    write(read().filter((s) => s.id !== id));
  }, []);

  return { stories, addStory, updateStory, deleteStory };
}
