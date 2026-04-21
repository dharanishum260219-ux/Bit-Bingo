import { Challenge, Completion, Participant } from "./types";

const GRID_SIZE = 5;
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;

const lineIndices: number[][] = [
  // Rows
  [0, 1, 2, 3, 4],
  [5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19],
  [20, 21, 22, 23, 24],
  // Columns
  [0, 5, 10, 15, 20],
  [1, 6, 11, 16, 21],
  [2, 7, 12, 17, 22],
  [3, 8, 13, 18, 23],
  [4, 9, 14, 19, 24],
  // Diagonals
  [0, 6, 12, 18, 24],
  [4, 8, 12, 16, 20],
];

export const ensureBoard = (challenges: Challenge[]): Challenge[] => {
  const sorted = [...challenges].sort((a, b) => a.position - b.position);
  if (sorted.length >= TOTAL_CELLS) {
    return sorted.slice(0, TOTAL_CELLS);
  }

  const padded: Challenge[] = [...sorted];
  for (let i = sorted.length; i < TOTAL_CELLS; i += 1) {
    padded.push({
      id: `placeholder-${i}`,
      session_id: sorted[0]?.session_id ?? "placeholder-session",
      title: `Challenge ${i + 1}`,
      description: null,
      position: i,
    });
  }
  return padded;
};

export const hasBingo = (
  board: Challenge[],
  completedChallengeIds: Set<string>,
) => {
  if (board.length < TOTAL_CELLS) return false;
  return lineIndices.some((line) =>
    line.every((index) => completedChallengeIds.has(board[index].id)),
  );
};

export const computeLeaderboard = (
  participants: Participant[],
  completions: Completion[],
  board: Challenge[],
) =>
  participants.map((participant) => {
    const participantCompletions = completions.filter(
      (completion) => completion.participant_id === participant.id,
    );
    const completedSet = new Set(
      participantCompletions.map((completion) => completion.challenge_id),
    );

    return {
      participant,
      completed: participantCompletions.length,
      hasBingo: hasBingo(board, completedSet),
    };
  });
