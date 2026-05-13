// Public API barrel for @liquify/core
// All UI-agnostic game logic lives here.

export { MVP_LEVEL_DEFAULTS } from './constants.js';
export type {
  Color,
  Tube,
  Move,
  GameState,
  Hint,
  LevelConfig,
} from './types.js';
export {
  canMove,
  applyMove,
  undoMove,
  isSolved,
  isTrivial,
  createInitialState,
  legalMoves,
} from './game.js';
export { generateSolvableLevel, shuffle } from './generator.js';
export { solveDFS, findHint } from './solver.js';
export type { RecordsRepository, GameRecord } from './storage/records-repository.js';
export { LocalStorageRepository } from './storage/local-storage-repository.js';
