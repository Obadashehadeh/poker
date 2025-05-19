export interface GameConfig {
  name: string;
  type: GameType;
  cardValues: number[];
  maxParticipants?: number;
  autoReveal?: boolean;
  allowObservers?: boolean;
}

export interface GameSettings {
  revealTimeout: number;
  allowChangeVote: boolean;
  showVoterNames: boolean;
  enableChat?: boolean;
}

export interface GameSession {
  id: string;
  config: GameConfig;
  settings: GameSettings;
  hostId: string;
  participants: string[];
  createdAt: number;
}

export enum GameType {
  FIBONACCI = 'Fibonacci (0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89)',
  NUMBERS = 'Numbers 1-15 (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15)',
  POWERS_OF_TWO = 'Powers of 2 (0, 1, 2, 4, 8, 16, 32, 64)'
}
