'use client';

import { canQuickFinish } from '@liquify/core';
import { type Locale, useLocaleSwitcher, useTranslations } from '@/app/providers';
import { useGameStore } from '@/lib/store';

const LOCALES: Locale[] = ['ru', 'en'];

export function Controls() {
  const t = useTranslations('game.controls');
  const navigationT = useTranslations('navigation');
  const { locale, setLocale } = useLocaleSwitcher();
  const state = useGameStore((store) => store.state);
  const isAnimating = useGameStore((store) => store.isAnimating);
  const actions = useGameStore((store) => store.actions);
  const isWon = state?.status === 'won';
  const disabled = state === null || isAnimating;
  const quickFinishAvailable = state !== null && canQuickFinish(state);

  return (
    <div className="glass-card flex flex-wrap items-center justify-center gap-2 rounded-[1.5rem] p-3 sm:gap-3 sm:p-4">
      <button
        type="button"
        aria-label={t('undo')}
        data-testid="undo-btn"
        disabled={disabled || isWon || (state?.history.length ?? 0) === 0}
        onClick={actions.undo}
        className="lab-button max-[500px]:grid max-[500px]:h-10 max-[500px]:w-10 max-[500px]:place-items-center max-[500px]:px-0 max-[500px]:py-0"
      >
        <span aria-hidden="true" className="hidden text-lg leading-none max-[500px]:block">↶</span>
        <span className="max-[500px]:sr-only">{t('undo')}</span>
      </button>
      <button
        type="button"
        aria-label={t('hint')}
        data-testid="hint-btn"
        disabled={disabled || isWon}
        onClick={actions.hint}
        className="lab-button max-[500px]:grid max-[500px]:h-10 max-[500px]:w-10 max-[500px]:place-items-center max-[500px]:px-0 max-[500px]:py-0"
      >
        <span aria-hidden="true" className="hidden text-base leading-none max-[500px]:block">💡</span>
        <span className="max-[500px]:sr-only">{t('hint')}</span>
      </button>
      <button
        type="button"
        aria-label={t('shuffle')}
        data-testid="shuffle-btn"
        disabled={disabled}
        onClick={actions.shuffle}
        className="lab-button max-[500px]:grid max-[500px]:h-10 max-[500px]:w-10 max-[500px]:place-items-center max-[500px]:px-0 max-[500px]:py-0"
      >
        <span aria-hidden="true" className="hidden text-lg leading-none max-[500px]:block">⇄</span>
        <span className="max-[500px]:sr-only">{t('shuffle')}</span>
      </button>
      <button
        type="button"
        aria-label={t('quickFinish')}
        data-testid="quick-finish-btn"
        disabled={disabled || isWon || !quickFinishAvailable}
        onClick={actions.quickFinish}
        className="lab-button border-cyan-200/40 text-cyan-50 hover:border-cyan-100/80 hover:bg-cyan-100/15 max-[500px]:grid max-[500px]:h-10 max-[500px]:w-10 max-[500px]:place-items-center max-[500px]:px-0 max-[500px]:py-0"
      >
        <span aria-hidden="true" className="hidden text-base leading-none max-[500px]:block">🚀</span>
        <span className="max-[500px]:sr-only">{t('quickFinish')}</span>
      </button>
      <div className="flex items-center gap-1 rounded-full border border-slate-200/10 bg-slate-100/5 p-1" aria-label={navigationT('language')}>
        {LOCALES.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setLocale(item)}
            className={`rounded-full px-2.5 py-1 text-xs font-black tracking-[0.16em] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 ${
              locale === item
                ? 'bg-cyan-100 text-slate-950 shadow-lg shadow-cyan-300/20'
                : 'text-slate-300 hover:bg-white/10 hover:text-cyan-100'
            }`}
            aria-pressed={locale === item}
          >
            {navigationT(item)}
          </button>
        ))}
      </div>
    </div>
  );
}
