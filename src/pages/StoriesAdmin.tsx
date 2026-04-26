import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useStories, type Story } from "@/hooks/useStories";

const ADMIN_PASSWORD = "rayven2020";
const AUTH_KEY = "mr.stories.admin.auth";

const empty: Omit<Story, "id"> = {
  title: "",
  genre: "",
  blurb: "",
  platform: "Wattpad",
  cover: "",
};

const StoriesAdmin = () => {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(AUTH_KEY) === "1");
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState("");

  const { stories, addStory, updateStory, deleteStory } = useStories();
  const [editing, setEditing] = useState<Story | (Omit<Story, "id"> & { id?: string }) | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = "Stories Admin · Marcus Rayven";
  }, []);

  const tryLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, "1");
      setAuthed(true);
      setPwError("");
    } else {
      setPwError("Incorrect password.");
    }
  };

  const logout = () => {
    sessionStorage.removeItem(AUTH_KEY);
    setAuthed(false);
    setPw("");
  };

  const handleCover = (file: File) => {
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      alert("Image too large (max 3MB).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (editing) setEditing({ ...editing, cover: String(reader.result) });
    };
    reader.readAsDataURL(file);
  };

  const save = () => {
    if (!editing) return;
    if (!editing.title.trim()) {
      alert("Title is required.");
      return;
    }
    if (editing.id) {
      updateStory(editing.id, editing);
    } else {
      addStory({
        title: editing.title,
        genre: editing.genre,
        blurb: editing.blurb,
        platform: editing.platform,
        cover: editing.cover,
      });
    }
    setEditing(null);
  };

  const remove = (id: string, title: string) => {
    if (confirm(`Delete "${title}"? This cannot be undone.`)) {
      deleteStory(id);
    }
  };

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-background">
        <form onSubmit={tryLogin} className="max-w-sm w-full text-center">
          <p className="font-label text-[10px] text-primary mb-3">Private</p>
          <h1 className="font-display text-4xl mb-8">Stories Desk</h1>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Password"
            autoFocus
            className="w-full bg-cream-deep/40 border border-border px-4 py-3 font-body focus:outline-none focus:border-primary mb-3"
          />
          {pwError && <p className="text-destructive text-xs mb-3">{pwError}</p>}
          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground font-label text-xs tracking-widest px-6 py-3 hover:bg-primary/90"
          >
            Enter
          </button>
          <Link
            to="/"
            className="block mt-8 font-label text-[10px] text-foreground/60 hover:text-primary"
          >
            ← Back to site
          </Link>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-6 py-12">
      <div className="container max-w-5xl">
        <div className="flex items-center justify-between mb-12">
          <div>
            <p className="font-label text-[10px] text-primary mb-2">Private · Stories</p>
            <h1 className="font-display text-4xl md:text-5xl">Stories Desk</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="font-label text-[10px] text-foreground/60 hover:text-primary">
              View site
            </Link>
            <button
              onClick={logout}
              className="font-label text-[10px] text-foreground/60 hover:text-primary"
            >
              Lock
            </button>
          </div>
        </div>

        {editing ? (
          <div className="bg-cream-deep/40 border border-border p-8">
            <h2 className="font-display text-2xl mb-6">
              {editing.id ? "Edit story" : "New story"}
            </h2>
            <div className="grid md:grid-cols-[200px_1fr] gap-8">
              {/* Cover */}
              <div>
                <label className="font-label text-[10px] text-foreground/60 block mb-2">
                  Cover (3:4)
                </label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="aspect-[3/4] bg-background border border-border cursor-pointer hover:border-primary flex items-center justify-center overflow-hidden"
                >
                  {editing.cover ? (
                    <img src={editing.cover} alt="cover preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-label text-[10px] text-foreground/50 px-4 text-center">
                      Click to upload
                    </span>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleCover(e.target.files[0])}
                />
                {editing.cover && (
                  <button
                    onClick={() => setEditing({ ...editing, cover: "" })}
                    className="font-label text-[10px] text-destructive mt-2 hover:underline"
                  >
                    Remove cover
                  </button>
                )}
              </div>

              {/* Fields */}
              <div className="space-y-5">
                <div>
                  <label className="font-label text-[10px] text-foreground/60 block mb-2">Title</label>
                  <input
                    type="text"
                    value={editing.title}
                    onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                    className="w-full bg-background border border-border px-4 py-3 font-display text-xl focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="font-label text-[10px] text-foreground/60 block mb-2">
                    Genre tag
                  </label>
                  <input
                    type="text"
                    value={editing.genre}
                    onChange={(e) => setEditing({ ...editing, genre: e.target.value })}
                    placeholder="BL · Dark Romance · Omegaverse"
                    className="w-full bg-background border border-border px-4 py-3 font-body focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="font-label text-[10px] text-foreground/60 block mb-2">Blurb</label>
                  <textarea
                    value={editing.blurb}
                    onChange={(e) => setEditing({ ...editing, blurb: e.target.value })}
                    rows={4}
                    className="w-full bg-background border border-border px-4 py-3 font-body focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="font-label text-[10px] text-foreground/60 block mb-2">
                    Published on
                  </label>
                  <select
                    value={editing.platform}
                    onChange={(e) => setEditing({ ...editing, platform: e.target.value })}
                    className="w-full bg-background border border-border px-4 py-3 font-body focus:outline-none focus:border-primary"
                  >
                    <option>Wattpad</option>
                    <option>Dreame</option>
                    <option>Original / Unpublished</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={save}
                    className="bg-primary text-primary-foreground font-label text-xs px-6 py-3 hover:bg-primary/90"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditing(null)}
                    className="font-label text-xs px-6 py-3 border border-border hover:border-primary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <button
              onClick={() => setEditing({ ...empty })}
              className="bg-primary text-primary-foreground font-label text-xs px-6 py-3 hover:bg-primary/90 mb-10"
            >
              + New story
            </button>

            {stories.length === 0 ? (
              <p className="text-ink-soft italic font-display text-xl">No stories yet. Begin.</p>
            ) : (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                {stories.map((s) => (
                  <article key={s.id} className="bg-cream-deep/40 border border-border">
                    <div className="aspect-[3/4] bg-background overflow-hidden">
                      {s.cover ? (
                        <img src={s.cover} alt={s.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-label text-[10px] text-foreground/40">
                          no cover
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-display text-lg leading-tight mb-1 truncate">{s.title}</h3>
                      {s.genre && (
                        <span className="inline-block font-label text-[9px] tracking-widest text-primary border border-primary/30 px-2 py-0.5 mb-2">
                          {s.genre}
                        </span>
                      )}
                      <p className="font-label text-[10px] text-foreground/50 mb-3">
                        Published on {s.platform}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditing(s)}
                          className="flex-1 font-label text-[10px] px-3 py-2 border border-border hover:border-primary"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => remove(s.id, s.title)}
                          className="flex-1 font-label text-[10px] px-3 py-2 text-destructive border border-transparent hover:border-destructive"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StoriesAdmin;
