import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

const Auth = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session: Session | null) => {
      if (session) navigate("/admin", { replace: true });
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/admin", { replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/admin` },
      });
      if (error) setError(error.message);
      else setMessage("Account created. You can now sign in.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-md">
        <a href="/" className="font-label text-[10px] text-foreground/60 hover:text-primary">
          ← Back to site
        </a>
        <h1 className="font-display text-5xl mt-6 mb-2">
          {mode === "signin" ? "Sign in" : "Create account"}
        </h1>
        <p className="text-ink-soft mb-10">
          {mode === "signin"
            ? "Access your private writing space."
            : "First-time setup for the author account."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="font-label text-[10px] text-foreground/60 block mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-cream-deep/40 border border-border px-4 py-3 font-body focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="font-label text-[10px] text-foreground/60 block mb-2">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-cream-deep/40 border border-border px-4 py-3 font-body focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}
          {message && <p className="text-primary text-sm">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground font-label text-xs py-4 hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Working…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError(null);
            setMessage(null);
          }}
          className="font-label text-[10px] text-foreground/60 hover:text-primary mt-8 block mx-auto"
        >
          {mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
        </button>
      </div>
    </div>
  );
};

export default Auth;
