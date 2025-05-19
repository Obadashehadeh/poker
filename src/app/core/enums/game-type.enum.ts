export enum GameType {
  FIBONACCI = 'Fibonacci (0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89)',
  NUMBERS = 'Numbers 1-15 (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15)',
  POWERS_OF_TWO = 'Powers of 2 (0, 1, 2, 4, 8, 16, 32, 64)'
}

export interface GameTypeConfig {
  type: GameType;
  values: number[];
  label: string;
  description: string;
}

export const GAME_TYPE_CONFIGS: GameTypeConfig[] = [
  {
    type: GameType.FIBONACCI,
    values: [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89],
    label: 'Fibonacci',
    description: 'Classic Fibonacci sequence for story point estimation'
  },
  {
    type: GameType.NUMBERS,
    values: Array.from({ length: 15 }, (_, i) => i + 1),
    label: 'Numbers 1-15',
    description: 'Simple numeric sequence from 1 to 15'
  },
  {
    type: GameType.POWERS_OF_TWO,
    values: [0, 1, 2, 4, 8, 16, 32, 64],
    label: 'Powers of 2',
    description: 'Powers of two for technical complexity estimation'
  }
];
