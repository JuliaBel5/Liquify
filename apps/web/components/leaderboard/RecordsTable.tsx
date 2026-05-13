'use client';

import type { GameRecord } from '@liquify/core';
import Link from 'next/link';
import { useTranslations } from '@/app/providers';
import { useEffect, useState } from 'react';
import { repository } from '@/lib/repository';

export function RecordsTable() {
  const t = useTranslations('leaderboard');
  const [records, setRecords] = useState<GameRecord[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadRecords(): Promise<void> {
    setLoading(true);
    const nextRecords = await repository.list(10);
    setRecords(nextRecords);
    setLoading(false);
  }

  useEffect(() => {
    void loadRecords();
  }, []);

  async function clearRecords(): Promise<void> {
    if (!window.confirm(t('confirmClear'))) return;
    await repository.clear();
    await loadRecords();
  }

  if (loading) {
    return <p className="rounded-2xl border border-slate-200/10 bg-slate-950/25 p-5 text-slate-300">{t('loading')}</p>;
  }

  if (records.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200/10 bg-slate-950/25 p-6 text-center">
        <p className="text-lg font-semibold text-slate-100">{t('empty')}</p>
        <Link href="/" className="lab-button mt-5 inline-flex">{t('play')}</Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/10 bg-slate-950/25">
      <table className="w-full text-left text-sm text-slate-200">
        <thead className="bg-slate-100/10 text-xs uppercase tracking-[0.25em] text-cyan-100/80">
          <tr>
            <th className="px-4 py-3">{t('columns.rank')}</th>
            <th className="px-4 py-3">{t('columns.moves')}</th>
            <th className="px-4 py-3">{t('columns.date')}</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record, index) => (
            <tr key={record.id} className="border-t border-slate-200/10">
              <td className="px-4 py-4 font-display text-xl font-black text-lime-100">{index + 1}</td>
              <td className="px-4 py-4 font-bold text-slate-50">{record.moves}</td>
              <td className="px-4 py-4 text-slate-300">{new Date(record.completedAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-end border-t border-slate-200/10 p-4">
        <button type="button" onClick={() => void clearRecords()} className="lab-button">
          {t('clear')}
        </button>
      </div>
    </div>
  );
}
