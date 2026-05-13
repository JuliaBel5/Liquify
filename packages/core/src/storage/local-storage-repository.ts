import type { GameRecord, RecordsRepository } from './records-repository.js';

const STORAGE_KEY = 'liquify:records:v1';

function ensureStorage(): Storage {
  if (typeof window === 'undefined') {
    throw new Error('localStorage is not available outside a browser environment');
  }
  return window.localStorage;
}

export class LocalStorageRepository implements RecordsRepository {
  async list(limit = 10): Promise<GameRecord[]> {
    if (typeof window === 'undefined') return [];

    const all = this.listRaw();
    return [...all].sort((left, right) => left.moves - right.moves).slice(0, limit);
  }

  async save(input: Omit<GameRecord, 'id'>): Promise<GameRecord> {
    const storage = ensureStorage();
    const all = this.listRaw();
    const record: GameRecord = { ...input, id: globalThis.crypto.randomUUID() };

    all.push(record);
    storage.setItem(STORAGE_KEY, JSON.stringify(all));
    return record;
  }

  async clear(): Promise<void> {
    ensureStorage().removeItem(STORAGE_KEY);
  }

  private listRaw(): GameRecord[] {
    const raw = ensureStorage().getItem(STORAGE_KEY);
    return raw === null ? [] : (JSON.parse(raw) as GameRecord[]);
  }
}
