import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const KEY = "mr.theme";

type Theme = "light" | "dark";

function getInitial(): Theme {
  if (typeof window === "undefined") return "light";
  const saved = localStorage.getItem(KEY) as Theme | null;
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function apply(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}

const ThemeToggle = ({ className = "" }: { className?: string }) => {
  const [theme, setTheme] = useState<Theme>(() => getInitial());

  useEffect(() => {
    apply(theme);
    localStorage.setItem(KEY, theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={`relative w-9 h-9 inline-flex items-center justify-center rounded-full text-foreground/70 hover:text-primary hover:bg-foreground/5 transition-colors ${className}`}
    >
      <Sun
        size={16}
        strokeWidth={1.6}
        className={`absolute transition-all duration-300 ${
          isDark ? "opacity-0 -rotate-90 scale-75" : "opacity-100 rotate-0 scale-100"
        }`}
      />
      <Moon
        size={16}
        strokeWidth={1.6}
        className={`absolute transition-all duration-300 ${
          isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-75"
        }`}
      />
    </button>
  );
};

export default ThemeToggle;
