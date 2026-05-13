'use client';

import { useTranslations } from '@/app/providers';
import { useGameStore } from '@/lib/store';

export function NoMovesDialog() {
  const t = useTranslations('game.noMovesDialog');
  const open = useGameStore((store) => store.noMovesDialogOpen);
  const shuffle = useGameStore((store) => store.actions.shuffle);
  const dismiss = useGameStore((store) => store.actions.dismissNoMovesDialog);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/75 px-4 backdrop-blur-md" data-testid="no-moves-dialog">
      <section className="glass-card animate-dialog-in w-full max-w-md rounded-[2rem] p-6 text-center sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-amber-100/75">{t('eyebrow')}</p>
        <h2 className="mt-3 font-display text-4xl font-black text-slate-50">{t('title')}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          {t('description')}
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" onClick={shuffle} className="lab-button border-lime-200/40 text-lime-50 hover:border-lime-100/80 hover:bg-lime-100/15">
            {t('shuffle')}
          </button>
          <button type="button" onClick={dismiss} className="lab-button">
            {t('stay')}
          </button>
        </div>
      </section>
    </div>
  );
}
