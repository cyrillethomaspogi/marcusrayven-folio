import { useSocials, type SocialKey } from "@/hooks/useSocials";

interface Props {
  className?: string;
  size?: "sm" | "md";
}

const ORDER: SocialKey[] = ["facebook", "instagram"];
const LABELS: Record<SocialKey, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
};

const SocialIcons = ({ className = "", size = "md" }: Props) => {
  const { socials, fallback } = useSocials();
  const visible = ORDER.filter((k) => socials[k].url.trim());

  if (visible.length === 0) return null;

  const dim = size === "sm" ? "w-9 h-9 text-[10px]" : "w-11 h-11 text-xs";

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {visible.map((k) => {
        const cfg = socials[k];
        const target = cfg.newTab ? "_blank" : undefined;
        const rel = cfg.newTab ? "noopener noreferrer" : undefined;
        return (
          <a
            key={k}
            href={cfg.url}
            target={target}
            rel={rel}
            aria-label={LABELS[k]}
            title={LABELS[k]}
            className={`group inline-flex items-center justify-center ${dim} rounded-full border border-border bg-background/60 hover:border-primary hover:bg-primary hover:text-primary-foreground transition-colors overflow-hidden`}
          >
            {cfg.icon ? (
              <img
                src={cfg.icon}
                alt={LABELS[k]}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <span className="font-label tracking-widest text-primary group-hover:text-primary-foreground">
                {fallback[k]}
              </span>
            )}
          </a>
        );
      })}
    </div>
  );
};

export default SocialIcons;
