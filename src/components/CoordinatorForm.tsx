"use client";

import { useEffect, useState } from "react";
import { ensureBoard } from "@/lib/bingo";
import { getSupabaseClient } from "@/lib/supabaseClient";
import {
  sampleChallenges,
  sampleParticipants,
  sampleSession,
} from "@/lib/sampleData";
import { Challenge, Participant } from "@/lib/types";

const supabase = getSupabaseClient();

export function CoordinatorForm() {
  const [participants, setParticipants] = useState<Participant[]>(
    sampleParticipants,
  );
  const [challenges, setChallenges] = useState<Challenge[]>(sampleChallenges);
  const [participantId, setParticipantId] = useState<string>(
    sampleParticipants[0]?.id ?? "",
  );
  const [challengeId, setChallengeId] = useState<string>(
    sampleChallenges[0]?.id ?? "",
  );
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    const load = async () => {
      const [participantsRes, challengesRes] = await Promise.all([
        supabase.from("participants").select("*"),
        supabase.from("challenges").select("*"),
      ]);
      const nextParticipants = participantsRes.data ?? sampleParticipants;
      const board = ensureBoard(challengesRes.data ?? sampleChallenges);
      setParticipants(nextParticipants);
      setChallenges(board);
      setParticipantId(nextParticipants[0]?.id ?? "");
      setChallengeId(board[0]?.id ?? "");
    };
    load();
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus(null);

    if (!participantId || !challengeId) {
      setStatus("Select a participant and a challenge.");
      return;
    }

    if (!supabase) {
      setStatus("Supabase is not configured. Demo mode only.");
      return;
    }

    setSubmitting(true);
    let proofUrl: string | null = null;

    if (file) {
      const path = `proofs/${crypto.randomUUID()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("proofs")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        setStatus(uploadError.message);
        setSubmitting(false);
        return;
      }

      const { data: publicUrl } = supabase.storage
        .from("proofs")
        .getPublicUrl(path);
      proofUrl = publicUrl.publicUrl;
    }

    const { error } = await supabase.from("completions").insert({
      session_id:
        process.env.NEXT_PUBLIC_DEFAULT_SESSION_ID ?? sampleSession.id,
      participant_id: participantId,
      challenge_id: challengeId,
      proof_url: proofUrl,
    });

    if (error) {
      setStatus(error.message);
    } else {
      setStatus("Completion recorded. Nice work.");
      setFile(null);
    }

    setSubmitting(false);
  };

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-4 border-2 border-emerald-500 bg-slate-950 p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-slate-400">
            Coordinator
          </p>
          <p className="text-lg font-semibold text-emerald-200">
            Fast data entry
          </p>
        </div>
        <span className="text-xs font-mono text-slate-400">
          Session: {sampleSession.name}
        </span>
      </div>
      <label className="flex flex-col gap-2 text-sm text-slate-200">
        Select participant
        <select
          value={participantId}
          onChange={(event) => setParticipantId(event.target.value)}
          className="border-2 border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400"
          required
        >
          {participants.map((participant) => (
            <option key={participant.id} value={participant.id}>
              {participant.display_name}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-2 text-sm text-slate-200">
        Select challenge
        <select
          value={challengeId}
          onChange={(event) => setChallengeId(event.target.value)}
          className="border-2 border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400"
          required
        >
          {challenges.map((challenge) => (
            <option key={challenge.id} value={challenge.id}>
              {challenge.title}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-2 text-sm text-slate-200">
        Upload proof (camera ready)
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="border-2 border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 file:mr-3 file:border-0 file:bg-slate-800 file:px-3 file:py-1"
        />
      </label>
      <button
        type="submit"
        disabled={submitting}
        className="border-2 border-emerald-400 bg-emerald-900 px-4 py-3 text-emerald-50 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting ? "Submitting…" : "Submit completion"}
      </button>
      {status ? (
        <div className="border-2 border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200">
          {status}
        </div>
      ) : null}
    </form>
  );
}
