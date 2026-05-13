import {
  applyMove,
  canMove,
  createInitialState,
  findHint,
  generateSolvableLevel,
  MVP_LEVEL_DEFAULTS,
  undoMove,
  type GameState,
  type Hint,
} from '@liquify/core';
import { create } from 'zustand';
import { repository } from './repository';

interface LastMove {
  from: number;
  to: number;
}

interface GameStore {
  state: GameState | null;
  selectedTubeIndex: number | null;
  hintHighlight: Hint | null;
  lastMove: LastMove | null;
  isAnimating: boolean;
  noMovesDialogOpen: boolean;
  recordSaved: boolean;
  actions: {
    init(): void;
    selectTube(index: number): void;
    move(from: number, to: number): void;
    undo(): void;
    hint(): void;
    shuffle(): void;
    newGame(): void;
    clearHintHighlight(): void;
    dismissNoMovesDialog(): void;
  };
}

let hintTimer: ReturnType<typeof setTimeout> | null = null;
let animationTimer: ReturnType<typeof setTimeout> | null = null;

function createFreshGame(): GameState {
  return createInitialState(generateSolvableLevel());
}

function isCurrentLevelConfig(state: GameState): boolean {
  return state.tubes.length === MVP_LEVEL_DEFAULTS.TUBES_TOTAL;
}

function hasResultativeMoves(state: GameState): boolean {
  return state.status === 'won' || findHint(state) !== null;
}

function clearHintTimer(): void {
  if (hintTimer !== null) {
    clearTimeout(hintTimer);
    hintTimer = null;
  }
}

function clearAnimationTimer(): void {
  if (animationTimer !== null) {
    clearTimeout(animationTimer);
    animationTimer = null;
  }
}

export const useGameStore = create<GameStore>((set, get) => ({
  state: null,
  selectedTubeIndex: null,
  hintHighlight: null,
  lastMove: null,
  isAnimating: false,
  noMovesDialogOpen: false,
  recordSaved: false,
  actions: {
    init() {
      const current = get().state;
      if (current !== null && isCurrentLevelConfig(current)) return;
      set({ state: createFreshGame(), recordSaved: false });
    },

    selectTube(index) {
      const current = get().state;
      if (current === null || current.status === 'won' || get().isAnimating) return;

      const selected = get().selectedTubeIndex;
      if (selected === index) {
        set({ selectedTubeIndex: null });
        return;
      }

      if (selected === null) {
        const tube = current.tubes[index];
        set({ selectedTubeIndex: tube !== undefined && tube.length > 0 ? index : null });
        return;
      }

      if (canMove(current, selected, index)) {
        get().actions.move(selected, index);
        return;
      }

      set({ selectedTubeIndex: null });
    },

    move(from, to) {
      const current = get().state;
      if (current === null || current.status === 'won' || get().isAnimating) return;
      if (!canMove(current, from, to)) {
        set({ selectedTubeIndex: null });
        return;
      }

      const next = applyMove(current, from, to);
      const shouldSaveRecord = next.status === 'won' && !next.usedAids && !get().recordSaved;
      const noMovesDialogOpen = next.status !== 'won' && !hasResultativeMoves(next);
      const completedAt = Date.now();

      clearHintTimer();
      clearAnimationTimer();
      set({
        state: next,
        selectedTubeIndex: null,
        hintHighlight: null,
        lastMove: { from, to },
        isAnimating: true,
        noMovesDialogOpen,
        recordSaved: shouldSaveRecord ? true : get().recordSaved,
      });

      if (shouldSaveRecord) {
        void repository.save({
          moves: next.movesCount,
          completedAt,
          durationMs: Math.max(0, completedAt - next.startedAt),
        }).catch((error: unknown) => {
          console.error('Failed to save Liquify record', error);
        });
      }

      animationTimer = setTimeout(() => {
        set({ isAnimating: false, lastMove: null });
        animationTimer = null;
      }, 340);
    },

    undo() {
      const current = get().state;
      if (current === null || current.history.length === 0 || get().isAnimating) return;

      clearHintTimer();
      const next = undoMove(current);
      set({
        state: next,
        selectedTubeIndex: null,
        hintHighlight: null,
        noMovesDialogOpen: next.status !== 'won' && !hasResultativeMoves(next),
      });
    },

    hint() {
      const current = get().state;
      if (current === null || current.status === 'won' || get().isAnimating) return;

      clearHintTimer();
      const hintHighlight = findHint(current);
      const next: GameState = { ...current, usedAids: true };
      set({
        state: next,
        selectedTubeIndex: null,
        hintHighlight,
        noMovesDialogOpen: hintHighlight === null && next.status !== 'won',
      });

      if (hintHighlight !== null) {
        hintTimer = setTimeout(() => {
          get().actions.clearHintHighlight();
        }, 2000);
      }
    },

    shuffle() {
      clearHintTimer();
      clearAnimationTimer();
      set({
        state: createFreshGame(),
        selectedTubeIndex: null,
        hintHighlight: null,
        lastMove: null,
        isAnimating: false,
        noMovesDialogOpen: false,
        recordSaved: false,
      });
    },

    newGame() {
      get().actions.shuffle();
    },

    clearHintHighlight() {
      clearHintTimer();
      set({ hintHighlight: null });
    },

    dismissNoMovesDialog() {
      set({ noMovesDialogOpen: false });
    },
  },
}));
