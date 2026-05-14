import { MVP_LEVEL_DEFAULTS } from './constants.js';
import type { Color, GameState, Move, Tube } from './types.js';
import { cloneTubes, topColor } from './utils.js';

const CAPACITY = MVP_LEVEL_DEFAULTS.TUBE_CAPACITY;

interface QuickFinishTarget {
  index: number;
  color: Color;
}

function uniformColor(tube: Tube, expectedLength: number): Color | null {
  if (tube.length !== expectedLength) return null;

  const first = tube[0];
  if (first === undefined) return null;

  return tube.every((color) => color === first) ? first : null;
}

function isFullSingleColor(tube: Tube): boolean {
  return uniformColor(tube, CAPACITY) !== null;
}

function getQuickFinishTargets(state: GameState): QuickFinishTarget[] | null {
  if (state.status === 'won' || state.tubes.length !== MVP_LEVEL_DEFAULTS.TUBES_TOTAL) {
    return null;
  }

  const fullColors = new Set<Color>();
  const nearTargets: QuickFinishTarget[] = [];
  const remainingTubeIndexes: number[] = [];

  state.tubes.forEach((tube, index) => {
    const fullColor = uniformColor(tube, CAPACITY);
    if (fullColor !== null) {
      fullColors.add(fullColor);
      return;
    }

    const nearColor = uniformColor(tube, CAPACITY - 1);
    if (nearColor !== null) {
      nearTargets.push({ index, color: nearColor });
      return;
    }

    remainingTubeIndexes.push(index);
  });

  const nearColors = new Set(nearTargets.map((target) => target.color));
  if (
    fullColors.size !== 5
    || nearTargets.length !== 3
    || nearColors.size !== 3
    || remainingTubeIndexes.length !== MVP_LEVEL_DEFAULTS.EMPTY_TUBES
  ) {
    return null;
  }

  if (nearTargets.some((target) => fullColors.has(target.color))) {
    return null;
  }

  const missingCounts = new Map<Color, number>();
  nearTargets.forEach((target) => missingCounts.set(target.color, 0));

  for (const tubeIndex of remainingTubeIndexes) {
    const tube = state.tubes[tubeIndex];
    if (tube === undefined) return null;

    for (const color of tube) {
      const current = missingCounts.get(color);
      if (current === undefined) return null;
      missingCounts.set(color, current + 1);
    }
  }

  return [...missingCounts.values()].every((count) => count === 1) ? nearTargets : null;
}

function findQuickFinishSource(state: GameState, target: QuickFinishTarget): number | null {
  const sourceIndex = state.tubes.findIndex((tube, index) => (
    index !== target.index
    && topColor(tube) === target.color
    && canMove(state, index, target.index)
  ));

  return sourceIndex === -1 ? null : sourceIndex;
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

export function getQuickFinishMoves(state: GameState): Move[] {
  const targets = getQuickFinishTargets(state);
  if (targets === null) return [];

  let next = state;
  const pendingTargets = [...targets];
  const moves: Move[] = [];

  while (pendingTargets.length > 0) {
    const targetIndex = pendingTargets.findIndex((target) => findQuickFinishSource(next, target) !== null);
    if (targetIndex === -1) return [];

    const [target] = pendingTargets.splice(targetIndex, 1);
    if (target === undefined) return [];

    const sourceIndex = findQuickFinishSource(next, target);
    if (sourceIndex === null) return [];

    next = applyMove(next, sourceIndex, target.index);
    const move = next.history[next.history.length - 1];
    if (move === undefined) return [];
    moves.push(move);
  }

  return isSolved(next) ? moves : [];
}

export function canQuickFinish(state: GameState): boolean {
  return getQuickFinishMoves(state).length > 0;
}

export function applyQuickFinish(state: GameState): GameState | null {
  const moves = getQuickFinishMoves(state);
  if (moves.length === 0) return null;

  let next: GameState = { ...state, usedAids: true };
  for (const move of moves) {
    next = applyMove(next, move.from, move.to);
  }

  return next.status === 'won' ? next : null;
}
