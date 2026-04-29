import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Twitch,
  Github,
  Linkedin,
  Music,
  Send,
  MessageCircle,
  Mail,
  Globe,
  Rss,
  BookOpen,
  PenTool,
  Feather,
  Link as LinkIcon,
  type LucideIcon,
} from "lucide-react";
import { useSocials } from "@/hooks/useSocials";

interface Props {
  className?: string;
  size?: "sm" | "md";
}

export const ICON_MAP: Record<string, LucideIcon> = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  youtube: Youtube,
  twitch: Twitch,
  github: Github,
  linkedin: Linkedin,
  music: Music,
  send: Send,
  "message-circle": MessageCircle,
  mail: Mail,
  globe: Globe,
  rss: Rss,
  "book-open": BookOpen,
  "pen-tool": PenTool,
  feather: Feather,
  link: LinkIcon,
};

const SocialIcons = ({ className = "", size = "md" }: Props) => {
  const { socials } = useSocials();
  const visible = socials.filter((s) => s.url.trim());

  if (visible.length === 0) return null;

  const dim = size === "sm" ? "w-9 h-9" : "w-11 h-11";
  const iconSize = size === "sm" ? 16 : 18;

  return (
    <div className={`flex items-center flex-wrap gap-3 ${className}`}>
      {visible.map((s) => {
        const target = s.newTab ? "_blank" : undefined;
        const rel = s.newTab ? "noopener noreferrer" : undefined;
        const Icon = ICON_MAP[s.iconName];
        const useCustom = s.iconName === "custom" && s.iconImage;
        const label = s.label || "Link";

        return (
          <a
            key={s.id}
            href={s.url}
            target={target}
            rel={rel}
            aria-label={label}
            title={label}
            className={`group inline-flex items-center justify-center ${dim} rounded-full border border-border bg-background/60 text-foreground/70 hover:border-primary hover:bg-primary hover:text-primary-foreground transition-colors overflow-hidden`}
          >
            {useCustom ? (
              <img
                src={s.iconImage}
                alt={label}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : Icon ? (
              <Icon size={iconSize} strokeWidth={1.7} />
            ) : (
              <span className="font-label text-[10px] tracking-widest">
                {label.slice(0, 2).toUpperCase()}
              </span>
            )}
          </a>
        );
      })}
    </div>
  );
};

export default SocialIcons;
