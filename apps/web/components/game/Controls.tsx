'use client';

import { useTranslations } from '@/app/providers';
import { useGameStore } from '@/lib/store';

export function Controls() {
  const t = useTranslations('game.controls');
  const state = useGameStore((store) => store.state);
  const isAnimating = useGameStore((store) => store.isAnimating);
  const actions = useGameStore((store) => store.actions);
  const isWon = state?.status === 'won';
  const disabled = state === null || isAnimating;

  return (
    <div className="glass-card flex flex-wrap items-center justify-center gap-2 rounded-[1.5rem] p-3 sm:gap-3 sm:p-4">
      <button
        type="button"
        data-testid="undo-btn"
        disabled={disabled || isWon || (state?.history.length ?? 0) === 0}
        onClick={actions.undo}
        className="lab-button"
      >
        {t('undo')}
      </button>
      <button
        type="button"
        data-testid="hint-btn"
        disabled={disabled || isWon}
        onClick={actions.hint}
        className="lab-button"
      >
        {t('hint')}
      </button>
      <button
        type="button"
        data-testid="shuffle-btn"
        disabled={disabled}
        onClick={actions.shuffle}
        className="lab-button"
      >
        {t('shuffle')}
      </button>
      <button
        type="button"
        data-testid="new-game-btn"
        disabled={disabled}
        onClick={actions.newGame}
        className="lab-button border-lime-200/40 text-lime-50 hover:border-lime-100/80 hover:bg-lime-100/15"
      >
        {t('newGame')}
      </button>
    </div>
  );
}
