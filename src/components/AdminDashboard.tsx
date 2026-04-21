"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ensureBoard } from "@/lib/bingo";
import { getSupabaseClient } from "@/lib/supabaseClient";
import {
  sampleChallenges,
  sampleCompletions,
  sampleParticipants,
  sampleSession,
} from "@/lib/sampleData";
import { Challenge, Completion, Participant } from "@/lib/types";

const supabase = getSupabaseClient();

export function AdminDashboard() {
  const [sessionName, setSessionName] = useState(sampleSession.name);
  const [sessionSlug, setSessionSlug] = useState(sampleSession.slug);
  const [sessionId, setSessionId] = useState(sampleSession.id);

  const [participantName, setParticipantName] = useState("");
  const [participantHandle, setParticipantHandle] = useState("");

  const [challengeTitle, setChallengeTitle] = useState("");
  const [challengePosition, setChallengePosition] = useState(0);
  const [challengeDescription, setChallengeDescription] = useState("");

  const [participants, setParticipants] = useState<Participant[]>(
    sampleParticipants,
  );
  const [challenges, setChallenges] = useState<Challenge[]>(sampleChallenges);
  const [completions, setCompletions] =
    useState<Completion[]>(sampleCompletions);

  const [status, setStatus] = useState<string | null>(null);

  const missingEnv = useMemo(
    () =>
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    [],
  );

  useEffect(() => {
    if (!supabase) return;
    let isMounted = true;
    let channel: ReturnType<
      NonNullable<typeof supabase>["channel"]
    > | null = null;

    const load = async () => {
      const [sessionRes, participantRes, challengeRes, completionRes] =
        await Promise.all([
          supabase.from("sessions").select("*").limit(1),
          supabase.from("participants").select("*"),
          supabase.from("challenges").select("*"),
          supabase.from("completions").select("*"),
        ]);

      if (!isMounted) return;

      if (sessionRes.data?.[0]) {
        setSessionId(sessionRes.data[0].id);
        setSessionName(sessionRes.data[0].name);
        setSessionSlug(sessionRes.data[0].slug);
      }

      setParticipants(participantRes.data ?? sampleParticipants);
      setChallenges(ensureBoard(challengeRes.data ?? sampleChallenges));
      setCompletions(completionRes.data ?? sampleCompletions);

      channel = supabase
        .channel("admin-feed")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "completions" },
          (payload) => {
            setCompletions((current) => [
              payload.new as Completion,
              ...current,
            ]);
          },
        )
        .subscribe();
    };

    load();

    return () => {
      isMounted = false;
      channel?.unsubscribe();
    };
  }, []);

  const createSession = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabase) {
      setStatus("Supabase not configured yet.");
      return;
    }
    const { data, error } = await supabase
      .from("sessions")
      .insert({
        name: sessionName,
        slug: sessionSlug,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      setStatus(error.message);
      return;
    }

    setSessionId(data.id);
    setStatus(`Session ${data.name} created.`);
  };

  const addParticipant = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabase) {
      setStatus("Supabase not configured yet.");
      return;
    }
    const { data, error } = await supabase
      .from("participants")
      .insert({
        display_name: participantName,
        handle: participantHandle,
        session_id: sessionId,
      })
      .select()
      .single();

    if (error) {
      setStatus(error.message);
      return;
    }
    setParticipants((current) => [...current, data]);
    setParticipantName("");
    setParticipantHandle("");
    setStatus(`Added ${data.display_name}.`);
  };

  const addChallenge = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabase) {
      setStatus("Supabase not configured yet.");
      return;
    }
    const { data, error } = await supabase
      .from("challenges")
      .upsert(
        {
          title: challengeTitle,
          description: challengeDescription,
          position: challengePosition,
          session_id: sessionId,
        },
        { onConflict: "session_id,position" },
      )
      .select()
      .single();

    if (error) {
      setStatus(error.message);
      return;
    }

    setChallenges((current) => {
      const others = current.filter(
        (challenge) => challenge.position !== data.position,
      );
      const next = ensureBoard([...others, data]);
      return next;
    });
    setChallengeTitle("");
    setChallengeDescription("");
    setStatus(`Challenge saved in slot ${data.position + 1}.`);
  };

  const seedAllChallenges = async () => {
    if (!supabase) {
      setChallenges(ensureBoard(sampleChallenges));
      setStatus("Loaded sample challenges locally.");
      return;
    }

    const payload = sampleChallenges.map((challenge) => ({
      ...challenge,
      session_id: sessionId,
    }));

    const { error } = await supabase
      .from("challenges")
      .upsert(payload, { onConflict: "session_id,position" });

    if (error) {
      setStatus(error.message);
      return;
    }

    setChallenges(ensureBoard(payload));
    setStatus("Seeded 25 challenges into the board.");
  };

  const participantLookup = useMemo(
    () =>
      participants.reduce<Record<string, Participant>>(
        (acc, participant) => ({
          ...acc,
          [participant.id]: participant,
        }),
        {},
      ),
    [participants],
  );

  const challengeLookup = useMemo(
    () =>
      challenges.reduce<Record<string, Challenge>>(
        (acc, challenge) => ({
          ...acc,
          [challenge.id]: challenge,
        }),
        {},
      ),
    [challenges],
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="border-2 border-cyan-500 bg-slate-950 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-slate-400">
              Admin
            </p>
            <p className="text-lg font-semibold text-cyan-200">
              Session controls
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {missingEnv ? "Demo mode" : "Live Supabase"}
          </span>
        </div>
        <form className="grid gap-3 md:grid-cols-2" onSubmit={createSession}>
          <label className="flex flex-col gap-1 text-sm text-slate-200">
            Session name
            <input
              value={sessionName}
              onChange={(event) => setSessionName(event.target.value)}
              className="border-2 border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400"
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-200">
            Session slug
            <input
              value={sessionSlug}
              onChange={(event) => setSessionSlug(event.target.value)}
              className="border-2 border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400"
              required
            />
          </label>
          <button
            type="submit"
            className="border-2 border-cyan-400 bg-slate-900 px-4 py-3 text-cyan-100"
          >
            Create / Update session
          </button>
        </form>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <form
          className="border-2 border-emerald-500 bg-slate-950 p-4"
          onSubmit={addParticipant}
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="text-lg font-semibold text-emerald-200">Add player</p>
            <span className="text-xs font-mono text-slate-400">
              Session: {sessionId.slice(0, 8)}…
            </span>
          </div>
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1 text-sm text-slate-200">
              Display name
              <input
                value={participantName}
                onChange={(event) => setParticipantName(event.target.value)}
                className="border-2 border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-emerald-400"
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-200">
              Handle (optional)
              <input
                value={participantHandle}
                onChange={(event) => setParticipantHandle(event.target.value)}
                className="border-2 border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-emerald-400"
              />
            </label>
            <button
              type="submit"
              className="border-2 border-emerald-400 bg-emerald-900 px-4 py-3 text-emerald-50"
            >
              Add participant
            </button>
          </div>
        </form>

        <form
          className="border-2 border-amber-500 bg-slate-950 p-4"
          onSubmit={addChallenge}
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="text-lg font-semibold text-amber-200">
              Add challenge
            </p>
            <span className="text-xs font-mono text-slate-400">
              Position 0-24
            </span>
          </div>
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1 text-sm text-slate-200">
              Title
              <input
                value={challengeTitle}
                onChange={(event) => setChallengeTitle(event.target.value)}
                className="border-2 border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-amber-400"
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-200">
              Description
              <textarea
                value={challengeDescription}
                onChange={(event) =>
                  setChallengeDescription(event.target.value)
                }
                className="min-h-[92px] border-2 border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-amber-400"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-200">
              Board slot (0 = top left)
              <input
                type="number"
                min={0}
                max={24}
                value={challengePosition}
                onChange={(event) =>
                  setChallengePosition(Number(event.target.value))
                }
                className="border-2 border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-amber-400"
              />
            </label>
            <div className="flex gap-3">
              <button
                type="submit"
                className="border-2 border-amber-400 bg-amber-900 px-4 py-3 text-amber-50"
              >
                Save challenge
              </button>
              <button
                type="button"
                onClick={seedAllChallenges}
                className="border-2 border-cyan-400 bg-slate-900 px-4 py-3 text-cyan-100"
              >
                Seed 25 sample
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="border-2 border-slate-800 bg-slate-950 p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-lg font-semibold text-slate-100">Live feed</p>
          <span className="text-xs font-mono text-slate-400">
            realtime completions
          </span>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {completions.length === 0 ? (
            <div className="border-2 border-slate-800 bg-slate-900 p-4 text-sm text-slate-300">
              Waiting for submissions…
            </div>
          ) : (
            completions.slice(0, 10).map((completion) => {
              const participant =
                participantLookup[completion.participant_id]?.display_name ??
                "Unknown participant";
              const challenge =
                challengeLookup[completion.challenge_id]?.title ??
                "Unknown challenge";
              return (
                <div
                  key={completion.id}
                  className="flex flex-col gap-2 border-2 border-slate-800 bg-slate-900 p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-slate-100">
                      {participant}
                    </div>
                    <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">
                      {completion.created_at?.slice(11, 19) ?? "live"}
                    </div>
                  </div>
                  <div className="text-xs font-mono text-cyan-200">
                    {challenge}
                  </div>
                  {completion.proof_url ? (
                    <div className="h-40 w-full border-2 border-slate-800 bg-slate-950">
                      <Image
                        src={completion.proof_url}
                        alt="Proof"
                        width={800}
                        height={320}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-40 border-2 border-dashed border-slate-700 bg-slate-950 p-3 text-xs text-slate-400">
                      Awaiting proof upload
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {status ? (
        <div className="border-2 border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-200">
          {status}
        </div>
      ) : null}
    </div>
  );
}
