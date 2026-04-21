import { AdminDashboard } from "@/components/AdminDashboard";
import { AuthGate } from "@/components/AuthGate";

export default function AdminPage() {
  return (
    <main className="px-6 py-12 md:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 border-2 border-fuchsia-500 bg-slate-950 p-6">
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-fuchsia-300">
            Admin
          </p>
          <h1 className="text-3xl font-semibold text-slate-50">
            Set sessions, seed challenges, watch the feed
          </h1>
          <p className="mt-2 text-slate-200">
            Configure BitBingo, keep the board aligned to your session, and
            observe proofs flowing in.
          </p>
        </div>
        <AuthGate label="Admin console">
          <AdminDashboard />
        </AuthGate>
      </div>
    </main>
  );
}
