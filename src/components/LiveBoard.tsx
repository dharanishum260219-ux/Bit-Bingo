"use client";

import { useEffect, useMemo, useState } from "react";
import { BingoGrid } from "./BingoGrid";
import { Leaderboard } from "./Leaderboard";
import { ensureBoard } from "@/lib/bingo";
import { getSupabaseClient } from "@/lib/supabaseClient";
import {
  sampleChallenges,
  sampleCompletions,
  sampleParticipants,
} from "@/lib/sampleData";
import { Challenge, Completion, Participant } from "@/lib/types";

const supabase = getSupabaseClient();

const connectLabel = (connected: boolean, missingEnv: boolean) => {
  if (missingEnv) return "Supabase env vars missing — showing sample data.";
  return connected ? "Live updates on." : "Connecting to Supabase…";
};

export function LiveBoard() {
  const [participants, setParticipants] = useState<Participant[]>(
    sampleParticipants,
  );
  const [challenges, setChallenges] = useState<Challenge[]>(sampleChallenges);
  const [completions, setCompletions] =
    useState<Completion[]>(sampleCompletions);
  const [connected, setConnected] = useState(false);

  const missingEnv = useMemo(
    () =>
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    [],
  );

  useEffect(() => {
    let isMounted = true;
    let channel: ReturnType<
      NonNullable<typeof supabase>["channel"]
    > | null = null;

    const load = async () => {
      if (!supabase) return;

      const [participantsRes, challengesRes, completionsRes] =
        await Promise.all([
          supabase.from("participants").select("*"),
          supabase.from("challenges").select("*"),
          supabase.from("completions").select("*"),
        ]);

      if (!isMounted) return;

      setParticipants(participantsRes.data ?? sampleParticipants);
      setChallenges(challengesRes.data ?? sampleChallenges);
      setCompletions(completionsRes.data ?? sampleCompletions);

      channel = supabase
        .channel("completions-stream")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "completions" },
          (payload) => {
            setCompletions((current) => [
              ...current,
              payload.new as Completion,
            ]);
          },
        )
        .subscribe((status) => {
          if (!isMounted) return;
          setConnected(status === "SUBSCRIBED");
        });
    };

    load();

    return () => {
      isMounted = false;
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, []);

  const board = ensureBoard(challenges);

  return (
    <section className="grid grid-cols-1 gap-6 lg:grid-cols-[420px_1fr]">
      <div className="flex flex-col gap-3">
        <div className="border-2 border-slate-700 bg-slate-900 px-4 py-3 font-mono text-xs uppercase tracking-[0.2em] text-slate-300">
          {connectLabel(connected, missingEnv)}
        </div>
        <div className="border-2 border-emerald-500 bg-slate-950 p-4">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-lg font-semibold text-emerald-200">
              Leaderboard
            </h2>
            <span className="text-xs font-mono text-slate-400">
              Sorted by completions
            </span>
          </div>
          <Leaderboard
            participants={participants}
            completions={completions}
            challenges={board}
          />
        </div>
      </div>
      <div className="border-2 border-cyan-400 bg-slate-950 p-4">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold text-cyan-200">Bingo Board</h2>
          <span className="text-xs font-mono text-slate-400">
            5x5 coding challenges
          </span>
        </div>
        <BingoGrid challenges={board} completions={completions} />
      </div>
    </section>
  );
}
