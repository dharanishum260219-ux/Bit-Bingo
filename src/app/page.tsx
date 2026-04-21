import { LiveBoard } from "@/components/LiveBoard";

export default function Home() {
  return (
    <main className="px-6 py-12 md:py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="grid items-start gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <div className="border-2 border-emerald-500 bg-slate-950 p-6">
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-emerald-300">
              BitBingo Event Platform
            </p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight text-slate-50 md:text-5xl">
              Real-time coding battles on a cyber-flat bingo grid.
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-slate-200">
              Track completions live, reward lightning-fast engineers, and keep
              coordinators in sync with Supabase realtime updates.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm font-mono text-slate-200">
              <span className="border-2 border-cyan-400 bg-slate-900 px-3 py-2">
                Next.js App Router
              </span>
              <span className="border-2 border-emerald-400 bg-slate-900 px-3 py-2">
                Supabase realtime
              </span>
              <span className="border-2 border-fuchsia-400 bg-slate-900 px-3 py-2">
                Cyber-flat UI
              </span>
            </div>
          </div>
          <div className="border-2 border-slate-700 bg-slate-950 p-6 text-sm text-slate-200">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-mono uppercase tracking-[0.2em] text-slate-400">
                Info
              </span>
              <span className="text-xs font-mono text-emerald-300">
                Live + offline ready
              </span>
            </div>
            <ul className="flex flex-col gap-2">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-2 w-2 bg-emerald-400" />
                <p>
                  Leaderboard listens to the{" "}
                  <code className="font-mono">completions</code> table and
                  updates instantly.
                </p>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-2 w-2 bg-cyan-400" />
                <p>
                  5x5 bingo board shows challenge status; winning rows, columns,
                  and diagonals are detected client-side.
                </p>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-2 w-2 bg-fuchsia-400" />
                <p>
                  Coordinator and Admin routes are protected by Supabase auth
                  with magic links.
                </p>
              </li>
            </ul>
          </div>
        </header>

        <LiveBoard />
      </div>
    </main>
  );
}
