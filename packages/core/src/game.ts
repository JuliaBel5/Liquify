import { MVP_LEVEL_DEFAULTS } from './constants.js';
import type { GameState, Move, Tube } from './types.js';
import { cloneTubes, topColor } from './utils.js';

const CAPACITY = MVP_LEVEL_DEFAULTS.TUBE_CAPACITY;

function isFullSingleColor(tube: Tube): boolean {
  if (tube.length !== CAPACITY) return false;

  const first = tube[0];
  return first !== undefined && tube.every((color) => color === first);
}

export function canMove(state: GameState, from: number, to: number): boolean {
  if (from === to) return false;

  const source = state.tubes[from];
  const target = state.tubes[to];
  if (source === undefined || target === undefined) return false;
  if (source.length === 0) return false;
  if (target.length >= CAPACITY) return false;

  const sourceTop = topColor(source);
  const targetTop = topColor(target);
  return targetTop === null || targetTop === sourceTop;
}

export function applyMove(state: GameState, from: number, to: number): GameState {
  if (!canMove(state, from, to)) {
    throw new Error(`Invalid move from ${from} to ${to}`);
  }

  const tubes = cloneTubes(state.tubes).map((tube) => [...tube]);
  const source = tubes[from];
  const target = tubes[to];
  if (source === undefined || target === undefined) {
    throw new Error(`Invalid move from ${from} to ${to}`);
  }

  const color = topColor(source);
  if (color === null) {
    throw new Error(`Invalid move from ${from} to ${to}`);
  }

  let count = 0;
  while (source.length > 0 && target.length < CAPACITY && topColor(source) === color) {
    source.pop();
    target.push(color);
    count += 1;
  }

  const move: Move = { from, to, count, color };
  const nextState: GameState = {
    tubes,
    movesCount: state.movesCount + 1,
    history: [...state.history, move],
    startedAt: state.movesCount === 0 && state.startedAt === 0 ? Date.now() : state.startedAt,
    status: 'playing',
    usedAids: state.usedAids,
  };

  return {
    ...nextState,
    status: isSolved(nextState) ? 'won' : 'playing',
  };
}

export function undoMove(state: GameState): GameState {
  const move = state.history[state.history.length - 1];
  if (move === undefined) {
    throw new Error('Cannot undo without history');
  }

  const tubes = cloneTubes(state.tubes).map((tube) => [...tube]);
  const source = tubes[move.from];
  const target = tubes[move.to];
  if (source === undefined || target === undefined) {
    throw new Error('Cannot undo invalid history entry');
  }

  for (let index = 0; index < move.count; index += 1) {
    const color = target.pop();
    if (color !== move.color) {
      throw new Error('Cannot undo corrupted history entry');
    }
    source.push(color);
  }

  const history = state.history.slice(0, -1);
  return {
    tubes,
    movesCount: Math.max(0, state.movesCount - 1),
    history,
    startedAt: history.length === 0 ? 0 : state.startedAt,
    status: 'playing',
    usedAids: true,
  };
}

export function isSolved(state: GameState): boolean {
  return state.tubes.every((tube) => tube.length === 0 || isFullSingleColor(tube));
}

export function isTrivial(tubes: readonly Tube[]): boolean {
  return tubes.every((tube) => tube.length === 0 || isFullSingleColor(tube));
}

export function createInitialState(tubes: readonly Tube[]): GameState {
  const cloned = cloneTubes(tubes);
  return {
    tubes: cloned,
    movesCount: 0,
    history: [],
    startedAt: 0,
    status: isTrivial(cloned) ? 'won' : 'playing',
    usedAids: false,
  };
}

export function legalMoves(state: GameState): Move[] {
  const moves: Move[] = [];
  for (let from = 0; from < state.tubes.length; from += 1) {
    for (let to = 0; to < state.tubes.length; to += 1) {
      if (canMove(state, from, to)) {
        moves.push({ from, to, count: 0, color: 0 });
      }
    }
  }

  return moves;
}
