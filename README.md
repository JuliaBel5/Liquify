# Liquify

Игра-головоломка **Water Sort Puzzle** — сортируй цветную жидкость по колбам так, чтобы в каждой остался один цвет.

- **10 колб** в раскладке 5+5, **4 слоя** жидкости в каждой, **8 цветов** + 2 пустые колбы для старта.
- Правила: переливается весь верхний блок одного цвета подряд, в пустую колбу или поверх такого же цвета.
- Возможности: **Undo / Hint / Shuffle**, локальная таблица рекордов по минимуму ходов.
- Партии с использованием Undo или Hint (`usedAids = true`) **не попадают в leaderboard** — рекорд только за clean run.

## Стек

- **Monorepo**: pnpm workspaces
  - `packages/core` — pure TypeScript: правила игры, генератор уровней, DFS-solver, абстракция хранилища
  - `apps/web` — Next.js 15 App Router + React 19 + Tailwind CSS 3.4 + Zustand 5
- **Тесты**: Vitest (jsdom для repository), 39 тестов, coverage 94.93%
- **Mobile-ready**: `packages/core` переиспользуется 1:1 в будущем React Native приложении

## Quick start

```bash
pnpm install           # установить зависимости workspace
pnpm dev               # запустить Next.js на http://localhost:3100
pnpm -r test           # запустить все тесты
pnpm -r build          # production build обоих пакетов
pnpm -r typecheck      # проверка типов
```

## Структура

```
liquify/
├── packages/core/                      # @liquify/core — без UI зависимостей
│   ├── src/
│   │   ├── types.ts, constants.ts, utils.ts
│   │   ├── game.ts                     # canMove, applyMove, undoMove, isSolved
│   │   ├── generator.ts                # Fisher-Yates + DFS validator
│   │   ├── solver.ts                   # DFS + permutation-invariant hashing
│   │   └── storage/                    # RecordsRepository + LocalStorageRepository
│   └── tests/                          # 39 тестов
└── apps/web/                           # @liquify/web
    ├── app/
    │   ├── page.tsx                    # / — игровая страница
    │   └── leaderboard/page.tsx        # /leaderboard — таблица рекордов
    ├── components/game/                # Board, Tube, Controls, MoveCounter, WinDialog
    ├── components/leaderboard/         # RecordsTable
    └── lib/                            # Zustand store, colors palette, repository singleton
```

## Параметры игры

Изменяются в `packages/core/src/constants.ts`:

```ts
export const MVP_LEVEL_DEFAULTS = {
  TUBES_TOTAL: 10,
  TUBE_CAPACITY: 4,
  COLORS_COUNT: 8,
  EMPTY_TUBES: 2,
} as const;
```

## Деплой на Vercel

Файл `vercel.json` уже настроен под pnpm monorepo. Шаги:

### Вариант 1 — Vercel Dashboard

1. [vercel.com](https://vercel.com) → **Add New Project** → Import от GitHub.
2. Framework Preset — определится автоматически (Next.js).
3. Root Directory — оставить корень `/` (не `apps/web`). `vercel.json` сам соберёт `@liquify/web`.
4. Deploy.

Важно: root `package.json` содержит `next` в `devDependencies` специально для Vercel Framework Detection. Само приложение живёт в `apps/web`.

### Вариант 2 — Vercel CLI

```bash
npm i -g vercel
vercel               # follow prompts; preview deploy
vercel --prod        # production deploy
```

Preview deploys создаются автоматически на каждый PR / push в non-main ветку.

## Localhost troubleshooting

Liquify закреплён за портом **3100**, потому что 3000/3001 часто заняты другими локальными сервисами.
Если при открытии `localhost:3000` видишь чужую страницу — это не Liquify. Открывай:

```bash
pnpm dev
# затем http://localhost:3100
```

## Дорожная карта

- [x] MVP: web-версия с 1 уровнем, undo/hint/shuffle, локальный leaderboard
- [ ] Глобальная таблица рекордов (Supabase) — подменой `RecordsRepository` без правок UI
- [ ] React Native + Expo приложение — переиспользует `@liquify/core` 1:1
