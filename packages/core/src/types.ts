export type Color = number;

export type Tube = readonly Color[];

export interface Move {
  from: number;
  to: number;
  count: number;
  color: Color;
}

export type GameStatus = 'playing' | 'won';

export interface GameState {
  tubes: readonly Tube[];
  movesCount: number;
  history: readonly Move[];
  startedAt: number;
  status: GameStatus;
  usedAids: boolean;
}

export interface Hint {
  from: number;
  to: number;
}

export interface LevelConfig {
  tubes: number;
  capacity: number;
  colors: number;
  empty: number;
  seed?: number;
}
