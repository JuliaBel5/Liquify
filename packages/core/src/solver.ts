import { MVP_LEVEL_DEFAULTS } from './constants.js';
import { applyMove, canMove, isSolved, legalMoves } from './game.js';
import type { GameState, Hint, Move, Tube } from './types.js';
import { canonicalKey, topColor } from './utils.js';

interface Frame {
  state: GameState;
  path: Move[];
}

export interface SolveStats {
  moves: Move[] | null;
  iterations: number;
}

const CAPACITY = MVP_LEVEL_DEFAULTS.TUBE_CAPACITY;

function isSingleColor(tube: Tube): boolean {
  if (tube.length === 0) return true;
  const first = tube[0];
  return first !== undefined && tube.every((color) => color === first);
}

function topBlockSize(tube: Tube): number {
  const color = topColor(tube);
  if (color === null) return 0;

  let count = 0;
  for (let index = tube.length - 1; index >= 0; index -= 1) {
    if (tube[index] !== color) break;
    count += 1;
  }
  return count;
}

function moveScore(state: GameState, move: Move): number {
  const source = state.tubes[move.from];
  const target = state.tubes[move.to];
  if (source === undefined || target === undefined) return 0;

  const blockSize = topBlockSize(source);
  let score = blockSize;
  if (target.length > 0) score += 100;
  if (target.length + Math.min(blockSize, CAPACITY - target.length) === CAPACITY) score += 50;
  if (source.length === blockSize) score += 25;
  return score;
}

function candidateMoves(state: GameState): Move[] {
  const firstEmptyIndex = state.tubes.findIndex((tube) => tube.length === 0);

  return legalMoves(state)
    .filter((move) => {
      const source = state.tubes[move.from];
      const target = state.tubes[move.to];
      if (source === undefined || target === undefined) return false;
      if (source.length === CAPACITY && isSingleColor(source)) return false;

      if (target.length === 0) {
        if (move.to !== firstEmptyIndex) return false;
        if (isSingleColor(source)) return false;
      }

      return canMove(state, move.from, move.to);
    })
    .sort((left, right) => moveScore(state, left) - moveScore(state, right));
}

export function solveDFSWithStats(
  initial: GameState,
  maxIters = 20_000,
  onIteration?: (iterations: number) => void,
): SolveStats {
  const stack: Frame[] = [{ state: initial, path: [] }];
  const seen = new Set<string>([canonicalKey(initial.tubes)]);
  let iterations = 0;

  while (stack.length > 0) {
    const frame = stack.pop();
    if (frame === undefined) break;
    if (isSolved(frame.state)) return { moves: frame.path, iterations };

    iterations += 1;
    onIteration?.(iterations);
    if (iterations > maxIters) return { moves: null, iterations };

    for (const move of candidateMoves(frame.state)) {
      const next = applyMove(frame.state, move.from, move.to);
      const key = canonicalKey(next.tubes);
      if (seen.has(key)) continue;

      const appliedMove = next.history[next.history.length - 1];
      if (appliedMove === undefined) continue;

      seen.add(key);
      stack.push({ state: next, path: [...frame.path, appliedMove] });
    }
  }

  return { moves: null, iterations };
}

export function solveDFS(state: GameState, maxIters = 20_000): Move[] | null {
  return solveDFSWithStats(state, maxIters).moves;
}

export function findHint(state: GameState, maxIters = 20_000): Hint | null {
  const moves = solveDFS(state, maxIters);
  const first = moves?.[0];
  if (first === undefined) return null;
  return { from: first.from, to: first.to };
}
