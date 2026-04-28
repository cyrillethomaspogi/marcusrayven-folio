import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import authorPortrait from "@/assets/author-portrait.jpg";
import logoMark from "@/assets/marcus-rayven-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { useStories } from "@/hooks/useStories";
import { usePlaylist } from "@/hooks/usePlaylist";
import { usePlatforms } from "@/hooks/usePlatforms";
import ThemeToggle from "@/components/ThemeToggle";
import RichText from "@/components/RichText";

const navLinks = [
  { label: "Works", href: "#works" },
  { label: "About", href: "#about" },
  { label: "Find Me", href: "#profiles" },
  { label: "Blog", href: "#blog" },
  { label: "Contact", href: "#contact" },
];

interface Post {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  published_at: string | null;
  created_at: string;
}

const Index = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const { stories } = useStories();
  const { url: playlistUrl } = usePlaylist();
  const { platforms } = usePlatforms();
  const clickRef = useRef({ count: 0, timer: 0 as unknown as number });

  const handleSecretClick = () => {
    clickRef.current.count += 1;
    window.clearTimeout(clickRef.current.timer);
    clickRef.current.timer = window.setTimeout(() => {
      clickRef.current.count = 0;
    }, 1500);
    if (clickRef.current.count >= 5) {
      clickRef.current.count = 0;
      navigate("/admin");
    }
  };

  useEffect(() => {
    supabase
      .from("posts")
      .select("id, title, excerpt, content, published_at, created_at")
      .eq("published", true)
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(20)
      .then(({ data }) => setPosts((data ?? []) as Post[]));
  }, []);

  // Lock body scroll while mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);


  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* NAV */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-background/85 backdrop-blur-md border-b border-border/60 py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="container flex items-center justify-between">
          <a href="#top" className="flex items-center gap-2.5 font-display text-xl md:text-2xl tracking-tight">
            <img src={logoMark} alt="Marcus Rayven raven & quill mark" className="h-8 md:h-9 w-auto" />
            <span><span className="italic text-primary">M</span>arcus Rayven</span>
          </a>
          <nav className="hidden md:flex items-center gap-9">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="font-label text-[11px] text-foreground/70 hover:text-primary transition-colors"
              >
                {l.label}
              </a>
            ))}
            <ThemeToggle className="-mr-2" />
          </nav>
          <div className="flex items-center gap-1 md:hidden">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              className="w-11 h-11 inline-flex items-center justify-center text-foreground/80 hover:text-primary"
            >
              <Menu size={20} strokeWidth={1.6} />
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE DRAWER */}
      <div
        className={`fixed inset-0 z-[60] md:hidden transition-opacity duration-300 ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!menuOpen}
      >
        <div
          className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
        />
        <aside
          className={`absolute right-0 top-0 h-full w-[82%] max-w-sm bg-background border-l border-border shadow-page transform transition-transform duration-300 ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between p-5 border-b border-border/60">
            <span className="font-display text-xl">
              <span className="italic text-primary">M</span>arcus Rayven
            </span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="w-11 h-11 inline-flex items-center justify-center text-foreground/70 hover:text-primary"
            >
              <X size={20} strokeWidth={1.6} />
            </button>
          </div>
          <nav className="flex flex-col p-5">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="font-label text-xs tracking-[0.2em] text-foreground/80 hover:text-primary py-4 border-b border-border/40"
              >
                {l.label}
              </a>
            ))}
            <Link
              to="/guestbook"
              onClick={() => setMenuOpen(false)}
              className="font-label text-xs tracking-[0.2em] text-primary py-4"
            >
              Guestbook →
            </Link>
          </nav>
        </aside>
      </div>

      {/* HERO */}
      <section
        id="top"
        className="relative min-h-screen flex flex-col justify-center items-center px-6 overflow-hidden"
      >
        <div className="absolute inset-0 -z-10 opacity-[0.07] mix-blend-multiply"
          style={{
            backgroundImage:
              "radial-gradient(hsl(var(--ink)) 1px, transparent 1px)",
            backgroundSize: "3px 3px",
          }}
        />
        <div className="text-center max-w-5xl animate-fade-in">
          <p className="font-label text-[11px] text-primary mb-8 animate-fade-up">
            Author · Storyteller · Quiet Romantic
          </p>
          <h1 className="font-display text-[clamp(3.5rem,12vw,11rem)] leading-[0.95] tracking-tight text-ink animate-fade-up [animation-delay:120ms]">
            Marcus<br />
            <span className="italic font-light text-primary">Rayven</span>
          </h1>
          <div className="ornament mt-10 max-w-md mx-auto animate-fade-up [animation-delay:280ms]">
            <span className="font-label text-[10px]">est. mmxx</span>
          </div>
          <p className="mt-8 font-display italic text-2xl md:text-3xl text-ink-soft max-w-2xl mx-auto leading-snug animate-fade-up [animation-delay:380ms]">
            Stories that linger long after the last page.
          </p>
        </div>

        <a
          href="#about"
          className="absolute bottom-10 font-label text-[10px] text-foreground/50 hover:text-primary transition-colors animate-fade-in [animation-delay:900ms]"
          aria-label="Scroll to about"
        >
          ↓ Scroll
        </a>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-28 md:py-40">
        <div className="container max-w-6xl">
          <div className="grid md:grid-cols-12 gap-12 md:gap-20 items-center">
            <div className="md:col-span-5 reveal">
              <div className="relative">
                <div className="absolute -inset-4 border border-primary/30 -z-10" />
                <img
                  src={authorPortrait}
                  alt="Portrait of author Marcus Rayven by a window"
                  width={800}
                  height={1024}
                  loading="lazy"
                  className="w-full h-auto shadow-page object-cover aspect-[4/5] grayscale-[15%] sepia-[10%]"
                />
              </div>
            </div>

            <div className="md:col-span-7 reveal">
              <p className="font-label text-[11px] text-primary mb-5">About</p>
              <h2 className="font-display text-4xl md:text-5xl leading-tight mb-8">
                A writer of soft hauntings and stubborn affection.
              </h2>
              <div className="space-y-5 text-lg leading-relaxed text-ink-soft">
                <p>
                  Marcus Rayven is the pen name of a queer author writing primarily in BL fiction
                  and dark romance. His work moves between psychological intimacy and supernatural
                  ache — stories about men who love each other badly, beautifully, and often
                  too late.
                </p>
                <p>
                  He has been publishing serialized fiction on Wattpad since 2020, where his
                  novels have built a small, devoted readership. Off the page, he keeps too many
                  notebooks, drinks his coffee black, and lives somewhere it rains often.
                </p>
              </div>

              <div className="mt-12">
                <p className="pull-quote">
                  "I write the kind of love that doesn't fit into doorways — the kind that has
                  to be carried in sideways, broken, and slowly put back together."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FIND ME ON */}
      <section id="profiles" className="py-24 md:py-32">
        <div className="container max-w-5xl">
          <div className="text-center mb-14 reveal">
            <p className="font-label text-[11px] text-primary mb-4">Writing Profiles</p>
            <h2 className="font-display text-4xl md:text-5xl">Find Me On</h2>
          </div>
          {platforms.length === 0 ? (
            <p className="reveal text-center font-display italic text-xl text-ink-soft">
              New writing homes coming soon.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6 reveal">
              {platforms.map((p) => (
                <a
                  key={p.id}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-cream-deep/50 border border-border p-7 transition-all hover:-translate-y-1 hover:border-primary/60 hover:shadow-page flex gap-5 items-start"
                >
                  <div className="shrink-0 w-14 h-14 border border-primary/40 flex items-center justify-center font-display text-2xl italic text-primary">
                    {p.mark}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-2xl mb-1">{p.name}</h3>
                    <p className="font-label text-[10px] text-foreground/50 mb-3 tracking-widest">
                      {p.handle}
                    </p>
                    <p className="text-ink-soft text-sm leading-relaxed mb-5">{p.line}</p>
                    <span className="inline-block font-label text-[11px] tracking-[0.2em] text-primary border-b border-primary/40 pb-1 group-hover:border-primary">
                      Visit Profile →
                    </span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* WORKS */}
      <section id="works" className="py-28 md:py-40 bg-cream-deep/60">
        <div className="container max-w-6xl">
          <div className="text-center mb-20 reveal">
            <p className="font-label text-[11px] text-primary mb-4">Works</p>
            <h2 className="font-display text-5xl md:text-6xl">Selected Stories</h2>
            <div className="ornament mt-6 max-w-xs mx-auto">
              <span className="font-display italic text-sm text-foreground/50">novels & novelettes</span>
            </div>
          </div>

          {stories.length === 0 ? (
            <div className="reveal max-w-xl mx-auto text-center">
              <p className="font-display italic text-2xl md:text-3xl text-ink-soft leading-relaxed mb-8">
                New stories arriving soon.
              </p>
              <p className="text-ink-soft leading-relaxed">
                The shelf is being arranged. Expect novelettes, longer works, and a few
                quieter experiments — drift back in a little while.
              </p>
              <div className="ornament mt-12">
                <span className="font-label text-[10px] text-foreground/50">in progress</span>
              </div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
              {stories.map((s, i) => (
                <article
                  key={s.id}
                  className="reveal bg-background/60 border border-border/70 transition-all hover:-translate-y-1 hover:shadow-page"
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  <div className="aspect-[3/4] overflow-hidden bg-cream-deep">
                    {s.cover ? (
                      <img
                        src={s.cover}
                        alt={`Cover of ${s.title}`}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-display italic text-foreground/40">
                        {s.title}
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    {s.genre && (
                      <span className="inline-block font-label text-[9px] tracking-widest text-primary border border-primary/40 px-2 py-0.5 mb-3">
                        {s.genre}
                      </span>
                    )}
                    <h3 className="font-display text-2xl leading-tight mb-3">{s.title}</h3>
                    {s.blurb && (
                      <p className="text-ink-soft text-sm leading-relaxed mb-4">{s.blurb}</p>
                    )}
                    <p className="font-label text-[10px] text-foreground/50 tracking-widest">
                      Published on {s.platform}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* BLOG */}
      <section id="blog" className="py-28 md:py-40">
        <div className="container max-w-3xl">
          <div className="reveal mb-16">
            <p className="font-label text-[11px] text-primary mb-4">Journal</p>
            <h2 className="font-display text-5xl md:text-6xl mb-5">From the Notebook</h2>
            <div className="h-px bg-foreground/20 w-full" />
          </div>

          {posts.length === 0 ? (
            <div className="reveal text-center py-12">
              <p className="font-display italic text-xl text-ink-soft">
                The notebook is open. First entry coming soon.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-foreground/15">
              {posts.map((p, i) => {
                const date = new Date(p.published_at ?? p.created_at).toLocaleDateString(
                  "en-US",
                  { year: "numeric", month: "long", day: "2-digit" }
                );
                return (
                  <article
                    key={p.id}
                    className="py-10 first:pt-0 reveal"
                    style={{ transitionDelay: `${i * 100}ms` }}
                  >
                    <p className="font-label text-[10px] text-foreground/50 mb-3">{date}</p>
                    <h3 className="font-display text-3xl md:text-[2.2rem] leading-snug mb-4 hover:text-primary transition-colors cursor-pointer">
                      {p.title}
                    </h3>
                    {p.excerpt && (
                      <p className="text-lg leading-relaxed text-ink-soft mb-5 max-w-2xl">
                        {p.excerpt}
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* PLAYLIST */}
      <section id="playlist" className="py-24 md:py-32">
        <div className="container max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            <div className="reveal order-2 md:order-1">
              <div className="rounded-xl overflow-hidden border border-border/60 shadow-card bg-card h-[280px] md:h-[380px]">
                <iframe
                  key={playlistUrl}
                  title="Marcus Rayven writing playlist"
                  src={playlistUrl}
                  loading="lazy"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  allowFullScreen
                  className="block w-full h-full"
                  style={{ border: 0 }}
                />
              </div>
            </div>

            <div className="reveal order-1 md:order-2">
              <p className="font-label text-[11px] text-primary mb-5">Now Playing</p>
              <h2 className="font-display text-4xl md:text-5xl leading-tight mb-8">
                The Soundtrack to <span className="italic text-primary">Every Story</span>.
              </h2>
              <p className="text-lg leading-relaxed text-ink-soft mb-6">
                Every manuscript has a playlist. These are the songs that lived inside
                the words — the ones that played on loop while the characters bled onto
                the page.
              </p>
              <p className="font-display italic text-base text-foreground/60">
                Playlist updates with every new project.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-28 md:py-40 bg-cream-deep/60">
        <div className="container max-w-3xl">
          <div className="reveal text-center">
            <p className="font-label text-[11px] text-primary mb-5">Contact</p>
            <h2 className="font-display text-5xl md:text-6xl mb-6">
              Let's talk about <span className="italic text-primary">stories</span>.
            </h2>
            <p className="text-lg text-ink-soft leading-relaxed max-w-lg mx-auto mb-14">
              For correspondence, collaboration, or just to tell me which character broke
              your heart — the door is always open.
            </p>
          </div>

          {/* Find me here */}
          <div className="reveal mb-16">
            <p className="font-label text-[11px] text-primary mb-6 text-center">Find me here</p>
            <div className="flex flex-col items-center gap-4">
              <a
                href="https://wattpad.com/user/redlinedboi"
                target="_blank"
                rel="noopener noreferrer"
                className="font-display text-xl md:text-2xl italic hover:text-primary transition-colors"
              >
                Wattpad <span className="text-foreground/50">— @redlinedboi</span>
              </a>
              <a
                href="https://www.dreame.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-display text-xl md:text-2xl italic hover:text-primary transition-colors"
              >
                Dreame <span className="text-foreground/50">— Marcus Rayven</span>
              </a>
              <a
                href="mailto:marcusraaayven@gmail.com"
                className="font-display text-xl md:text-2xl italic hover:text-primary transition-colors"
              >
                Email <span className="text-foreground/50">— marcusraaayven@gmail.com</span>
              </a>
            </div>
          </div>

          {/* Guestbook CTA */}
          <div className="reveal max-w-2xl mx-auto text-center">
            <div className="ornament mb-10">
              <span className="font-label text-[10px] text-foreground/50">or sign the book</span>
            </div>
            <p className="font-display italic text-2xl md:text-3xl text-ink-soft leading-relaxed mb-8">
              Leave a quiet note in the guestbook — no email, no account, just a nickname and a thought.
            </p>
            <Link
              to="/guestbook"
              className="inline-block font-label text-[11px] tracking-[0.2em] text-primary border border-primary/40 hover:bg-primary hover:text-primary-foreground px-10 py-4 transition-colors"
            >
              Open the Guestbook
            </Link>

            <div className="ornament mt-16 max-w-xs mx-auto">
              <span className="font-label text-[10px] text-foreground/50">fin</span>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 border-t border-border/50">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="font-label text-[10px] text-foreground/60">
            © Marcus Rayven. All rights reserved.
          </p>
          <p
            className="font-display italic text-sm text-foreground/50 cursor-default select-none"
            onClick={handleSecretClick}
            title=""
          >
            Set in Cormorant & Lora.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
