"use client";

import { computeLeaderboard, ensureBoard } from "@/lib/bingo";
import { Challenge, Completion, Participant } from "@/lib/types";

type Props = {
  participants: Participant[];
  completions: Completion[];
  challenges: Challenge[];
};

export function Leaderboard({
  participants,
  completions,
  challenges,
}: Props) {
  const board = ensureBoard(challenges);
  const ranked = computeLeaderboard(participants, completions, board).sort(
    (a, b) => b.completed - a.completed,
  );

  if (ranked.length === 0) {
    return (
      <div className="border-2 border-slate-800 bg-slate-950 p-4 font-mono text-sm text-slate-300">
        Waiting for participants…
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {ranked.map((entry, index) => (
        <div
          key={entry.participant.id}
          className="flex items-center justify-between border-2 border-slate-800 bg-slate-900 px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <div className="text-xs font-mono text-slate-500 w-10">
              #{index + 1}
            </div>
            <div className="flex flex-col">
              <span className="text-base font-semibold text-slate-50">
                {entry.participant.display_name}
              </span>
              {entry.participant.handle ? (
                <span className="text-xs font-mono text-slate-400">
                  {entry.participant.handle}
                </span>
              ) : null}
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm font-mono">
            {entry.hasBingo ? (
              <span className="border-2 border-emerald-400 px-2 py-1 text-emerald-300">
                BINGO
              </span>
            ) : null}
            <span className="border-2 border-slate-700 px-2 py-1 text-slate-200">
              {entry.completed} done
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
