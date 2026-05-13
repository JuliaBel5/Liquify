'use client';

import Link from 'next/link';
import { useTranslations } from '@/app/providers';
import { type Locale, useLocaleSwitcher } from '@/app/providers';

const LOCALES: Locale[] = ['ru', 'en'];

export function Header() {
  const t = useTranslations('navigation');
  const { locale, setLocale } = useLocaleSwitcher();

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
          <div className="ml-1 flex items-center gap-1 rounded-full border border-slate-200/10 bg-slate-100/5 p-1" aria-label={t('language')}>
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
                {t(item)}
              </button>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}
