export type UUID = string;

export interface Session {
  id: UUID;
  name: string;
  slug: string;
  is_active: boolean;
  created_at?: string;
}

export interface Participant {
  id: UUID;
  session_id: UUID;
  display_name: string;
  handle?: string | null;
  avatar_url?: string | null;
  created_at?: string;
}

export interface Challenge {
  id: UUID;
  session_id: UUID;
  title: string;
  description?: string | null;
  position: number;
  points?: number | null;
  created_at?: string;
}

export interface Completion {
  id: UUID;
  session_id: UUID;
  participant_id: UUID;
  challenge_id: UUID;
  proof_url?: string | null;
  created_at?: string;
}

export interface LeaderboardEntry {
  participant: Participant;
  completed: number;
  hasBingo: boolean;
}
