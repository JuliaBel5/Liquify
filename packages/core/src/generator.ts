import { MVP_LEVEL_DEFAULTS } from './constants.js';
import { createInitialState, isTrivial } from './game.js';
import { solveDFS } from './solver.js';
import type { Color, GameState, LevelConfig, Tube } from './types.js';

const MAX_ATTEMPTS = 50;

function createRandom(seed: number | undefined): () => number {
  if (seed === undefined) return Math.random;

  let value = seed >>> 0;
  return () => {
    value = (value * 1_664_525 + 1_013_904_223) >>> 0;
    return value / 0x1_0000_0000;
  };
}

function normalizeConfig(config: Partial<LevelConfig> = {}): LevelConfig {
  return {
    tubes: config.tubes ?? MVP_LEVEL_DEFAULTS.TUBES_TOTAL,
    capacity: config.capacity ?? MVP_LEVEL_DEFAULTS.TUBE_CAPACITY,
    colors: config.colors ?? MVP_LEVEL_DEFAULTS.COLORS_COUNT,
    empty: config.empty ?? MVP_LEVEL_DEFAULTS.EMPTY_TUBES,
    seed: config.seed,
  };
}

function assertValidConfig(config: LevelConfig): void {
  if (config.tubes !== config.colors + config.empty) {
    throw new Error('Invalid level config: colors + empty must equal tubes');
  }
  if (config.tubes <= 0 || config.capacity <= 0 || config.colors <= 0 || config.empty < 0) {
    throw new Error('Invalid level config: values must be positive');
  }
  if (config.capacity !== MVP_LEVEL_DEFAULTS.TUBE_CAPACITY) {
    throw new Error('Invalid level config: MVP capacity must be 4');
  }
}

function shuffleBalls(balls: Color[], random: () => number): void {
  for (let index = balls.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    const current = balls[index];
    const other = balls[swapIndex];
    if (current === undefined || other === undefined) {
      throw new Error('Invalid shuffle indexes');
    }
    balls[index] = other;
    balls[swapIndex] = current;
  }
}

function buildCandidate(config: LevelConfig, random: () => number): Tube[] {
  const balls: Color[] = [];
  for (let color = 0; color < config.colors; color += 1) {
    for (let slot = 0; slot < config.capacity; slot += 1) {
      balls.push(color);
    }
  }

  shuffleBalls(balls, random);

  const tubes: Tube[] = [];
  for (let index = 0; index < config.colors; index += 1) {
    tubes.push(balls.slice(index * config.capacity, (index + 1) * config.capacity));
  }
  for (let index = 0; index < config.empty; index += 1) {
    tubes.push([]);
  }
  return tubes;
}

export function generateSolvableLevel(config?: Partial<LevelConfig>): Tube[] {
  const levelConfig = normalizeConfig(config);
  assertValidConfig(levelConfig);

  const random = createRandom(levelConfig.seed);
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const tubes = buildCandidate(levelConfig, random);
    if (isTrivial(tubes)) continue;

    const solution = solveDFS(createInitialState(tubes), 20_000);
    if (solution !== null) return tubes;
  }

  throw new Error('Failed to generate solvable level after 50 attempts');
}

export function shuffle(state: GameState): GameState {
  const colors = new Set<Color>();
  for (const tube of state.tubes) {
    for (const color of tube) colors.add(color);
  }

  const tubes = generateSolvableLevel({
    tubes: state.tubes.length,
    capacity: MVP_LEVEL_DEFAULTS.TUBE_CAPACITY,
    colors: colors.size,
    empty: state.tubes.length - colors.size,
  });

  return createInitialState(tubes);
}
