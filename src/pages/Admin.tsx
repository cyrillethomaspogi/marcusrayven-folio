import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

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

const empty = { title: "", excerpt: "", content: "", published: false };

const Admin = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [adminCount, setAdminCount] = useState<number | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [editing, setEditing] = useState<Post | typeof empty | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      // Count admins (via head + count)
      const { count } = await supabase
        .from("user_roles")
        .select("*", { count: "exact", head: true })
        .eq("role", "admin");
      setAdminCount(count ?? 0);

      // Check if current user is admin
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

  const save = async () => {
    if (!editing) return;
    setBusy(true);
    setError(null);

    const payload = {
      title: editing.title,
      excerpt: editing.excerpt,
      content: editing.content,
      published: editing.published,
      published_at: editing.published
        ? ("published_at" in editing && editing.published_at) || new Date().toISOString()
        : null,
    };

    if ("id" in editing && editing.id) {
      const { error } = await supabase.from("posts").update(payload).eq("id", editing.id);
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.from("posts").insert(payload);
      if (error) setError(error.message);
    }

    setBusy(false);
    if (!error) {
      setEditing(null);
      loadPosts();
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) setError(error.message);
    else loadPosts();
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth", { replace: true });
  };

  if (session === null || isAdmin === null) {
    return <div className="min-h-screen flex items-center justify-center text-ink-soft">Loading…</div>;
  }

  // Logged in but not admin
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

  // Admin view
  return (
    <div className="min-h-screen px-6 py-12">
      <div className="container max-w-4xl">
        <div className="flex items-center justify-between mb-12">
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

        {error && <p className="text-destructive text-sm mb-6">{error}</p>}

        {editing ? (
          <div className="bg-cream-deep/40 border border-border p-8">
            <h2 className="font-display text-2xl mb-6">
              {"id" in editing && editing.id ? "Edit post" : "New post"}
            </h2>
            <div className="space-y-5">
              <div>
                <label className="font-label text-[10px] text-foreground/60 block mb-2">Title</label>
                <input
                  type="text"
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  className="w-full bg-background border border-border px-4 py-3 font-display text-2xl focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="font-label text-[10px] text-foreground/60 block mb-2">Excerpt</label>
                <textarea
                  value={editing.excerpt}
                  onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })}
                  rows={2}
                  className="w-full bg-background border border-border px-4 py-3 font-body focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="font-label text-[10px] text-foreground/60 block mb-2">Content</label>
                <textarea
                  value={editing.content}
                  onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                  rows={14}
                  className="w-full bg-background border border-border px-4 py-3 font-body leading-relaxed focus:outline-none focus:border-primary"
                />
              </div>
              <label className="flex items-center gap-3 font-label text-xs">
                <input
                  type="checkbox"
                  checked={editing.published}
                  onChange={(e) => setEditing({ ...editing, published: e.target.checked })}
                  className="accent-primary"
                />
                Publish (visible to visitors)
              </label>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={save}
                  disabled={busy || !editing.title.trim()}
                  className="bg-primary text-primary-foreground font-label text-xs px-6 py-3 hover:bg-primary/90 disabled:opacity-50"
                >
                  {busy ? "Saving…" : "Save"}
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
        ) : (
          <>
            <button
              onClick={() => setEditing({ ...empty })}
              className="bg-primary text-primary-foreground font-label text-xs px-6 py-3 hover:bg-primary/90 mb-10"
            >
              + New post
            </button>

            {posts.length === 0 ? (
              <p className="text-ink-soft italic font-display text-xl">No posts yet. Begin.</p>
            ) : (
              <div className="divide-y divide-border">
                {posts.map((p) => (
                  <article key={p.id} className="py-6 flex items-start justify-between gap-6">
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
                        <p className="text-ink-soft text-sm mt-1 line-clamp-2">{p.excerpt}</p>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => setEditing(p)}
                        className="font-label text-[10px] px-3 py-2 border border-border hover:border-primary"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => remove(p.id)}
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
      </div>
    </div>
  );
};

export default Admin;
