# Wheel Spin

Многопользовательское колесо случайного выбора. Host создаёт комнату и
запускает колесо, гости подключаются по ссылке и анонимно предлагают новые
слоты.

## Возможности MVP

- Комнаты со случайным восьмизначным кодом и invite-ссылкой
- Необязательный пароль, который хранится только в виде Argon2id-хеша
- Анонимные сессии без регистрации
- Только host редактирует колесо и запускает вращение
- Гости отправляют полностью анонимные предложения
- Автоматические имена `Алекс`, `Алекс 2`, `Алекс 3`
- Одинаковое серверное вращение для всех подключённых участников
- Восстановление комнаты и текущего spin после обновления страницы
- До 20 локальных шаблонов слотов без аккаунта и нагрузки на backend
- Последние 10 результатов
- Удаление комнаты после 7 дней без активности
- Адаптивный mobile-first интерфейс на основе визуала исходного прототипа

## Ограничения

- До 50 участников в комнате
- До 100 слотов
- До 10 ожидающих предложений от одного гостя
- Вращение длится от 1 до 300 секунд
- Права host привязаны к защищённой cookie браузера, в котором создана комната

## Стек

- React, React Router, TypeScript и Vite
- NestJS, Fastify и Socket.IO
- PostgreSQL и Prisma
- Redis adapter для Socket.IO
- Vitest
- Docker и Railway

Frontend и backend собираются в один публичный контейнер. NestJS раздаёт
React SPA, REST API и WebSocket на одном домене. PostgreSQL и Redis остаются
доступны только через private network Railway.

## Архитектура

Frontend следует Feature-Sliced Design:

- `app` — инициализация приложения, router и глобальные стили
- `pages` — компоненты маршрутов `/`, `/r/:code` и fallback-страница
- `features` — пользовательские действия, не привязанные к одной странице
- `entities` — модель, API, realtime-state и UI комнаты
- `shared` — HTTP-клиент, i18n, router helpers и переиспользуемый UI

Backend организован как modular monolith NestJS. Бизнес-модуль `rooms`
разделён на `presentation`, `application`, `domain` и `infrastructure`.
Database, security, realtime и конфигурация находятся в `shared`.

## Локальный запуск

Требования: Node.js 22+, npm и локальные PostgreSQL/Redis. Если доступен Docker:

```bash
docker compose up -d
```

Создайте `.env` из `.env.example`, затем:

```bash
npm install
npm run db:generate
npm run db:migrate
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- Healthcheck: `http://localhost:3000/health`

Vite проксирует `/api` и `/socket.io` на backend.

## Production-сборка

```bash
npm run build
npm start
```

После сборки backend раздаёт frontend из `apps/web/dist`.

## Проверки качества

```bash
npm run format        # применить Prettier
npm run format:check  # проверить форматирование
npm run lint          # проверить ESLint
npm run typecheck     # проверить TypeScript
npm run validate      # все проверки и тесты
npm run verify        # validate + production-сборка
```

GitHub Actions запускает `validate` и `build` для каждого pull request и push
в `main`. Dockerfile также выполняет `validate`, поэтому Railway не соберёт
версию с ошибками ESLint, Prettier, TypeScript или тестов.

## Railway

1. Создайте Railway Project и подключите этот GitHub-репозиторий как service
   приложения.
2. Добавьте PostgreSQL и Redis в тот же project и environment.
3. Передайте приложению приватные переменные:
   - `DATABASE_URL` из PostgreSQL service
   - `REDIS_URL` из Redis service
   - `COOKIE_SECURE=true`
4. Создайте public domain только для приложения.

`railway.json` настраивает Dockerfile, миграцию Prisma перед запуском,
healthcheck и одну реплику в EU West. Для нескольких реплик Redis adapter уже
подключён, а запуск spin защищён атомарным изменением статуса комнаты в
PostgreSQL.

## Структура

```text
apps/
├── api/
│   ├── prisma/                         схема и миграции PostgreSQL
│   ├── src/
│   │   ├── app/                        корневой NestJS module
│   │   ├── modules/rooms/              вертикальный бизнес-модуль комнат
│   │   ├── modules/system/             SPA, health и readiness endpoints
│   │   └── shared/                     database, security, realtime, config
│   └── test/                           тесты правил комнат и колеса
└── web/
    └── src/
        ├── app/                        app bootstrap, router и стили
        ├── pages/                      страницы маршрутов
        ├── features/                   пользовательские функции
        ├── entities/                   модель и UI комнаты
        └── shared/                     общий API, i18n, helpers и UI

Dockerfile
docker-compose.yml
railway.json
```
