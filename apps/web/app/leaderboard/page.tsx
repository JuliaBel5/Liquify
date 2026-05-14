"use client";

import Link from 'next/link';
import { useTranslations } from '@/app/providers';
import { RecordsTable } from '@/components/leaderboard/RecordsTable';

export default function LeaderboardPage() {
  const t = useTranslations('leaderboard');

  return (
    <main className="mx-auto flex min-h-[calc(100vh-65px)] max-w-4xl flex-col px-4 py-6 sm:px-6 sm:py-10">
      <section className="glass-card overflow-hidden rounded-[2rem] p-5 sm:p-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-black tracking-tight text-slate-50 sm:text-5xl">{t('title')}</h1>
          </div>
          <Link href="/" className="lab-button">{t('play')}</Link>
        </div>
        <RecordsTable />
      </section>
    </main>
  );
}
