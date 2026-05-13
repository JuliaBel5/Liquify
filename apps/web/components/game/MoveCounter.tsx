'use client';

import { useTranslations } from '@/app/providers';
import { useGameStore } from '@/lib/store';

export function MoveCounter() {
  const t = useTranslations('game.moveCounter');
  const state = useGameStore((store) => store.state);
  const moves = state?.movesCount ?? 0;
  const usedAids = state?.usedAids ?? false;

  return (
    <div className="rounded-2xl border border-slate-200/10 bg-slate-950/35 px-4 py-3 text-right shadow-lg shadow-slate-950/20" data-aids-used={usedAids ? 'true' : 'false'}>
      <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400">{t('label')}</p>
      <p className="font-display text-3xl font-black leading-none text-cyan-100">{moves}</p>
      {usedAids ? <p className="mt-1 text-xs font-semibold text-lime-100/80">{t('noRecord')}</p> : null}
    </div>
  );
}
