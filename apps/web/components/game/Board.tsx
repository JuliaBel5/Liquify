'use client';

import { useEffect } from 'react';
import { MVP_LEVEL_DEFAULTS } from '@liquify/core';
import { Tube } from './Tube';
import { useGameStore } from '@/lib/store';

const GRID_CLASS = 'grid grid-cols-5 justify-items-center gap-x-2 gap-y-8 rounded-[1.5rem] border border-slate-200/10 bg-slate-950/20 p-2 sm:gap-x-5 sm:gap-y-12 sm:p-6';

export function Board() {
  const state = useGameStore((store) => store.state);
  const selectedTubeIndex = useGameStore((store) => store.selectedTubeIndex);
  const hintHighlight = useGameStore((store) => store.hintHighlight);
  const isAnimating = useGameStore((store) => store.isAnimating);
  const init = useGameStore((store) => store.actions.init);
  const selectTube = useGameStore((store) => store.actions.selectTube);

  useEffect(() => {
    init();
  }, [init]);

  if (state === null) {
    return (
      <div className={GRID_CLASS} data-aids-used="false">
        {Array.from({ length: MVP_LEVEL_DEFAULTS.TUBES_TOTAL }, (_, index) => (
          <div key={index} className="h-44 w-12 animate-pulse rounded-b-2xl border-2 border-slate-200/20 bg-slate-100/5 sm:h-64 sm:w-16" />
        ))}
      </div>
    );
  }

  return (
    <div
      className={GRID_CLASS}
      data-aids-used={state.usedAids ? 'true' : 'false'}
    >
      {state.tubes.map((tube, index) => {
        const hinted = hintHighlight !== null && (hintHighlight.from === index || hintHighlight.to === index);
        return (
          <Tube
            key={index}
            index={index}
            tube={tube}
            selected={selectedTubeIndex === index}
            hinted={hinted}
            disabled={isAnimating}
            onSelect={selectTube}
          />
        );
      })}
    </div>
  );
}
