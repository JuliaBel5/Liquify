"use client";

import { Board } from '@/components/game/Board';
import { Controls } from '@/components/game/Controls';
import { MoveCounter } from '@/components/game/MoveCounter';
import { NoMovesDialog } from '@/components/game/NoMovesDialog';
import { WinDialog } from '@/components/game/WinDialog';
import { useTranslations } from '@/app/providers';
import { useGameStore } from '@/lib/store';

export default function HomePage() {
  const t = useTranslations('game');
  const controlsT = useTranslations('game.controls');
  const state = useGameStore((store) => store.state);
  const isAnimating = useGameStore((store) => store.isAnimating);
  const newGame = useGameStore((store) => store.actions.newGame);

  return (
    <main className="mx-auto flex min-h-[calc(100vh-65px)] max-w-6xl flex-col px-3 py-5 sm:px-6 sm:py-8">
      <section className="glass-card relative overflow-hidden rounded-[2rem] px-3 py-3 sm:px-8 sm:py-5">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-lime-200/10 blur-3xl" />
        <div className="relative flex flex-col gap-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h1 className="font-display text-2xl font-black tracking-tight text-slate-50 sm:text-4xl">{t('title')}</h1>
            <div className="flex items-stretch gap-2 sm:gap-3">
              <button
                type="button"
                data-testid="new-game-btn"
                disabled={state === null || isAnimating}
                onClick={newGame}
                className="rounded-2xl border border-slate-200/10 bg-slate-950/35 px-4 py-3 text-xs font-bold uppercase leading-none tracking-[0.28em] text-slate-400 shadow-lg shadow-slate-950/20 transition hover:border-cyan-200/40 hover:text-cyan-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {controlsT('newGame')}
              </button>
              <MoveCounter />
            </div>
          </div>
          <Board />
          <Controls />
        </div>
      </section>
      <NoMovesDialog />
      <WinDialog />
    </main>
  );
}
