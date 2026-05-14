import { describe, expect, it } from 'vitest';
import {
  applyQuickFinish,
  canQuickFinish,
  createInitialState,
  getQuickFinishMoves,
} from '../src/game.js';
import type { Tube } from '../src/types.js';

function state(tubes: readonly Tube[]) {
  return createInitialState(tubes);
}

describe('quick finish', () => {
  const quickFinishTubes: readonly Tube[] = [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [2, 2, 2, 2],
    [3, 3, 3, 3],
    [4, 4, 4, 4],
    [5, 5, 5],
    [6, 6, 6],
    [7, 7, 7],
    [5, 6],
    [7],
  ];

  it('is available for five complete tubes and three one-block-short tubes', () => {
    const initial = state(quickFinishTubes);

    expect(canQuickFinish(initial)).toBe(true);
    expect(getQuickFinishMoves(initial)).toEqual([
      { from: 8, to: 6, count: 1, color: 6 },
      { from: 8, to: 5, count: 1, color: 5 },
      { from: 9, to: 7, count: 1, color: 7 },
    ]);
  });

  it('completes the board and marks the run as aided', () => {
    const initial = state(quickFinishTubes);
    const finished = applyQuickFinish(initial);

    expect(finished).not.toBeNull();
    expect(finished?.status).toBe('won');
    expect(finished?.usedAids).toBe(true);
    expect(finished?.movesCount).toBe(3);
    expect(finished?.history).toHaveLength(3);
    expect(finished?.tubes).toEqual([
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [2, 2, 2, 2],
      [3, 3, 3, 3],
      [4, 4, 4, 4],
      [5, 5, 5, 5],
      [6, 6, 6, 6],
      [7, 7, 7, 7],
      [],
      [],
    ]);
  });

  it('is unavailable when fewer than five tubes are complete', () => {
    const initial = state([
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [2, 2, 2, 2],
      [3, 3, 3, 3],
      [4, 4, 4],
      [5, 5, 5],
      [6, 6, 6],
      [7, 7, 7],
      [4, 5, 6],
      [7],
    ]);

    expect(canQuickFinish(initial)).toBe(false);
    expect(applyQuickFinish(initial)).toBeNull();
  });

  it('is unavailable when stray blocks are not exactly the missing colors', () => {
    const initial = state([
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [2, 2, 2, 2],
      [3, 3, 3, 3],
      [4, 4, 4, 4],
      [5, 5, 5],
      [6, 6, 6],
      [7, 7, 7],
      [5, 5],
      [7],
    ]);

    expect(canQuickFinish(initial)).toBe(false);
    expect(getQuickFinishMoves(initial)).toEqual([]);
  });
});
