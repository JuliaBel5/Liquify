import { beforeEach, describe, expect, it } from 'vitest';
import { LocalStorageRepository } from '../src/storage/local-storage-repository.js';

const STORAGE_KEY = 'liquify:records:v1';

function repository(): LocalStorageRepository {
  return new LocalStorageRepository();
}

describe('LocalStorageRepository', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('save assigns an id and list returns the record', async () => {
    const saved = await repository().save({ moves: 12, completedAt: 1_000, durationMs: 500 });
    const records = await repository().list();

    expect(saved.id).toEqual(expect.any(String));
    expect(records).toEqual([saved]);
  });

  it('returns multiple records sorted by moves ascending', async () => {
    const repo = repository();
    const high = await repo.save({ moves: 30, completedAt: 3_000, durationMs: 300 });
    const low = await repo.save({ moves: 10, completedAt: 1_000, durationMs: 100 });
    const middle = await repo.save({ moves: 20, completedAt: 2_000, durationMs: 200 });

    expect(await repo.list()).toEqual([low, middle, high]);
  });

  it('list(limit) returns no more than the requested number of records', async () => {
    const repo = repository();
    await repo.save({ moves: 3, completedAt: 3, durationMs: 3 });
    await repo.save({ moves: 1, completedAt: 1, durationMs: 1 });
    await repo.save({ moves: 2, completedAt: 2, durationMs: 2 });

    expect(await repo.list(2)).toHaveLength(2);
    expect((await repo.list(2)).map((record) => record.moves)).toEqual([1, 2]);
  });

  it('clear removes all saved records', async () => {
    const repo = repository();
    await repo.save({ moves: 5, completedAt: 5, durationMs: 5 });

    await repo.clear();

    expect(await repo.list()).toEqual([]);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('uses the versioned liquify records storage key with JSON records', async () => {
    await repository().save({ moves: 7, completedAt: 70, durationMs: 700 });

    const raw = window.localStorage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();

    const parsed = JSON.parse(raw ?? '[]') as Array<{
      id: string;
      moves: number;
      completedAt: number;
      durationMs: number;
    }>;
    expect(parsed).toHaveLength(1);
    expect(parsed[0]).toMatchObject({ moves: 7, completedAt: 70, durationMs: 700 });
  });
});
