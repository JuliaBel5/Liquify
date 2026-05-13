import { describe, expect, it } from 'vitest';
import { applyMove, canMove, createInitialState, isSolved } from '../src/game.js';
import { generateSolvableLevel } from '../src/generator.js';
import { findHint, solveDFS, solveDFSWithStats } from '../src/solver.js';
import type { GameState, Move, Tube } from '../src/types.js';

function state(tubes: readonly Tube[]): GameState {
  return createInitialState(tubes);
}

function applyPath(initial: GameState, path: readonly Move[]): GameState {
  let current = initial;
  for (const move of path) {
    current = applyMove(current, move.from, move.to);
  }
  return current;
}

describe('solveDFS', () => {
  it('returns an empty path for an already solved state', () => {
    expect(solveDFS(state([[0, 0, 0, 0], [1, 1, 1, 1], []]))).toEqual([]);
  });

  it('returns one move when the board is one move away from solved', () => {
    const initial = state([[0, 0, 0], [0], []]);
    const solution = solveDFS(initial);

    expect(solution).toHaveLength(1);
    expect(solution?.[0]?.count).toBeGreaterThan(0);
    expect(isSolved(applyPath(initial, solution ?? []))).toBe(true);
  });

  it('solves a fixed mixed position within the expected path length', () => {
    const initial = state([
      [0, 1, 0, 1],
      [1, 0, 1, 0],
      [],
      [],
    ]);
    const solution = solveDFS(initial);

    expect(solution).not.toBeNull();
    expect(solution?.length).toBeLessThanOrEqual(10);
    expect(isSolved(applyPath(initial, solution ?? []))).toBe(true);
  });

  it('returns null for an unsolvable full position with no legal moves', () => {
    const initial = state([
      [0, 1, 2, 3],
      [1, 2, 3, 0],
    ]);

    expect(solveDFS(initial)).toBeNull();
  });

  it('findHint returns a currently legal move', () => {
    const initial = state(generateSolvableLevel({ seed: 700 }));
    const hint = findHint(initial);

    expect(hint).not.toBeNull();
    expect(hint === null ? false : canMove(initial, hint.from, hint.to)).toBe(true);
  });

  it('returns null hint when no solution exists', () => {
    expect(findHint(state([[0, 1, 2, 3], [1, 2, 3, 0]]))).toBeNull();
  });

  it('averages under 1000 iterations across 50 generated levels', () => {
    let totalIterations = 0;

    for (let seed = 800; seed < 850; seed += 1) {
      const initial = state(generateSolvableLevel({ seed }));
      let callbackIterations = 0;
      const result = solveDFSWithStats(initial, 20_000, (iterations) => {
        callbackIterations = iterations;
      });

      expect(result.moves).not.toBeNull();
      expect(callbackIterations).toBe(result.iterations);
      totalIterations += result.iterations;
    }

    expect(totalIterations / 50).toBeLessThan(1_000);
  });
});
