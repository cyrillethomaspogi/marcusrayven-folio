import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { useEffect } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

const ToolbarBtn = ({
  active,
  onClick,
  label,
  title,
}: {
  active?: boolean;
  onClick: () => void;
  label: string;
  title: string;
}) => (
  <button
    type="button"
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    title={title}
    className={`font-label text-[11px] px-2 py-1 border transition-colors ${
      active
        ? "border-primary text-primary bg-primary/10"
        : "border-border text-foreground/70 hover:border-primary"
    }`}
  >
    {label}
  </button>
);

const Toolbar = ({ editor }: { editor: Editor }) => {
  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-border bg-background/50">
      <ToolbarBtn
        title="Bold"
        label="B"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      />
      <ToolbarBtn
        title="Italic"
        label="I"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      />
      <ToolbarBtn
        title="Strike"
        label="S"
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      />
      <span className="w-px bg-border mx-1" />
      <ToolbarBtn
        title="Heading 2"
        label="H2"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      />
      <ToolbarBtn
        title="Heading 3"
        label="H3"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      />
      <ToolbarBtn
        title="Quote"
        label="“ ”"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      />
      <span className="w-px bg-border mx-1" />
      <ToolbarBtn
        title="Bulleted list"
        label="• List"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      />
      <ToolbarBtn
        title="Numbered list"
        label="1. List"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      />
      <span className="w-px bg-border mx-1" />
      <ToolbarBtn
        title="Add link"
        label="Link"
        active={editor.isActive("link")}
        onClick={() => {
          const prev = editor.getAttributes("link").href as string | undefined;
          const url = window.prompt("URL", prev ?? "https://");
          if (url === null) return;
          if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
          }
          editor
            .chain()
            .focus()
            .extendMarkRange("link")
            .setLink({ href: url })
            .run();
        }}
      />
      <ToolbarBtn
        title="Clear formatting"
        label="✕"
        onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
      />
    </div>
  );
};

const RichTextEditor = ({
  value,
  onChange,
  placeholder,
  minHeight = 160,
}: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "prose-rich focus:outline-none px-4 py-3 font-body leading-relaxed",
        style: `min-height:${minHeight}px`,
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // Tiptap returns "<p></p>" for empty — normalize
      onChange(html === "<p></p>" ? "" : html);
    },
  });

  // Keep editor in sync when value changes externally (e.g. switching items)
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const incoming = value || "";
    if (incoming !== current && incoming !== (current === "<p></p>" ? "" : current)) {
      editor.commands.setContent(incoming, { emitUpdate: false });
    }
  }, [value, editor]);

  return (
    <div className="border border-border bg-background focus-within:border-primary">
      {editor && <Toolbar editor={editor} />}
      <EditorContent editor={editor} />
      {placeholder && !value && (
        <div className="px-4 -mt-[1px] pointer-events-none font-label text-[10px] text-foreground/40">
          {placeholder}
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
