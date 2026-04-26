import { useEffect, useState } from "react";
import authorPortrait from "@/assets/author-portrait.jpg";
import coverWhatever from "@/assets/cover-whatever.jpg";
import coverCartographer from "@/assets/cover-cartographer.jpg";
import coverShape from "@/assets/cover-shape.jpg";
import coverAlpha from "@/assets/cover-alpha.jpg";

const navLinks = [
  { label: "Works", href: "#works" },
  { label: "About", href: "#about" },
  { label: "Blog", href: "#blog" },
  { label: "Contact", href: "#contact" },
];

const works = [
  {
    title: "Whatever You Leave Behind",
    genre: "BL Novelette",
    blurb:
      "A quiet meditation on absence — two boys, one summer, and the small wreckage left behind when love refuses to be named.",
    cover: coverWhatever,
  },
  {
    title: "Cartographer of Endings",
    genre: "Dark BL · Psychological",
    blurb:
      "He maps the places people die. When a stranger walks into his life carrying the same coordinates, the line between obsession and devotion begins to blur.",
    cover: coverCartographer,
  },
  {
    title: "The Shape You Left Behind",
    genre: "Supernatural BL",
    blurb:
      "A year after his lover vanishes, Ren begins to see him again — in mirrors, in doorways, in the breath between sleep and waking.",
    cover: coverShape,
  },
  {
    title: "My Fearsome Alpha is a Puppy?!",
    genre: "Omegaverse · Wattpad",
    blurb:
      "He's the most feared alpha in three districts. He's also, apparently, terrified of thunderstorms. A tender, ridiculous, thoroughly self-indulgent romance.",
    cover: coverAlpha,
  },
];

const posts = [
  {
    date: "April 18, 2026",
    title: "On Writing Tenderness Inside the Dark",
    excerpt:
      "Some readers ask why my thrillers feel so quiet. The honest answer is that I don't believe cruelty and tenderness live in separate rooms — they share a wall, and I keep my ear pressed to it.",
  },
  {
    date: "March 02, 2026",
    title: "A Note on the New Novelette",
    excerpt:
      "Whatever You Leave Behind began as a single sentence I wrote on a napkin in Lisbon: 'He kept the spare key long after the door was gone.' Everything else followed from there.",
  },
  {
    date: "February 14, 2026",
    title: "Why I Still Write on Wattpad",
    excerpt:
      "There is a particular intimacy to writing in public, chapter by chapter, while readers leave inline comments like footprints in wet sand. I'm not ready to give that up.",
  },
];

const Index = () => {
  const [scrolled, setScrolled] = useState(false);

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
          <a href="#top" className="font-display text-xl md:text-2xl tracking-tight">
            <span className="italic text-primary">M</span>arcus Rayven
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
          </nav>
          <a
            href="#contact"
            className="md:hidden font-label text-[11px] text-primary"
          >
            Menu
          </a>
        </div>
      </header>

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

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12">
            {works.map((w, i) => (
              <article
                key={w.title}
                className="reveal group flex flex-col"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="relative overflow-hidden bg-muted shadow-card mb-6 aspect-[3/4]">
                  <img
                    src={w.cover}
                    alt={`Cover for ${w.title}`}
                    width={800}
                    height={1100}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent opacity-60" />
                </div>
                <span className="inline-block self-start font-label text-[10px] text-primary bg-primary/10 px-3 py-1 mb-4 rounded-full">
                  {w.genre}
                </span>
                <h3 className="font-display text-2xl md:text-[1.7rem] leading-tight mb-3">
                  {w.title}
                </h3>
                <p className="text-ink-soft leading-relaxed mb-5 flex-1">{w.blurb}</p>
                <a
                  href="#contact"
                  className="font-label text-[11px] text-foreground/70 hover:text-primary transition-colors self-start border-b border-foreground/20 hover:border-primary pb-1"
                >
                  Read More →
                </a>
              </article>
            ))}
          </div>
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

          <div className="divide-y divide-foreground/15">
            {posts.map((p, i) => (
              <article
                key={p.title}
                className="py-10 first:pt-0 reveal"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <p className="font-label text-[10px] text-foreground/50 mb-3">{p.date}</p>
                <h3 className="font-display text-3xl md:text-[2.2rem] leading-snug mb-4 hover:text-primary transition-colors cursor-pointer">
                  {p.title}
                </h3>
                <p className="text-lg leading-relaxed text-ink-soft mb-5 max-w-2xl">
                  {p.excerpt}
                </p>
                <a
                  href="#"
                  className="font-label text-[11px] text-primary border-b border-primary/40 hover:border-primary pb-1"
                >
                  Continue Reading →
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-28 md:py-40 bg-cream-deep/60">
        <div className="container max-w-2xl text-center">
          <div className="reveal">
            <p className="font-label text-[11px] text-primary mb-5">Contact</p>
            <h2 className="font-display text-5xl md:text-6xl mb-6">
              Let's talk about <span className="italic text-primary">stories</span>.
            </h2>
            <p className="text-lg text-ink-soft leading-relaxed max-w-lg mx-auto mb-12">
              For correspondence, collaboration, or just to tell me which character broke
              your heart — the door is always open.
            </p>

            <div className="flex flex-col items-center gap-5">
              <a
                href="https://wattpad.com/user/redlinedboi"
                target="_blank"
                rel="noopener noreferrer"
                className="font-display text-2xl md:text-3xl italic hover:text-primary transition-colors"
              >
                Wattpad <span className="text-foreground/50">— @redlinedboi</span>
              </a>
              <a
                href="#"
                className="font-display text-2xl md:text-3xl italic hover:text-primary transition-colors"
              >
                TikTok <span className="text-foreground/50">— @marcusrayven</span>
              </a>
              <a
                href="mailto:hello@marcusrayven.com"
                className="font-display text-2xl md:text-3xl italic hover:text-primary transition-colors"
              >
                hello@marcusrayven.com
              </a>
            </div>

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
          <p className="font-display italic text-sm text-foreground/50">
            Set in Cormorant & Lora.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
