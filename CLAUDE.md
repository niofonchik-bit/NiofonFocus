# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## О проекте

Niofocus — SPA для фокус-таймера (Pomodoro) и трекинга привычек с дашбордом
статистики. Интерфейс на русском языке. Бэкенд — Supabase (auth + Postgres).

## Стек

- **React 19** + **TypeScript** (строгий режим, bundler resolution)
- **Vite 8** (rolldown) — сборка и dev-сервер
- **MUI 9** + **Emotion** — UI-компоненты (в основном поля ввода/диалоги)
- **react-router-dom 7** — маршрутизация (data router)
- **@supabase/supabase-js 2** — auth и доступ к данным
- **Node >= 22.12.0** (см. `.nvmrc`)
- Деплой: **Netlify** (SPA-redirect на `/index.html`)

## Команды

```bash
npm run dev        # dev-сервер на http://127.0.0.1:5174
npm run build      # продакшн-сборка в dist/
npm run preview    # локальный просмотр собранного билда
npm run typecheck  # tsc -p tsconfig.app.json --noEmit
npm run lint       # eslint . --ext .ts,.tsx (см. примечание ниже)
```

- Тестов в проекте нет — тест-раннер не настроен.
- ⚠️ Скрипт `lint` объявлен, но конфиг ESLint и сам пакет `eslint` в репозитории
  отсутствуют, поэтому команда сейчас не выполняется. Перед опорой на линтинг
  его нужно сначала настроить. Основная проверка качества — `npm run typecheck`.

## Переменные окружения

`vite.config.ts` задаёт `envDir: '../niofocus-env'` — переменные читаются из
**соседней папки рядом с репозиторием**, не из его корня. Нужны:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Архитектура

### Дерево провайдеров (`src/main.tsx`)

Порядок вложенности важен:
`AnimatedThemeProvider` → `AuthProvider` → `SettingsProvider` →
`MUIThemeProvider` → `RouterProvider`.

- **AuthProvider** — сессия Supabase, флаг `ready`; `useAuth()`.
- **SettingsProvider** — настройки пользователя из БД (тема, акцент);
  применяет оптимистичные обновления с откатом при ошибке; `useSettings()`.
- **AnimatedThemeProvider** — переключение light/dark через View Transitions
  API с ripple-анимацией от точки клика; уважает `prefers-reduced-motion`.
- **MUIThemeProvider** — мост между CSS-переменными и темой MUI.

`ProfileProvider` и `HabitsProvider` подключаются ниже, внутри защищённого
маршрута (`src/route.tsx`), т.к. требуют авторизации.

### Маршрутизация (`src/route.tsx`)

- `PublicOnlyRoute` (`/auth`) и `ProtectedRoute` (всё остальное) — гейтинг по
  сессии с учётом флага `ready`.
- Защищённые страницы рендерятся внутри `MainPage` (layout с `<Outlet>`):
  index → Dashboard, `/habits`, `/timer`, `/settings`.
- Страницы загружаются через `lazy()`; у маршрутов есть `handle.pageTransition`
  с уровнями для анимаций переходов (`animatedOutlet`).

### Слой данных (`src/api/*`)

Каждый модуль (`habits`, `sessions`, `profile`, `settings`, `auth`) оборачивает
вызовы Supabase и возвращает доменные типы приложения. Маппинг между
`snake_case` колонками БД и `camelCase` доменными моделями выполняется
функциями `toHabit`/`scheduleToColumns` и т.п. UI работает только с доменными
типами, а не с сырыми строками БД.

Типы БД сгенерированы в `src/types/database.types.ts` (helpers `Tables<'…'>`,
`TablesUpdate<'…'>`). Таблицы: `habits`, `habit_completions`, `focus_sessions`,
`profiles`, `user_settings`.

Единственный клиент Supabase — `src/lib/supabase.ts`.

### Структура каталогов

- `src/pages/<page>/` — страница + локальные `components/`, `dialogs/`,
  `hooks/`, `constants/` рядом с ней (фича-ориентированно).
- `src/components/` — переиспользуемые компоненты.
- `src/providers/`, `src/hooks/`, `src/utils/`, `src/constants/`,
  `src/effects/` (celebration-анимации, звук).
- Путевые алиасы (см. `tsconfig.app.json` / `vite.config.ts`): `@api`,
  `@providers`, `@components`, `@pages`, `@app_types`, `@constants`, `@utils`,
  `@effects`, `@root` (= `src`), `@project` (= корень).

## Соглашения по коду

- Отступ — **4 пробела**; одинарные кавычки в TS/TSX.
- **Комментарии и пользовательские строки — на русском.** Документирующие
  комментарии в стиле `/** … */` над функциями/типами/провайдерами.
- Каждый провайдер/контекст экспортирует хук `useXxx()`, который бросает ошибку
  при использовании вне своего провайдера.
- Имя файла компонента совпадает с именем папки (`habitPage/habitPage.tsx`),
  стили — соседний `.css` с тем же именем.
- `verbatimModuleSyntax` включён — импорты типов через `import type`.
- `noUnusedLocals`/`noUnusedParameters` включены — не оставляй неиспользуемое.

## Правила сохранения дизайна

Дизайн-система держится на CSS-переменных — придерживайся её, не вводи
параллельные стили:

- **Все цвета/тени бери из CSS-переменных** `index.css`
  (`--background-primary`, `--surface-*`, `--text-*`, `--border-primary`,
  `--accent-primary`, `--accent-contrast`, `--shadow-*`). Не хардкодь
  hex-значения в компонентах.
- Поддерживай **обе темы** (`:root[data-theme='light'|'dark']`) и систему
  акцентов из `src/constants/accentColor.ts`. Акцент задаётся через
  `--accent-primary` / `data-accent` на `<html>`.
- Стили — **через отдельные `.css`-файлы рядом с компонентом**, классы в
  `snake_case` с префиксом по компоненту (`.timer_page_content`). MUI
  использовать точечно (поля ввода, диалоги), а не как основу вёрстки.
- В `index.html` есть inline-скрипт против FOUC, применяющий тему/акцент из
  `localStorage` до запуска React. При изменении ключей хранения темы/акцента
  или дефолтов синхронизируй этот скрипт.
- Анимации должны уважать `prefers-reduced-motion` (см. `AnimatedThemeProvider`,
  `useReducedMotion`).
- Числовые/моноширинные значения используют шрифт `var(--font-num)`.

## Деплой

Netlify: `npm run build` → публикация `dist/`, `NODE_VERSION=22.12.0`,
SPA-fallback `/* → /index.html` (`netlify.toml`, `public/_redirects`).
