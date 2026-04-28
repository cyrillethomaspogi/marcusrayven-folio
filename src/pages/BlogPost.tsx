import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import RichText from "@/components/RichText";
import RichTextEditor from "@/components/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Post {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  published_at: string | null;
  created_at: string;
}

interface Comment {
  id: string;
  post_id: string;
  parent_id: string | null;
  nickname: string;
  message: string;
  created_at: string;
}

const BlogPost = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [nickname, setNickname] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyNickname, setReplyNickname] = useState("");
  const [replyMessage, setReplyMessage] = useState("");

  useEffect(() => {
    if (!id) return;
    supabase
      .from("posts")
      .select("id, title, excerpt, content, published_at, created_at")
      .eq("id", id)
      .eq("published", true)
      .maybeSingle()
      .then(({ data }) => {
        setPost(data as Post | null);
        setLoading(false);
      });
    loadComments();
  }, [id]);

  const loadComments = async () => {
    if (!id) return;
    const { data } = await supabase
      .from("post_comments")
      .select("id, post_id, parent_id, nickname, message, created_at")
      .eq("post_id", id)
      .order("created_at", { ascending: true });
    setComments((data ?? []) as Comment[]);
  };

  const isHtmlEmpty = (html: string) =>
    !html || html.replace(/<[^>]*>/g, "").trim().length === 0;

  const submitComment = async (parentId: string | null) => {
    const nick = (parentId ? replyNickname : nickname).trim();
    const msg = parentId ? replyMessage : message;
    if (!nick || isHtmlEmpty(msg) || !id) {
      toast.error("Nickname and a message are required.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("post_comments").insert({
      post_id: id,
      parent_id: parentId,
      nickname: nick,
      message: msg,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Could not post comment.");
      return;
    }
    if (parentId) {
      setReplyTo(null);
      setReplyNickname("");
      setReplyMessage("");
    } else {
      setMessage("");
    }
    toast.success("Comment posted.");
    loadComments();
  };

  const topLevel = comments.filter((c) => !c.parent_id);
  const repliesOf = (cid: string) => comments.filter((c) => c.parent_id === cid);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "2-digit",
    });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60 py-5">
        <div className="container flex items-center justify-between">
          <Link to="/" className="font-display text-xl">
            Marcus Rayven
          </Link>
          <Link
            to="/#blog"
            className="font-label text-[11px] tracking-widest text-primary hover:underline"
          >
            ← Back to Notebook
          </Link>
        </div>
      </header>

      <main className="container max-w-3xl py-16 md:py-24">
        {loading ? (
          <p className="font-display italic text-ink-soft">Loading…</p>
        ) : !post ? (
          <div className="text-center py-20">
            <h1 className="font-display text-4xl mb-4">Entry not found</h1>
            <Link to="/" className="text-primary underline">
              Return home
            </Link>
          </div>
        ) : (
          <article>
            <p className="font-label text-[11px] text-primary mb-4">Journal</p>
            <h1 className="font-display text-4xl md:text-6xl leading-tight mb-5">
              {post.title}
            </h1>
            <p className="font-label text-[10px] text-foreground/50 mb-10">
              {formatDate(post.published_at ?? post.created_at)}
            </p>
            {post.excerpt && (
              <p className="text-xl leading-relaxed text-ink-soft italic mb-10">
                {post.excerpt}
              </p>
            )}
            <div className="h-px bg-foreground/15 w-full mb-10" />
            <RichText html={post.content} />
          </article>
        )}

        {post && (
          <section className="mt-20">
            <div className="mb-10">
              <p className="font-label text-[11px] text-primary mb-3">Conversation</p>
              <h2 className="font-display text-3xl md:text-4xl">
                Leave a Reply
              </h2>
              <div className="h-px bg-foreground/15 w-full mt-6" />
            </div>

            <div className="space-y-4 mb-12">
              <Input
                placeholder="Your nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={60}
              />
              <RichTextEditor value={message} onChange={setMessage} />
              <div className="flex justify-end">
                <Button
                  onClick={() => submitComment(null)}
                  disabled={submitting}
                >
                  {submitting ? "Posting…" : "Post comment"}
                </Button>
              </div>
            </div>

            <div className="space-y-8">
              {topLevel.length === 0 ? (
                <p className="font-display italic text-ink-soft text-center py-8">
                  No comments yet. Be the first to write one.
                </p>
              ) : (
                topLevel.map((c) => (
                  <div key={c.id} className="border-l-2 border-primary/40 pl-5">
                    <div className="flex items-baseline justify-between mb-2 gap-3 flex-wrap">
                      <span className="font-display text-lg">{c.nickname}</span>
                      <span className="font-label text-[10px] text-foreground/50">
                        {formatDate(c.created_at)}
                      </span>
                    </div>
                    <RichText html={c.message} />
                    <button
                      type="button"
                      onClick={() =>
                        setReplyTo(replyTo === c.id ? null : c.id)
                      }
                      className="font-label text-[11px] tracking-widest text-primary hover:underline mt-3"
                    >
                      {replyTo === c.id ? "Cancel" : "Reply"}
                    </button>

                    {replyTo === c.id && (
                      <div className="space-y-3 mt-4 bg-card/50 p-4 rounded-md border border-border/60">
                        <Input
                          placeholder="Your nickname"
                          value={replyNickname}
                          onChange={(e) => setReplyNickname(e.target.value)}
                          maxLength={60}
                        />
                        <RichTextEditor
                          value={replyMessage}
                          onChange={setReplyMessage}
                        />
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            onClick={() => submitComment(c.id)}
                            disabled={submitting}
                          >
                            {submitting ? "Posting…" : "Post reply"}
                          </Button>
                        </div>
                      </div>
                    )}

                    {repliesOf(c.id).length > 0 && (
                      <div className="mt-6 space-y-5 pl-5 border-l border-foreground/15">
                        {repliesOf(c.id).map((r) => (
                          <div key={r.id}>
                            <div className="flex items-baseline justify-between mb-2 gap-3 flex-wrap">
                              <span className="font-display text-base">
                                {r.nickname}
                              </span>
                              <span className="font-label text-[10px] text-foreground/50">
                                {formatDate(r.created_at)}
                              </span>
                            </div>
                            <RichText html={r.message} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default BlogPost;
