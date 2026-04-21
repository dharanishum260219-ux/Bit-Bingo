"use client";

import { ensureBoard } from "@/lib/bingo";
import { Challenge, Completion } from "@/lib/types";

type Props = {
  challenges: Challenge[];
  completions: Completion[];
};

export function BingoGrid({ challenges, completions }: Props) {
  const board = ensureBoard(challenges);
  const completionCount = completions.reduce<Record<string, number>>(
    (acc, completion) => {
      acc[completion.challenge_id] = (acc[completion.challenge_id] ?? 0) + 1;
      return acc;
    },
    {},
  );

  return (
    <div className="grid grid-cols-5 gap-2 w-full">
      {board.map((challenge, index) => {
        const count = completionCount[challenge.id] ?? 0;
        const isActive = count > 0;
        return (
          <div
            key={challenge.id}
            className={`flex h-28 flex-col justify-between border-2 p-3 transition-colors ${
              isActive
                ? "border-emerald-400 bg-slate-900 text-emerald-100"
                : "border-slate-800 bg-slate-950 text-slate-200"
            }`}
          >
            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
              Cell {index + 1}
            </div>
            <div className="text-xs font-semibold leading-tight">
              {challenge.title}
            </div>
            <div className="text-[11px] font-mono text-emerald-300">
              {count} completion{count === 1 ? "" : "s"}
            </div>
          </div>
        );
      })}
    </div>
  );
}
