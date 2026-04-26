import { useEffect, useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Entry {
  id: string;
  nickname: string;
  message: string;
  created_at: string;
}

const Guestbook = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [nickname, setNickname] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("guestbook_entries")
      .select("id, nickname, message, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    setEntries((data ?? []) as Entry[]);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const nick = nickname.trim();
    const msg = message.trim();
    if (!nick || !msg) {
      toast.error("Please add a nickname and a message.");
      return;
    }
    if (nick.length > 40) {
      toast.error("Nickname must be 40 characters or fewer.");
      return;
    }
    if (msg.length > 1000) {
      toast.error("Message must be 1000 characters or fewer.");
      return;
    }
    setSending(true);
    const { error } = await supabase
      .from("guestbook_entries")
      .insert({ nickname: nick, message: msg });
    setSending(false);
    if (error) {
      toast.error("Couldn't leave your note. Please try again.");
      return;
    }
    toast.success("Thank you for signing the book.");
    setNickname("");
    setMessage("");
    load();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="py-8 border-b border-border/50">
        <div className="container flex items-center justify-between">
          <Link to="/" className="font-display text-xl md:text-2xl tracking-tight">
            <span className="italic text-primary">M</span>arcus Rayven
          </Link>
          <Link
            to="/"
            className="font-label text-[11px] text-foreground/70 hover:text-primary transition-colors"
          >
            ← Back
          </Link>
        </div>
      </header>

      <section className="py-20 md:py-28">
        <div className="container max-w-2xl">
          <div className="text-center mb-14">
            <p className="font-label text-[11px] text-primary mb-4">Guestbook</p>
            <h1 className="font-display text-5xl md:text-6xl mb-5">Sign the book.</h1>
            <p className="text-lg text-ink-soft leading-relaxed max-w-lg mx-auto">
              Leave a note, a quiet thought, or just a name passing through.
              No account needed — pick whatever nickname you like.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mb-20">
            <div>
              <label
                htmlFor="nickname"
                className="font-label text-[10px] text-foreground/60 block mb-2"
              >
                Nickname
              </label>
              <input
                id="nickname"
                type="text"
                required
                maxLength={40}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="anonymous reader"
                className="w-full bg-transparent border-b border-foreground/30 focus:border-primary outline-none py-2 font-display text-lg transition-colors placeholder:text-foreground/30"
              />
            </div>
            <div>
              <label
                htmlFor="message"
                className="font-label text-[10px] text-foreground/60 block mb-2"
              >
                Message
              </label>
              <textarea
                id="message"
                required
                maxLength={1000}
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="say something..."
                className="w-full bg-transparent border-b border-foreground/30 focus:border-primary outline-none py-2 font-display text-lg leading-relaxed resize-none transition-colors placeholder:text-foreground/30"
              />
              <p className="font-label text-[10px] text-foreground/50 mt-2 text-right">
                {message.length} / 1000
              </p>
            </div>
            <div className="text-center pt-2">
              <button
                type="submit"
                disabled={sending}
                className="font-label text-[11px] tracking-[0.2em] text-primary border border-primary/40 hover:bg-primary hover:text-primary-foreground px-10 py-4 transition-colors disabled:opacity-50"
              >
                {sending ? "Signing…" : "Sign the book"}
              </button>
            </div>
          </form>

          <div className="ornament mb-12">
            <span className="font-label text-[10px] text-foreground/50">
              {entries.length === 0 ? "first to sign" : `${entries.length} note${entries.length === 1 ? "" : "s"}`}
            </span>
          </div>

          {entries.length === 0 ? (
            <p className="font-display italic text-xl text-ink-soft text-center py-8">
              The book is open, the page is blank.
            </p>
          ) : (
            <ul className="divide-y divide-foreground/15">
              {entries.map((entry) => {
                const date = new Date(entry.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "2-digit",
                });
                return (
                  <li key={entry.id} className="py-8">
                    <div className="flex items-baseline justify-between gap-4 mb-3">
                      <p className="font-display italic text-xl text-primary">
                        {entry.nickname}
                      </p>
                      <p className="font-label text-[10px] text-foreground/50 shrink-0">
                        {date}
                      </p>
                    </div>
                    <p className="text-base md:text-lg leading-relaxed text-ink-soft whitespace-pre-wrap">
                      {entry.message}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <footer className="py-10 border-t border-border/50">
        <div className="container text-center">
          <p className="font-label text-[10px] text-foreground/60">
            © Marcus Rayven. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Guestbook;
