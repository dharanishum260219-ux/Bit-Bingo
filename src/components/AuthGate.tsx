"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

type Props = {
  children: React.ReactNode;
  label: string;
};

const supabase = getSupabaseClient();

export function AuthGate({ children, label }: Props) {
  const [status, setStatus] = useState<
    "loading" | "signed-out" | "ready" | "missing" | "demo"
  >(supabase ? "loading" : "missing");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth
      .getSession()
      .then(({ data }) =>
        setStatus(data.session ? "ready" : ("signed-out" as const)),
      );

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setStatus(session ? "ready" : "signed-out");
      },
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setMessage("Supabase credentials missing.");
      return;
    }
    setMessage("Sending magic link…");
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Check your inbox for the sign-in link.");
    }
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  if (status === "missing") {
    return (
      <div className="border-2 border-amber-400 bg-slate-950 p-6 text-sm text-amber-100">
        <div className="mb-2 font-semibold uppercase tracking-[0.2em] text-amber-200">
          Supabase not configured
        </div>
        <p className="mb-4 text-slate-200">
          Add <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to
          continue with live data. You can still explore the UI in demo mode.
        </p>
        <button
          type="button"
          onClick={() => setStatus("demo")}
          className="border-2 border-cyan-400 bg-slate-900 px-4 py-2 text-cyan-200"
        >
          Enter demo mode
        </button>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="border-2 border-slate-800 bg-slate-950 p-6 font-mono text-sm text-slate-300">
        Checking access for {label}…
      </div>
    );
  }

  if (status === "signed-out") {
    return (
      <div className="border-2 border-slate-800 bg-slate-950 p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-slate-400">
              Protected
            </p>
            <p className="text-lg font-semibold text-slate-50">{label}</p>
          </div>
          <div className="text-xs font-mono text-slate-400">Email login</div>
        </div>
        <form className="flex flex-col gap-3" onSubmit={signIn}>
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="border-2 border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400"
          />
          <button
            type="submit"
            className="border-2 border-emerald-500 bg-emerald-900 px-4 py-2 text-emerald-100"
          >
            Send magic link
          </button>
          {message ? (
            <p className="text-sm font-mono text-slate-300">{message}</p>
          ) : null}
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {status === "ready" ? (
        <div className="flex items-center justify-between border-2 border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-200">
          <span className="font-mono uppercase tracking-[0.2em]">
            Access granted
          </span>
          <button
            type="button"
            className="border-2 border-rose-500 px-3 py-1 text-rose-100"
            onClick={signOut}
          >
            Sign out
          </button>
        </div>
      ) : null}
      {children}
    </div>
  );
}
