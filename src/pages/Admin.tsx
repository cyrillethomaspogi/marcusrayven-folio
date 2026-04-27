import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import { useStories, type Story } from "@/hooks/useStories";
import { usePlaylist, DEFAULT_PLAYLIST_URL } from "@/hooks/usePlaylist";

interface Post {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

const emptyPost = { title: "", excerpt: "", content: "", published: false };
const emptyStory: Omit<Story, "id"> = {
  title: "",
  genre: "",
  blurb: "",
  platform: "Wattpad",
  cover: "",
};

type Tab = "posts" | "stories" | "playlist";

const Admin = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [adminCount, setAdminCount] = useState<number | null>(null);
  const [tab, setTab] = useState<Tab>("posts");

  // Posts state
  const [posts, setPosts] = useState<Post[]>([]);
  const [editingPost, setEditingPost] = useState<Post | typeof emptyPost | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stories state
  const { stories, addStory, updateStory, deleteStory } = useStories();
  const [editingStory, setEditingStory] = useState<
    Story | (Omit<Story, "id"> & { id?: string }) | null
  >(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Playlist state
  const { url: playlistUrl, save: savePlaylist, reset: resetPlaylist } = usePlaylist();
  const [playlistInput, setPlaylistInput] = useState(playlistUrl);
  const [playlistSaved, setPlaylistSaved] = useState(false);

  useEffect(() => {
    setPlaylistInput(playlistUrl);
  }, [playlistUrl]);

  // Auth + admin check
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session === null) return;
    if (!session) {
      navigate("/auth", { replace: true });
      return;
    }

    (async () => {
      const { count } = await supabase
        .from("user_roles")
        .select("*", { count: "exact", head: true })
        .eq("role", "admin");
      setAdminCount(count ?? 0);

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();

      setIsAdmin(!!roles);
    })();
  }, [session, navigate]);

  const claimAdmin = async () => {
    if (!session) return;
    setBusy(true);
    setError(null);
    const { error } = await supabase
      .from("user_roles")
      .insert({ user_id: session.user.id, role: "admin" });
    if (error) setError(error.message);
    else {
      setIsAdmin(true);
      setAdminCount(1);
    }
    setBusy(false);
  };

  const loadPosts = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    else setPosts((data ?? []) as Post[]);
  };

  useEffect(() => {
    if (isAdmin) loadPosts();
  }, [isAdmin]);

  const savePost = async () => {
    if (!editingPost) return;
    setBusy(true);
    setError(null);

    const payload = {
      title: editingPost.title,
      excerpt: editingPost.excerpt,
      content: editingPost.content,
      published: editingPost.published,
      published_at: editingPost.published
        ? ("published_at" in editingPost && editingPost.published_at) ||
          new Date().toISOString()
        : null,
    };

    if ("id" in editingPost && editingPost.id) {
      const { error } = await supabase.from("posts").update(payload).eq("id", editingPost.id);
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.from("posts").insert(payload);
      if (error) setError(error.message);
    }

    setBusy(false);
    if (!error) {
      setEditingPost(null);
      loadPosts();
    }
  };

  const removePost = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) setError(error.message);
    else loadPosts();
  };

  // Story handlers
  const handleCover = (file: File) => {
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      alert("Image too large (max 3MB).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (editingStory) setEditingStory({ ...editingStory, cover: String(reader.result) });
    };
    reader.readAsDataURL(file);
  };

  const saveStory = () => {
    if (!editingStory) return;
    if (!editingStory.title.trim()) {
      alert("Title is required.");
      return;
    }
    if (editingStory.id) {
      updateStory(editingStory.id, editingStory);
    } else {
      addStory({
        title: editingStory.title,
        genre: editingStory.genre,
        blurb: editingStory.blurb,
        platform: editingStory.platform,
        cover: editingStory.cover,
      });
    }
    setEditingStory(null);
  };

  const removeStory = (id: string, title: string) => {
    if (confirm(`Delete "${title}"? This cannot be undone.`)) {
      deleteStory(id);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth", { replace: true });
  };

  if (session === null || isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center text-ink-soft">
        Loading…
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="font-display text-4xl mb-4">Access required</h1>
          {adminCount === 0 ? (
            <>
              <p className="text-ink-soft mb-8">
                No author account exists yet. Claim this account as the owner to begin writing.
              </p>
              {error && <p className="text-destructive text-sm mb-4">{error}</p>}
              <button
                onClick={claimAdmin}
                disabled={busy}
                className="bg-primary text-primary-foreground font-label text-xs px-6 py-3 hover:bg-primary/90 disabled:opacity-50"
              >
                Claim author account
              </button>
            </>
          ) : (
            <p className="text-ink-soft mb-8">
              This account doesn't have author access. Sign in with the owner account.
            </p>
          )}
          <button
            onClick={signOut}
            className="font-label text-[10px] text-foreground/60 hover:text-primary mt-8 block mx-auto"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  const tabBtn = (id: Tab, label: string) => (
    <button
      onClick={() => {
        setTab(id);
        setEditingPost(null);
        setEditingStory(null);
      }}
      className={`font-label text-[10px] tracking-widest px-4 py-2 border-b-2 transition-colors ${
        tab === id
          ? "border-primary text-primary"
          : "border-transparent text-foreground/50 hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="container max-w-5xl">
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="font-label text-[10px] text-primary mb-2">Private · Author</p>
            <h1 className="font-display text-4xl md:text-5xl">Writing Desk</h1>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" className="font-label text-[10px] text-foreground/60 hover:text-primary">
              View site
            </a>
            <button
              onClick={signOut}
              className="font-label text-[10px] text-foreground/60 hover:text-primary"
            >
              Sign out
            </button>
          </div>
        </div>

        <div className="flex gap-2 border-b border-border mb-10">
          {tabBtn("posts", "Posts")}
          {tabBtn("stories", "Stories")}
          {tabBtn("playlist", "Playlist")}
        </div>

        {error && <p className="text-destructive text-sm mb-6">{error}</p>}

        {/* POSTS TAB */}
        {tab === "posts" && (
          <>
            {editingPost ? (
              <div className="bg-cream-deep/40 border border-border p-8">
                <h2 className="font-display text-2xl mb-6">
                  {"id" in editingPost && editingPost.id ? "Edit post" : "New post"}
                </h2>
                <div className="space-y-5">
                  <div>
                    <label className="font-label text-[10px] text-foreground/60 block mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={editingPost.title}
                      onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                      className="w-full bg-background border border-border px-4 py-3 font-display text-2xl focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="font-label text-[10px] text-foreground/60 block mb-2">
                      Excerpt
                    </label>
                    <textarea
                      value={editingPost.excerpt}
                      onChange={(e) =>
                        setEditingPost({ ...editingPost, excerpt: e.target.value })
                      }
                      rows={2}
                      className="w-full bg-background border border-border px-4 py-3 font-body focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="font-label text-[10px] text-foreground/60 block mb-2">
                      Content
                    </label>
                    <textarea
                      value={editingPost.content}
                      onChange={(e) =>
                        setEditingPost({ ...editingPost, content: e.target.value })
                      }
                      rows={14}
                      className="w-full bg-background border border-border px-4 py-3 font-body leading-relaxed focus:outline-none focus:border-primary"
                    />
                  </div>
                  <label className="flex items-center gap-3 font-label text-xs">
                    <input
                      type="checkbox"
                      checked={editingPost.published}
                      onChange={(e) =>
                        setEditingPost({ ...editingPost, published: e.target.checked })
                      }
                      className="accent-primary"
                    />
                    Publish (visible to visitors)
                  </label>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={savePost}
                      disabled={busy || !editingPost.title.trim()}
                      className="bg-primary text-primary-foreground font-label text-xs px-6 py-3 hover:bg-primary/90 disabled:opacity-50"
                    >
                      {busy ? "Saving…" : "Save"}
                    </button>
                    <button
                      onClick={() => setEditingPost(null)}
                      className="font-label text-xs px-6 py-3 border border-border hover:border-primary"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setEditingPost({ ...emptyPost })}
                  className="bg-primary text-primary-foreground font-label text-xs px-6 py-3 hover:bg-primary/90 mb-10"
                >
                  + New post
                </button>

                {posts.length === 0 ? (
                  <p className="text-ink-soft italic font-display text-xl">
                    No posts yet. Begin.
                  </p>
                ) : (
                  <div className="divide-y divide-border">
                    {posts.map((p) => (
                      <article
                        key={p.id}
                        className="py-6 flex items-start justify-between gap-6"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <span
                              className={`font-label text-[9px] px-2 py-0.5 rounded-full ${
                                p.published
                                  ? "bg-primary/15 text-primary"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {p.published ? "Published" : "Draft"}
                            </span>
                            <span className="font-label text-[10px] text-foreground/50">
                              {new Date(p.updated_at).toLocaleDateString()}
                            </span>
                          </div>
                          <h3 className="font-display text-2xl truncate">{p.title}</h3>
                          {p.excerpt && (
                            <p className="text-ink-soft text-sm mt-1 line-clamp-2">
                              {p.excerpt}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => setEditingPost(p)}
                            className="font-label text-[10px] px-3 py-2 border border-border hover:border-primary"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => removePost(p.id)}
                            className="font-label text-[10px] px-3 py-2 text-destructive border border-transparent hover:border-destructive"
                          >
                            Delete
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* STORIES TAB */}
        {tab === "stories" && (
          <>
            {editingStory ? (
              <div className="bg-cream-deep/40 border border-border p-8">
                <h2 className="font-display text-2xl mb-6">
                  {editingStory.id ? "Edit story" : "New story"}
                </h2>
                <div className="grid md:grid-cols-[200px_1fr] gap-8">
                  <div>
                    <label className="font-label text-[10px] text-foreground/60 block mb-2">
                      Cover (3:4)
                    </label>
                    <div
                      onClick={() => fileRef.current?.click()}
                      className="aspect-[3/4] bg-background border border-border cursor-pointer hover:border-primary flex items-center justify-center overflow-hidden"
                    >
                      {editingStory.cover ? (
                        <img
                          src={editingStory.cover}
                          alt="cover preview"
                          className="w-full h-full object-cover"
                        />
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
                      onChange={(e) =>
                        e.target.files?.[0] && handleCover(e.target.files[0])
                      }
                    />
                    {editingStory.cover && (
                      <button
                        onClick={() => setEditingStory({ ...editingStory, cover: "" })}
                        className="font-label text-[10px] text-destructive mt-2 hover:underline"
                      >
                        Remove cover
                      </button>
                    )}
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="font-label text-[10px] text-foreground/60 block mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={editingStory.title}
                        onChange={(e) =>
                          setEditingStory({ ...editingStory, title: e.target.value })
                        }
                        className="w-full bg-background border border-border px-4 py-3 font-display text-xl focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="font-label text-[10px] text-foreground/60 block mb-2">
                        Genre tag
                      </label>
                      <input
                        type="text"
                        value={editingStory.genre}
                        onChange={(e) =>
                          setEditingStory({ ...editingStory, genre: e.target.value })
                        }
                        placeholder="BL · Dark Romance · Omegaverse"
                        className="w-full bg-background border border-border px-4 py-3 font-body focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="font-label text-[10px] text-foreground/60 block mb-2">
                        Blurb
                      </label>
                      <textarea
                        value={editingStory.blurb}
                        onChange={(e) =>
                          setEditingStory({ ...editingStory, blurb: e.target.value })
                        }
                        rows={4}
                        className="w-full bg-background border border-border px-4 py-3 font-body focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="font-label text-[10px] text-foreground/60 block mb-2">
                        Published on
                      </label>
                      <select
                        value={editingStory.platform}
                        onChange={(e) =>
                          setEditingStory({ ...editingStory, platform: e.target.value })
                        }
                        className="w-full bg-background border border-border px-4 py-3 font-body focus:outline-none focus:border-primary"
                      >
                        <option>Wattpad</option>
                        <option>Dreame</option>
                        <option>Original / Unpublished</option>
                      </select>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={saveStory}
                        className="bg-primary text-primary-foreground font-label text-xs px-6 py-3 hover:bg-primary/90"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingStory(null)}
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
                  onClick={() => setEditingStory({ ...emptyStory })}
                  className="bg-primary text-primary-foreground font-label text-xs px-6 py-3 hover:bg-primary/90 mb-10"
                >
                  + New story
                </button>

                {stories.length === 0 ? (
                  <p className="text-ink-soft italic font-display text-xl">
                    No stories yet. Begin.
                  </p>
                ) : (
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {stories.map((s) => (
                      <article key={s.id} className="bg-cream-deep/40 border border-border">
                        <div className="aspect-[3/4] bg-background overflow-hidden">
                          {s.cover ? (
                            <img
                              src={s.cover}
                              alt={s.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-label text-[10px] text-foreground/40">
                              no cover
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-display text-lg leading-tight mb-1 truncate">
                            {s.title}
                          </h3>
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
                              onClick={() => setEditingStory(s)}
                              className="flex-1 font-label text-[10px] px-3 py-2 border border-border hover:border-primary"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => removeStory(s.id, s.title)}
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
          </>
        )}

        {/* PLAYLIST TAB */}
        {tab === "playlist" && (
          <div className="bg-cream-deep/40 border border-border p-6 max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-label text-[10px] text-primary mb-1">Playlist Settings</p>
                <h2 className="font-display text-xl">Spotify Playlist</h2>
              </div>
              <button
                onClick={() => {
                  resetPlaylist();
                  setPlaylistInput(DEFAULT_PLAYLIST_URL);
                  setPlaylistSaved(false);
                }}
                className="font-label text-[10px] text-foreground/50 hover:text-destructive"
              >
                Reset
              </button>
            </div>
            <label className="font-label text-[10px] text-foreground/60 block mb-2">
              Spotify Playlist Embed URL
            </label>
            <input
              type="url"
              value={playlistInput}
              onChange={(e) => {
                setPlaylistInput(e.target.value);
                setPlaylistSaved(false);
              }}
              placeholder="https://open.spotify.com/embed/playlist/..."
              className="w-full bg-background border border-border px-4 py-3 font-body text-sm focus:outline-none focus:border-primary"
            />
            <p className="font-label text-[10px] text-foreground/50 mt-2">
              Paste either the share link or the embed URL — both work.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => {
                  const saved = savePlaylist(playlistInput);
                  setPlaylistInput(saved);
                  setPlaylistSaved(true);
                  setTimeout(() => setPlaylistSaved(false), 2000);
                }}
                className="bg-primary text-primary-foreground font-label text-xs px-5 py-2.5 hover:bg-primary/90"
              >
                Save Playlist
              </button>
              {playlistSaved && (
                <span className="font-label text-[10px] text-primary">Saved ✓</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
