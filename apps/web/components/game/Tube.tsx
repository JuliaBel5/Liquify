'use client';

import type { Color, Tube as TubeModel } from '@liquify/core';
import { COLOR_PALETTE } from '@/lib/colors';

interface TubeProps {
  index: number;
  tube: TubeModel;
  selected: boolean;
  hinted: boolean;
  disabled: boolean;
  onSelect(index: number): void;
}

function liquidClasses(color: Color): string {
  const liquid = COLOR_PALETTE[color] ?? COLOR_PALETTE[0];
  return `${liquid.bg} ${liquid.border} ${liquid.shadow}`;
}

export function Tube({ index, tube, selected, hinted, disabled, onSelect }: TubeProps) {
  return (
    <button
      type="button"
      aria-label={`Tube ${index + 1}`}
      data-testid="tube"
      data-index={index}
      data-selected={selected ? 'true' : 'false'}
      disabled={disabled}
      onClick={() => onSelect(index)}
      className={`group relative flex h-[10.5rem] w-12 items-end justify-center rounded-b-[2rem] rounded-t-md border-2 border-slate-200/45 bg-slate-950/30 p-1 shadow-tube transition-colors duration-200 hover:border-cyan-100/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 disabled:cursor-wait sm:h-[15.5rem] sm:w-16 sm:rounded-b-[2.35rem] ${selected ? 'border-cyan-100 ring-4 ring-cyan-200/35' : ''} ${hinted ? 'hint-highlight border-lime-100' : ''}`}
    >
      <span className="pointer-events-none absolute inset-1 rounded-b-[1.7rem] bg-gradient-to-b from-white/10 via-transparent to-white/5 sm:rounded-b-[2rem]" />
      <span className="relative flex w-full flex-col-reverse items-center gap-1 overflow-hidden rounded-b-[1.45rem] pb-1 sm:rounded-b-[1.8rem]">
        {tube.map((color, layerIndex) => (
          <span
            key={`${index}-${layerIndex}-${color}`}
            data-testid="liquid-layer"
            data-color={color}
            className={`h-[2.35rem] w-[2.35rem] rounded-md border border-white/25 shadow-inner transition-all duration-300 max-[500px]:h-9 max-[500px]:w-9 sm:h-[3.35rem] sm:w-[3.35rem] ${liquidClasses(color)}`}
          />
        ))}
      </span>
    </button>
  );
}
