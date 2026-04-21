-- Core tables
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  display_name text not null,
  handle text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  title text not null,
  description text,
  position int not null check (position between 0 and 24),
  points int default 10,
  created_at timestamptz not null default now(),
  unique (session_id, position)
);

create table if not exists public.completions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  participant_id uuid not null references public.participants(id) on delete cascade,
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  proof_url text,
  created_at timestamptz not null default now(),
  unique (participant_id, challenge_id)
);

-- Row Level Security
alter table public.sessions enable row level security;
alter table public.participants enable row level security;
alter table public.challenges enable row level security;
alter table public.completions enable row level security;

-- Read for everyone
create policy "public read sessions" on public.sessions
  for select using (true);
create policy "public read participants" on public.participants
  for select using (true);
create policy "public read challenges" on public.challenges
  for select using (true);
create policy "public read completions" on public.completions
  for select using (true);

-- Writes require authenticated users (coordinators/admins)
create policy "auth manage sessions" on public.sessions
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth manage participants" on public.participants
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth manage challenges" on public.challenges
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth insert completions" on public.completions
  for insert with check (auth.role() = 'authenticated');
create policy "auth delete completions" on public.completions
  for delete using (auth.role() = 'authenticated');

-- Storage bucket for proofs
insert into storage.buckets (id, name, public)
values ('proofs', 'proofs', true)
on conflict (id) do nothing;

create policy "public read proofs" on storage.objects
  for select using (bucket_id = 'proofs');
create policy "auth upload proofs" on storage.objects
  for insert with check (bucket_id = 'proofs' and auth.role() = 'authenticated');
create policy "auth remove proofs" on storage.objects
  for delete using (bucket_id = 'proofs' and auth.role() = 'authenticated');
