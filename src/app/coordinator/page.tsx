import { AuthGate } from "@/components/AuthGate";
import { CoordinatorForm } from "@/components/CoordinatorForm";

export default function CoordinatorPage() {
  return (
    <main className="px-6 py-12 md:py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 border-2 border-slate-700 bg-slate-950 p-6">
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-slate-400">
            Coordinator
          </p>
          <h1 className="text-3xl font-semibold text-slate-50">
            Verify completions fast
          </h1>
          <p className="mt-2 text-slate-200">
            Select a participant, attach proof, and push completions straight
            into the bingo board with realtime feedback.
          </p>
        </div>
        <AuthGate label="Coordinator">
          <CoordinatorForm />
        </AuthGate>
      </div>
    </main>
  );
}
