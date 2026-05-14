'use client';

import Link from 'next/link';
import { useTranslations } from '@/app/providers';
import { useGameStore } from '@/lib/store';
import { useEffect, useState } from 'react';

export function WinDialog() {
  const t = useTranslations('game.winDialog');
  const state = useGameStore((store) => store.state);
  const newGame = useGameStore((store) => store.actions.newGame);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (state?.status !== 'won') {
      setDismissed(false);
    }
  }, [state?.status]);

  if (state === null || state.status !== 'won' || dismissed) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 px-4 backdrop-blur-md"
      data-testid="win-dialog"
      onClick={() => setDismissed(true)}
    >
      <section
        className="glass-card animate-dialog-in w-full max-w-md rounded-[2rem] p-6 text-center sm:p-8"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-lime-100/75">{t('eyebrow')}</p>
        <h2 className="mt-3 font-display text-4xl font-black text-slate-50">{t('title', { moves: state.movesCount })}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          {state.usedAids
            ? t('usedAids')
            : t('cleanRun')}
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" onClick={newGame} className="lab-button border-lime-200/40 text-lime-50 hover:border-lime-100/80 hover:bg-lime-100/15">
            {t('playAgain')}
          </button>
          <Link href="/leaderboard" className="lab-button">
            {t('viewLeaderboard')}
          </Link>
        </div>
      </section>
    </div>
  );
}
