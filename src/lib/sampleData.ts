import { Challenge, Completion, Participant, Session } from "./types";

export const sampleSession: Session = {
  id: "00000000-0000-0000-0000-000000000001",
  name: "BitBingo Kickoff",
  slug: "bitbingo-kickoff",
  is_active: true,
};

export const sampleParticipants: Participant[] = [
  {
    id: "00000000-0000-0000-0000-000000000010",
    session_id: sampleSession.id,
    display_name: "Ada Nova",
    handle: "@ada",
  },
  {
    id: "00000000-0000-0000-0000-000000000011",
    session_id: sampleSession.id,
    display_name: "Lin Conway",
    handle: "@lin",
  },
  {
    id: "00000000-0000-0000-0000-000000000012",
    session_id: sampleSession.id,
    display_name: "Kai Malik",
    handle: "@kai",
  },
];

const challengeTitles = [
  "Circle printing logic based on coordinate geometry",
  "Bitwise parity checker",
  "Two-pointer palindrome scanner",
  "Memoized Fibonacci stream",
  "Matrix spiral traversal",
  "Balanced bracket automaton",
  "Greedy coin change audit",
  "Depth-first grid islands",
  "Dynamic window substring search",
  "Linked list cycle detector",
  "Binary search edge finder",
  "Prefix sum anomaly detector",
  "LRU cache warmup",
  "Event-loop microtask tracer",
  "Promise race orchestrator",
  "Heap-based task scheduler",
  "Topological sort of modules",
  "Trie autocomplete builder",
  "Segment tree range updater",
  "Union-Find cluster join",
  "WebSocket heartbeat pinger",
  "Token bucket rate limiter",
  "CRC checksum validator",
  "Color flood fill routine",
  "Sensor jitter smoothing filter",
];

export const sampleChallenges: Challenge[] = challengeTitles.map(
  (title, index) => ({
    id: `00000000-0000-0000-0000-0000000001${(index + 1)
      .toString()
      .padStart(2, "0")}`,
    session_id: sampleSession.id,
    title,
    description: null,
    position: index,
    points: 10,
  }),
);

export const sampleCompletions: Completion[] = [
  {
    id: "00000000-0000-0000-0000-00000000c001",
    session_id: sampleSession.id,
    participant_id: sampleParticipants[0].id,
    challenge_id: sampleChallenges[0].id,
  },
  {
    id: "00000000-0000-0000-0000-00000000c002",
    session_id: sampleSession.id,
    participant_id: sampleParticipants[0].id,
    challenge_id: sampleChallenges[1].id,
  },
  {
    id: "00000000-0000-0000-0000-00000000c003",
    session_id: sampleSession.id,
    participant_id: sampleParticipants[0].id,
    challenge_id: sampleChallenges[2].id,
  },
  {
    id: "00000000-0000-0000-0000-00000000c004",
    session_id: sampleSession.id,
    participant_id: sampleParticipants[0].id,
    challenge_id: sampleChallenges[3].id,
  },
  {
    id: "00000000-0000-0000-0000-00000000c005",
    session_id: sampleSession.id,
    participant_id: sampleParticipants[0].id,
    challenge_id: sampleChallenges[4].id,
  },
  {
    id: "00000000-0000-0000-0000-00000000c006",
    session_id: sampleSession.id,
    participant_id: sampleParticipants[1].id,
    challenge_id: sampleChallenges[5].id,
  },
  {
    id: "00000000-0000-0000-0000-00000000c007",
    session_id: sampleSession.id,
    participant_id: sampleParticipants[1].id,
    challenge_id: sampleChallenges[10].id,
  },
  {
    id: "00000000-0000-0000-0000-00000000c008",
    session_id: sampleSession.id,
    participant_id: sampleParticipants[2].id,
    challenge_id: sampleChallenges[6].id,
  },
  {
    id: "00000000-0000-0000-0000-00000000c009",
    session_id: sampleSession.id,
    participant_id: sampleParticipants[2].id,
    challenge_id: sampleChallenges[11].id,
  },
  {
    id: "00000000-0000-0000-0000-00000000c010",
    session_id: sampleSession.id,
    participant_id: sampleParticipants[2].id,
    challenge_id: sampleChallenges[16].id,
  },
];
