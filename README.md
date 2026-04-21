# BitBingo Event Platform

Cyber-flat realtime bingo for coding events, built with Next.js (App Router), Tailwind CSS 4, and Supabase.

## Quickstart
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy env template and fill your Supabase values:
   ```bash
   cp .env.example .env.local
   ```
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_DEFAULT_SESSION_ID` (active session id for inserts)
3. Run the app:
   ```bash
   npm run dev
   ```
4. Lint:
   ```bash
   npm run lint
   ```

## Supabase schema & seed
- Apply the schema (tables + RLS + storage bucket):
  ```sql
  \i supabase/schema.sql
  ```
- Seed a demo session with 25 challenges (including “Circle printing logic based on coordinate geometry”):
  ```sql
  \i supabase/seed.sql
  ```

Tables: `sessions`, `participants`, `challenges`, `completions` plus a public `proofs` storage bucket. RLS allows public reads and restricts writes to authenticated users.

## Pages
- `/` Public landing with a live leaderboard and 5x5 bingo grid. Uses Supabase realtime and falls back to sample data when env vars are missing.
- `/coordinator` Protected data-entry screen: pick participant + challenge, capture proof (`capture="environment"`), upload to `proofs`, and insert into `completions`.
- `/admin` Protected dashboard: manage sessions/participants/challenges, seed all 25 challenges, and watch a live feed of completions.

## Bingo logic
The bingo checker validates five-in-a-row across rows, columns, or diagonals on a 5x5 grid. Logic lives in `src/lib/bingo.ts` and is reused by the leaderboard to highlight winners.

## Design system
Cyber-flat aesthetic: solid dark panels (`bg-slate-950` / `bg-slate-900`), sharp corners (no rounding), bright borders (`border-2` emerald/cyan/fuchsia), monospace for data, geometric sans for headings, and a subtle grid background (no blur or soft shadows).
