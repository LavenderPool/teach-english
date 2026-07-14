# English Learner

Персональное приложение для изучения английского языка (macOS / Web).

## Стек

- **Frontend**: React + TypeScript + Tailwind CSS + Radix/shadcn-style UI
- **Desktop**: Tauri 2
- **State**: Zustand + localStorage (схема как у SQLite из ТЗ)
- **AI**: DeepSeek API (`deepseek-chat`, OpenAI-compatible)
- **TTS**: Web Speech API
- **Charts**: Recharts

## Разделы

1. **Обзор** — due-карточки, прогресс по временам, streak
2. **Транскрипция** — IPA-теория + практика (инпут / карточки)
3. **Времена** — 12 времён (статика) + чат с ИИ + практика
4. **Слова** — SRS (SM-2 + mastery), импорт словаря, аркада
5. **Генерация** — перевод RU↔EN с % сходимости и графиком
6. **Настройки** — тема, DeepSeek API key, TTS, экспорт/импорт

## Запуск (web)

```bash
npm install
npm run dev
```

Откройте http://localhost:5173

## Запуск (Tauri / macOS)

```bash
npm install
npm run tauri:dev
```

Сборка:

```bash
npm run tauri:build
```

## API-ключ DeepSeek

1. Получите ключ на [platform.deepseek.com](https://platform.deepseek.com)
2. **Настройки → DeepSeek API Key → Сохранить / Проверить ключ**
3. Ключ хранится отдельно от экспорта БД (не попадает в JSON backup)

Без ключа ИИ-функции недоступны (баннер в разделах).

## Горячие клавиши

- `⌘K` / `Ctrl+K` — быстрый поиск (разделы, времена, слова)

## MVP-статус

Реализованы этапы 1–8 из ТЗ в web/Tauri-обёртке: навигация, теория времён, SRS, аркада, транскрипция, генерация переводов, дашборд, экспорт/импорт.
