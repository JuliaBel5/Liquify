import type { Color, Tube } from './types.js';

export function canonicalKey(tubes: readonly Tube[]): string {
  return tubes.map((tube) => tube.join(',')).sort().join('|');
}

export function cloneTubes(tubes: readonly Tube[]): Tube[] {
  return tubes.map((tube) => [...tube]);
}

export function topColor(tube: Tube): Color | null {
  return tube.length === 0 ? null : tube[tube.length - 1] ?? null;
}
