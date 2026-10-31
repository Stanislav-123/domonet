# Domonet - Платформа Арбитража Трафика

CPA-платформа для арбитража крипто-трафика с интерактивными лендингами и системой лидогенерации.

## 🎯 Что это

Полноценная система для CPA/арбитража:
- **10+ готовых лендингов** (биржевые симуляторы, квизы, AI-агенты, аирдропы)
- **Трекинг кликов** с full детализацией (GEO, device, UA, sub1-5)
- **Система лидов** с дедупликацией, статусами, экспортом
- **Интеграции** - автоотправка лидов в CRM через PHP-скрипты
- **Кампании** - распределение трафика по лендам с весами
- **Админ-панель** + Кабинет вебмастера
- **Мультиязычность** (RU/EN/ES/AR и др.)

## 🛠 Технологии

- **Next.js 16.3** (App Router, React 19, RSC)
- **PostgreSQL** + Prisma ORM
- **TypeScript**
- **Tailwind CSS 4**
- **JWT авторизация** (jose)
- **Real-time цены** крипты (из маркетдаты)
- **Docker** для БД

## 🚀 Быстрый старт

### 1. Установка

```bash
git clone <repo>
cd domonet
npm install
```

### 2. База данных

```bash
# Запускаем PostgreSQL в Docker
npm run db:up

# Копируем конфиг
cp .env.example .env

# В .env указываем:
DATABASE_URL="postgresql://domonet:domonet@localhost:5432/domonet"
AUTH_SECRET="сгенерируй-рандомную-строку-32+-символа"

# Накатываем схему и seed
npm run db:setup
```

### 3. Запуск

```bash
npm run dev
# Открываем http://localhost:3000
```

**Демо-аккаунт** (из seed):
- Логин: `admin` (или из `ADMIN_LOGIN`)
- Пароль: `changeme123` (или из `ADMIN_PASSWORD`)

### 4. Первый фаннел

После seed'а создается демо-кампания с реферальным кодом.  
Проверяем: `/r/{code}` → редирект на лендинг → форма → лид в админке.

## 📁 Структура

```
src/
├── app/
│   ├── admin/          # Админ-панель (кампании, лиды, интеграции)
│   ├── cabinet/        # Кабинет вебмастера (статистика, ссылки)
│   ├── api/            # API endpoints
│   ├── l/[slug]/       # Страницы лендингов
│   ├── r/[code]/       # Редиректор трекинговых ссылок
│   └── t.js/           # Tracking script
├── components/
│   ├── lands/          # Компоненты лендингов
│   ├── tracker/        # Exit-попапы, back-button, геопинг
│   └── leads/          # Формы лидов
├── lib/
│   ├── tracker.ts      # Движок трекинга кликов
│   ├── integrations.ts # Отправка лидов в партнерки
│   ├── leads.ts        # Создание лидов, валидация
│   ├── geo.ts          # Определение GEO (ipwho, ip-api)
│   ├── ua.ts           # Парсинг UA, детект ботов
│   └── auth.ts         # JWT сессии
└── prisma/
    ├── schema.prisma   # Модели данных
    └── seed.ts         # Тестовые данные
```

## 🎨 Лендинги

Типы (enum `LanderType`):
- `price_guess` - Угадать направление цены
- `price_candles` - То же + свечи
- `ai_agents` - Платформа AI-агентов для трейдинга
- `profit_calc` - Калькулятор потенциала
- `quiz` - Квиз инвестора
- `live_signals` - Live-сигналы с биржи
- `copy_desk` - Копирование сделок
- `airdrop` - Аллокация токенов
- `vault` - Волт доходности
- `briefing` - Утренний брифинг

Каждый ленд:
- Интерактивный (React, real-time)
- Локализован (i18n)
- Адаптивен (mobile-first)
- Имеет встроенную форму

## 🔗 Трекинг

### Создание ссылки

1. Админ создает `TrackingLink` с кодом (например `abc123`)
2. Привязывает к кампании + можно зафиксировать ленд
3. Ссылка: `https://domain.com/r/abc123?sub1=source&sub2=...`

### Как работает

```
/r/{code} → resolveTracking() → создает Click с:
  - clickId (уникальный ID)
  - IP, country (ipwho.is / ip-api.com)
  - User-Agent → device/os/browser
  - referer, source, sub1-5
  - isBot (детект)
  - isUnique (24ч дедупликация по IP+UA)
  
→ Редирект на /l/{lander}?cid={clickId}
→ Запись event: land_view, form_start, form_submit, exit_shown...
```

### Фичи трекинга

- **Дедупликация кликов** (24ч по IP+UA)
- **Бот-детект** (curl, scrapers, headless browsers)
- **GEO-определение** (fallback на 3 сервиса)
- **Daily caps** на лендах
- **Weighted rotation** лендов в кампании
- **Back-button трекинг** + exit popups
- **Sub1-5** для передачи параметров

## 👤 Лиды

### Создание

Форма на ленде → `POST /api/leads` → `createLead()`:
- Валидация: имя/email/телефон (zod + regex)
- Дедупликация: 24ч по email ИЛИ phone → статус `duplicate`
- Привязка к click → берем GEO, device, campaign, affiliate
- Daily cap проверка
- Запись event `form_submit`
- **Автоотправка в интеграцию**

### Интеграции

PHP-скрипты для отправки в партнерки:
```javascript
// lib/integrations.ts
// POST {integration_url}/{id}.php с payload:
{
  firstName, lastName, email, phone,
  clickId, ip, userAgent, country,
  sub1, sub2, sub3, sub4, sub5
}
```

**Weighted rotation**: если у кампании несколько интеграций, выбирается по весам.

**Настройка**:
- В админке: Integrations → создаем → вставляем PHP-код
- Код сохраняется в `PHP_INTEGRATION_DIR`
- При создании лида автоматом вызывается URL

**Env переменные**:
```env
PHP_INTEGRATION_DIR="/var/www/integrations"
PHP_INTEGRATION_URL="http://localhost/integrations"
```

## 📊 Статистика

Админ-панель:
- **Dashboard**: общая статистика по кликам/лидам
- **Campaigns**: детализация по кампаниям, клики/лиды, экспорт CSV
- **Leads**: фильтры (статус, ленд, GEO), поиск, экспорт
- **Landers**: статистика по лендам

Кабинет вебмастера:
- Свои кампании + трекинговые ссылки
- Клики/лиды за период

## 🔐 Безопасность

✅ **Реализовано**:
- JWT сессии (httpOnly cookies, 14 дней)
- Bcrypt для паролей (12 rounds)
- CORS (настроен на `*` для лендов - можно ограничить)
- Валидация всех инпутов (zod + regex)
- SQL injection защита (Prisma)
- XSS защита (React escape + CSP в Next.js)

⚠️ **TODO** (см. ниже):
- Rate limiting на API
- CSRF токены
- Admin audit log
- Шифрование чувствительных данных в БД

## 🐛 Исправленные баги

В этом PR:

1. **DB provider mismatch** ❌  
   `schema.prisma` был `mysql`, а `docker-compose.yml` - postgres  
   → Исправлено на `postgresql`

2. **Hardcoded paths** ❌  
   `lib/integrations.ts` содержал `C:\xampp\htdocs\integrations`  
   → Перенесено в env: `PHP_INTEGRATION_DIR`, `PHP_INTEGRATION_URL`

3. **Hardcoded credentials** ❌  
   `seed.ts` содержал логин/пароль в коде  
   → Перенесено в env: `ADMIN_LOGIN`, `ADMIN_PASSWORD`, `ADMIN_NAME`

4. **React lint errors** ❌  
   - `I18nProvider.tsx`: setState в useEffect → переделан на useState initializer
   - `PriceCallLand.tsx`: обновление ref во время рендера → вынесено в useEffect
   - `PriceCallLand.tsx`: синхронный setState в effect → исправлена логика счетчика

5. **Missing .env.example** ❌  
   Не было шаблона конфига → создан `.env.example`

## 🚧 Рекомендации по улучшению

### 🔴 Критичные (безопасность)

1. **Rate limiting**
   - Добавить throttling на `/api/leads`, `/api/auth/login`
   - Использовать: `upstash/ratelimit` или middleware с Redis
   - Пример: 10 лидов/IP за 5 минут

2. **CSRF protection**
   - Next.js не имеет встроенной защиты для mutation API
   - Добавить: `@edge-csrf/nextjs` или custom token

3. **Environment validation**
   - Валидировать `process.env` при старте (zod)
   - Фейлить если нет `AUTH_SECRET` или `DATABASE_URL`

4. **Логирование**
   - Добавить audit log для админ-действий
   - Winston/Pino для структурированных логов
   - Отслеживать: изменения интеграций, удаление лидов

### 🟡 Важные (production-ready)

5. **Мониторинг**
   - Sentry для ошибок
   - Prometheus + Grafana для метрик (клики/сек, лиды/сек)
   - Health-check endpoint: `/api/health`

6. **Тесты**
   ```bash
   # Приоритеты:
   - Трекинг: resolveTracking(), createLead()
   - Интеграции: sendLeadToIntegration()
   - Валидация: leadSchema, phone/email
   - API routes: auth, leads
   
   # Стек: Vitest + Testing Library
   ```

7. **Кеширование**
   - Landers list → Redis cache (TTL 5 мин)
   - GEO lookups уже кешируются в памяти → вынести в Redis
   - Country codes → static JSON

8. **Оптимизация БД**
   - Добавить индексы (уже есть базовые, проверить EXPLAIN ANALYZE)
   - Партиционирование Click/Lead по createdAt (по месяцам)
   - Архивация старых кликов (>90 дней)

9. **Background jobs**
   - Отправка в интеграции → async queue (BullMQ / Trigger.dev)
   - Retry на фейлах с exponential backoff
   - Dead letter queue для безвозвратных ошибок

10. **Webhook postbacks**
    - Эндпоинт для получения статусов лидов от партнерок
    - `POST /api/postback?secret=xxx` → обновить Lead.status
    - Signature validation (HMAC)

### 🟢 Улучшения (nice to have)

11. **Real-time dashboard**
    - WebSocket/SSE для live-обновления статистики
    - Chart.js/Recharts графики (уже есть recharts)

12. **A/B тестирование**
    - Вариации лендов (заголовки, кнопки)
    - Split-test в рамках кампании

13. **Smart rotation**
    - ML-модель для выбора лучшего ленда по GEO/device
    - Reinforcement learning (multi-armed bandit)

14. **Прелендинги**
    - Встроенная система прелендов (сейчас Campaign.prelandUrl)
    - Конструктор простых статик-прелендов

15. **Нотификации**
    - Telegram bot для уведомлений (новый лид, ошибка интеграции)
    - Email-дайджест для вебмастеров

16. **Fraud detection**
    - Улучшить бот-детект (fingerprinting, TrustedForm)
    - Детект VPN/прокси (ipinfo.io, maxmind)
    - Scoring кликов/лидов

17. **Документация API**
    - OpenAPI/Swagger спека
    - Postman collection

18. **Docker production setup**
    - Multi-stage Dockerfile для Next.js
    - docker-compose с nginx, Redis, PostgreSQL
    - Health checks, auto-restart

## 📦 Деплой

### Vercel (самый простой)

```bash
vercel
# Добавить env variables в dashboard
# PostgreSQL → Vercel Postgres / Supabase / Railway
```

### VPS (Ubuntu)

```bash
# PM2 + Nginx
npm run build
pm2 start "npm start" --name domonet
# Nginx reverse proxy на :3000
# Certbot для SSL
```

### Docker

```bash
# TODO: создать production Dockerfile
docker build -t domonet .
docker run -p 3000:3000 --env-file .env domonet
```

## 📝 Заметки для разработчика

### Добавить новый ленд

1. Добавить тип в `prisma/schema.prisma` → `enum LanderType`
2. Создать компонент `src/components/lands/MyLand.tsx`
3. Добавить в `LanderSwitch.tsx`
4. Добавить в seed: `prisma/seed.ts` → массив LANDERS
5. Миграция: `npx prisma migrate dev`

### Изменить схему БД

```bash
# Править schema.prisma
npx prisma migrate dev --name my_change
npx prisma generate
```

### Добавить язык

1. Добавить в `lib/i18n.ts` → `TRANSLATIONS`
2. Добавить в `detectLocale()` fallback
3. Добавить правило телефона в `lib/phone.ts` (опционально)

## 🤝 Вклад владельца (контекст)

Судя по стеку и задачам:
- **PHP/JS background** - система интеграций через PHP
- **Keitaro/Binom** - знаком со стандартами арбитража (sub1-5, postbacks)
- **Telegram bots** - можно добавить уведомления

**Возможная роль**: арбитраж крипто-офферов, возможно связка с собственной партнеркой.

## 🎯 Приоритеты productization

**Для портфолио**:
1. ✅ Фикс багов (done в этом PR)
2. ⏳ Тесты (хотя бы основных флоу)
3. ⏳ Swagger API docs
4. ⏳ Docker Compose для production

**Для production**:
1. ⏳ Rate limiting + CSRF
2. ⏳ Мониторинг (Sentry)
3. ⏳ Background jobs для интеграций
4. ⏳ Webhook postbacks
5. ⏳ Fraud detection

**Для монетизации**:
- SaaS для арбитражников (multi-tenancy)
- Маркетплейс лендингов (продавать кастомные)
- White-label решение

---

**Статус после фиксов**: Production-ready для MVP, требуется доработка по списку выше для full production.

**Лицензия**: Не указана (добавить MIT/proprietary).
