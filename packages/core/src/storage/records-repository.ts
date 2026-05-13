export interface GameRecord {
  id: string;
  moves: number;
  completedAt: number;
  durationMs: number;
}

export interface RecordsRepository {
  list(limit?: number): Promise<GameRecord[]>;
  save(record: Omit<GameRecord, 'id'>): Promise<GameRecord>;
  clear(): Promise<void>;
}
