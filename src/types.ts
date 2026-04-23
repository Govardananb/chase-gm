export interface Player {
  id: string;
  name: string;
}

export interface Team {
  id: string;
  name: string;
  captain: string;
  players: Player[];
}

export interface BoardResult {
  player1: string;
  player2: string;
  result: '1-0' | '0-1' | '1/2-1/2' | '*';
  gameId: string;
}

export interface Fixture {
  id: string;
  set: number | string;
  teamAId: string;
  teamBId: string;
  date: string;
  status: 'pending' | 'completed';
  teamAScore?: number; // Board points total
  teamBScore?: number;
  boardResults?: BoardResult[];
}

// Points Table stats
export interface TeamStats {
  teamId: string;
  teamName: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  boardPoints: number;
  teamPoints: number; // 2 for win, 1 for draw
}
