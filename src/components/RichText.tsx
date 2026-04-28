import DOMPurify from "dompurify";
import { useMemo } from "react";

interface RichTextProps {
  html: string;
  className?: string;
}

const RichText = ({ html, className }: RichTextProps) => {
  const clean = useMemo(
    () =>
      DOMPurify.sanitize(html || "", {
        ALLOWED_TAGS: [
          "p", "br", "strong", "em", "s", "u", "code",
          "h1", "h2", "h3", "h4",
          "ul", "ol", "li",
          "blockquote", "pre",
          "a",
        ],
        ALLOWED_ATTR: ["href", "target", "rel"],
      }),
    [html],
  );
  return (
    <div
      className={`prose-rich ${className ?? ""}`}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
};

export default RichText;
