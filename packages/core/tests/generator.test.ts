import { describe, expect, it } from 'vitest';
import { MVP_LEVEL_DEFAULTS } from '../src/constants.js';
import { generateSolvableLevel, shuffle } from '../src/generator.js';
import { createInitialState, isTrivial } from '../src/game.js';
import { solveDFS } from '../src/solver.js';
import type { Tube } from '../src/types.js';

function countColors(tubes: readonly Tube[]): Map<number, number> {
  const counts = new Map<number, number>();
  for (const tube of tubes) {
    for (const color of tube) {
      counts.set(color, (counts.get(color) ?? 0) + 1);
    }
  }
  return counts;
}

describe('generateSolvableLevel', () => {
  it('default config returns expected number of tubes', () => {
    const tubes = generateSolvableLevel({ seed: 1 });

    expect(tubes).toHaveLength(MVP_LEVEL_DEFAULTS.TUBES_TOTAL);
  });

  it('returns 10 filled tubes of capacity 4 and 2 empty tubes', () => {
    const tubes = generateSolvableLevel({ seed: 2 });
    const filled = tubes.filter((tube) => tube.length === MVP_LEVEL_DEFAULTS.TUBE_CAPACITY);
    const empty = tubes.filter((tube) => tube.length === 0);

    expect(filled).toHaveLength(MVP_LEVEL_DEFAULTS.COLORS_COUNT);
    expect(empty).toHaveLength(MVP_LEVEL_DEFAULTS.EMPTY_TUBES);
  });

  it('contains exactly four balls for each of the ten colors', () => {
    const tubes = generateSolvableLevel({ seed: 3 });
    const counts = countColors(tubes);

    expect(counts.size).toBe(MVP_LEVEL_DEFAULTS.COLORS_COUNT);
    for (const count of counts.values()) {
      expect(count).toBe(MVP_LEVEL_DEFAULTS.TUBE_CAPACITY);
    }
  });

  it('does not generate trivial solved levels across 100 generations', () => {
    for (let seed = 10; seed < 110; seed += 1) {
      expect(isTrivial(generateSolvableLevel({ seed }))).toBe(false);
    }
  });

  it('generates solvable levels across 100 generations', () => {
    for (let seed = 200; seed < 300; seed += 1) {
      const tubes = generateSolvableLevel({ seed });
      expect(solveDFS(createInitialState(tubes))).not.toBeNull();
    }
  });

  it('generates 100 levels in under 5 seconds', () => {
    const startedAt = performance.now();

    for (let seed = 400; seed < 500; seed += 1) {
      generateSolvableLevel({ seed });
    }

    expect(performance.now() - startedAt).toBeLessThan(5_000);
  });

  it('throws for invalid level invariants', () => {
    expect(() => generateSolvableLevel({ tubes: 3, colors: 3, empty: 1 })).toThrow('colors + empty');
  });

  it('throws for non-MVP capacity because game rules are fixed at 4', () => {
    expect(() => generateSolvableLevel({ tubes: 3, colors: 2, empty: 1, capacity: 5 })).toThrow('capacity must be 4');
  });
});

describe('shuffle action', () => {
  it('returns a fresh solvable state with reset progress and aids', () => {
    const initial = createInitialState(generateSolvableLevel({ seed: 501 }));
    const next = shuffle({ ...initial, movesCount: 5, history: [{ from: 0, to: 1, count: 1, color: 0 }], usedAids: true });

    expect(next.tubes).toHaveLength(MVP_LEVEL_DEFAULTS.TUBES_TOTAL);
    expect(next.movesCount).toBe(0);
    expect(next.history).toEqual([]);
    expect(next.usedAids).toBe(false);
    expect(isTrivial(next.tubes)).toBe(false);
    expect(solveDFS(next)).not.toBeNull();
  });
});
