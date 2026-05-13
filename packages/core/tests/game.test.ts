import { describe, expect, it, vi } from 'vitest';
import {
  applyMove,
  canMove,
  createInitialState,
  isSolved,
  isTrivial,
  legalMoves,
  undoMove,
} from '../src/game.js';
import type { Tube } from '../src/types.js';

function state(tubes: readonly Tube[]) {
  return createInitialState(tubes);
}

describe('game rules', () => {
  it('canMove returns false when from equals to', () => {
    expect(canMove(state([[0], []]), 0, 0)).toBe(false);
  });

  it('canMove returns false when from is empty', () => {
    expect(canMove(state([[], []]), 0, 1)).toBe(false);
  });

  it('canMove returns false when target is full', () => {
    expect(canMove(state([[0], [0, 0, 0, 0]]), 0, 1)).toBe(false);
  });

  it('canMove returns true when target is empty', () => {
    expect(canMove(state([[0, 1], []]), 0, 1)).toBe(true);
  });

  it('canMove returns true when top colors match and target has room', () => {
    expect(canMove(state([[2, 1], [3, 1]]), 0, 1)).toBe(true);
  });

  it('canMove returns false when top colors mismatch', () => {
    expect(canMove(state([[2, 1], [3, 2]]), 0, 1)).toBe(false);
  });

  it('canMove returns false for out-of-range indexes', () => {
    expect(canMove(state([[0], []]), -1, 1)).toBe(false);
    expect(canMove(state([[0], []]), 0, 3)).toBe(false);
  });

  it('applyMove pours a single top layer correctly', () => {
    vi.useFakeTimers();
    vi.setSystemTime(1_000);
    const next = applyMove(state([[0, 1], []]), 0, 1);

    expect(next.tubes).toEqual([[0], [1]]);
    expect(next.movesCount).toBe(1);
    expect(next.startedAt).toBe(1_000);
    expect(next.history).toEqual([{ from: 0, to: 1, count: 1, color: 1 }]);
    vi.useRealTimers();
  });

  it('applyMove pours multiple matching layers and stops at target capacity', () => {
    const next = applyMove(state([[2, 1, 1, 1], [1, 1]]), 0, 1);

    expect(next.tubes).toEqual([[2, 1], [1, 1, 1, 1]]);
    expect(next.history[0]).toEqual({ from: 0, to: 1, count: 2, color: 1 });
  });

  it('applyMove pours all matching layers when target has room', () => {
    const next = applyMove(state([[2, 1, 1], []]), 0, 1);

    expect(next.tubes).toEqual([[2], [1, 1]]);
    expect(next.history[0]).toEqual({ from: 0, to: 1, count: 2, color: 1 });
  });

  it('applyMove does not mutate input state or nested tubes', () => {
    const initial = state([[2, 1, 1], []]);
    const snapshot = structuredClone(initial);
    const next = applyMove(initial, 0, 1);

    expect(initial).toEqual(snapshot);
    expect(next).not.toBe(initial);
    expect(next.tubes).not.toBe(initial.tubes);
    expect(next.tubes[0]).not.toBe(initial.tubes[0]);
  });

  it('applyMove throws for invalid moves', () => {
    expect(() => applyMove(state([[0], [1]]), 0, 1)).toThrow('Invalid move');
  });

  it('undoMove after applyMove restores tubes and marks usedAids true', () => {
    const initial = state([[2, 1, 1], []]);
    const moved = applyMove(initial, 0, 1);
    const undone = undoMove(moved);

    expect(undone.tubes).toEqual(initial.tubes);
    expect(undone.movesCount).toBe(0);
    expect(undone.history).toEqual([]);
    expect(undone.startedAt).toBe(0);
    expect(undone.usedAids).toBe(true);
  });

  it('undoMove throws when history is empty', () => {
    expect(() => undoMove(state([[0], []]))).toThrow('Cannot undo');
  });

  it('isSolved is true only when each tube is empty or full single-color', () => {
    expect(isSolved(state([[0, 0, 0, 0], [], [1, 1, 1, 1]]))).toBe(true);
    expect(isSolved(state([[0, 0, 0], []]))).toBe(false);
    expect(isSolved(state([[0, 0, 1, 0], []]))).toBe(false);
  });

  it('isTrivial checks solved starting tube layouts', () => {
    expect(isTrivial([[0, 0, 0, 0], [], [1, 1, 1, 1]])).toBe(true);
    expect(isTrivial([[0, 1, 0, 1], []])).toBe(false);
  });

  it('applyMove updates status to won when the resulting board is solved', () => {
    const next = applyMove(state([[0, 0, 0], [1, 1, 1, 1], [0], []]), 2, 0);

    expect(next.status).toBe('won');
  });

  it('legalMoves returns all valid placeholder moves', () => {
    expect(legalMoves(state([[0], [0], [], [1]]))).toEqual([
      { from: 0, to: 1, count: 0, color: 0 },
      { from: 0, to: 2, count: 0, color: 0 },
      { from: 1, to: 0, count: 0, color: 0 },
      { from: 1, to: 2, count: 0, color: 0 },
      { from: 3, to: 2, count: 0, color: 0 },
    ]);
  });
});
