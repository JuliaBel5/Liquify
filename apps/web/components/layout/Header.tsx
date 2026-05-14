'use client';

import Link from 'next/link';
import { useTranslations } from '@/app/providers';

export function Header() {
  const t = useTranslations('navigation');

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/10 bg-slate-950/72 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="font-display text-2xl font-black tracking-tight text-slate-50">
          {t('brand')}
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-2 text-sm font-semibold text-slate-300">
          <Link className="rounded-full px-3 py-2 transition hover:bg-white/10 hover:text-cyan-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200" href="/">
            {t('play')}
          </Link>
          <Link className="rounded-full px-3 py-2 transition hover:bg-white/10 hover:text-cyan-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200" href="/leaderboard">
            {t('leaderboard')}
          </Link>
        </div>
      </nav>
    </header>
  );
}
