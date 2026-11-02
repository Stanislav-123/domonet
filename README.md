# Domonet - Платформа Арбитража Трафика

CPA-платформа для арбитража крипто-трафика с интерактивными лендингами и системой лидогенерации.

## Описание

Система для CPA/арбитража с полным функционалом:
- 10+ готовых интерактивных лендингов (биржевые симуляторы, квизы, AI-агенты)
- Трекинг кликов с детализацией (GEO, device, UA, sub1-5)
- Система лидов с дедупликацией и статусами
- Интеграции для автоотправки лидов в CRM
- Кампании с распределением трафика
- Админ-панель и кабинет вебмастера
- Мультиязычность (RU/EN/ES/AR и др.)

## Технологии

- Next.js 16.3 (App Router, React 19)
- PostgreSQL + Prisma ORM
- TypeScript
- JWT авторизация
- Tailwind CSS 4

## Требования

- Node.js 20+
- Docker и Docker Compose (для базы данных)
- npm или yarn

## Установка

### 1. Клонирование и зависимости

```bash
git clone <repository-url>
cd domonet
npm install
```

### 2. Настройка базы данных

Запустите PostgreSQL в Docker:

```bash
npm run db:up
```

Скопируйте файл конфигурации:

```bash
cp .env.example .env
```

Отредактируйте `.env` и установите:

```env
DATABASE_URL="postgresql://domonet:domonet@localhost:5432/domonet"
AUTH_SECRET="ваш-случайный-секрет-минимум-32-символа"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Необязательные параметры для интеграций
PHP_INTEGRATION_DIR="/var/www/integrations"
PHP_INTEGRATION_URL="http://localhost/integrations"

# Данные для демо-аккаунта
ADMIN_LOGIN="admin"
ADMIN_PASSWORD="changeme123"
ADMIN_NAME="Администратор"
```

Примените схему БД и загрузите тестовые данные:

```bash
npm run db:setup
```

### 3. Запуск

Запустите сервер разработки:

```bash
npm run dev
```

Откройте http://localhost:3000 в браузере.

## Вход в систему

После запуска `npm run db:setup` создается демо-аккаунт:

- **Логин:** `admin` (или значение из `ADMIN_LOGIN`)
- **Пароль:** `changeme123` (или значение из `ADMIN_PASSWORD`)

Войдите через http://localhost:3000/admin

## Конфигурация

### Переменные окружения

| Переменная | Описание | Пример |
|------------|----------|--------|
| `DATABASE_URL` | URL подключения к PostgreSQL | `postgresql://user:pass@localhost:5432/db` |
| `AUTH_SECRET` | Секретный ключ для JWT (мин. 32 символа) | `random-secret-key-here` |
| `NEXT_PUBLIC_APP_URL` | Публичный URL приложения | `http://localhost:3000` |
| `PHP_INTEGRATION_DIR` | Директория для PHP-скриптов интеграций | `/var/www/integrations` |
| `PHP_INTEGRATION_URL` | URL для PHP-скриптов интеграций | `http://localhost/integrations` |
| `ADMIN_LOGIN` | Логин администратора (для seed) | `admin` |
| `ADMIN_PASSWORD` | Пароль администратора (для seed) | `changeme123` |
| `ADMIN_NAME` | Имя администратора | `Администратор` |

## Использование

### Создание первой кампании

1. Войдите в админ-панель: http://localhost:3000/admin
2. Перейдите в раздел "Кампании"
3. Создайте новую кампанию, выберите лендинги
4. В разделе "Трекинговые ссылки" создайте ссылку с кодом (например, `demo123`)
5. Используйте ссылку: `http://localhost:3000/r/demo123`

### Примеры запросов

**Переход по трекинговой ссылке:**
```bash
curl http://localhost:3000/r/demo123
```

**Создание лида (API):**
```bash
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Иван",
    "lastName": "Петров",
    "email": "ivan@example.com",
    "phone": "+79991234567",
    "landerId": "lander-id-here"
  }'
```

### Трекинг кликов

Трекинговая ссылка с параметрами:
```
http://localhost:3000/r/demo123?sub1=source&sub2=campaign&sub3=ad
```

Система автоматически:
- Определяет GEO по IP (через ipwho.is, ip-api.com)
- Парсит User-Agent (устройство, ОС, браузер)
- Детектирует ботов
- Дедуплицирует клики (24ч по IP+UA)
- Выбирает лендинг с учетом весов
- Создает событие `land_view`

### Статистика

Просмотр статистики:
- **Админ:** http://localhost:3000/admin/campaigns
- **Вебмастер:** http://localhost:3000/cabinet

Экспорт данных в CSV доступен в интерфейсе.

## Тестирование

### Запуск тестов

```bash
# Запустить все тесты
npm test

# Запустить в watch режиме
npm run test:watch

# Запустить с покрытием
npm run test:coverage

# Запустить UI для тестов
npm run test:ui
```

### Тестируемые модули

Тесты покрывают:
- Валидацию телефонов и email
- Парсинг User-Agent и детект ботов
- Определение GEO и нормализацию IP
- Хеширование паролей (bcrypt)
- Валидацию схемы лидов (Zod)
- Логику выбора лендингов
- Проверку daily cap

## Структура проекта

```
domonet/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── admin/             # Админ-панель
│   │   ├── cabinet/           # Кабинет вебмастера
│   │   ├── api/               # API endpoints
│   │   ├── l/[slug]/          # Страницы лендингов
│   │   ├── r/[code]/          # Редиректор трекинга
│   │   └── t.js/              # Tracking script
│   ├── components/            # React компоненты
│   │   ├── lands/            # Компоненты лендингов
│   │   ├── tracker/          # Exit-попапы, трекинг
│   │   └── leads/            # Формы лидов
│   └── lib/                   # Основная бизнес-логика
│       ├── tracker.ts        # Трекинг кликов
│       ├── leads.ts          # Создание лидов
│       ├── integrations.ts   # Отправка в CRM
│       ├── auth.ts           # JWT авторизация
│       ├── geo.ts            # Определение GEO
│       └── ua.ts             # Парсинг User-Agent
├── prisma/
│   ├── schema.prisma         # Схема базы данных
│   └── seed.ts               # Тестовые данные
├── tests/                     # Тесты (Vitest)
└── .github/workflows/         # CI/CD
```

## Команды npm

| Команда | Описание |
|---------|----------|
| `npm run dev` | Запуск dev-сервера |
| `npm run build` | Сборка production |
| `npm start` | Запуск production сервера |
| `npm test` | Запуск тестов |
| `npm run test:watch` | Тесты в watch режиме |
| `npm run test:coverage` | Тесты с coverage |
| `npm run lint` | Проверка кода |
| `npm run db:up` | Запуск PostgreSQL (Docker) |
| `npm run db:generate` | Генерация Prisma Client |
| `npm run db:push` | Применение схемы к БД |
| `npm run db:seed` | Загрузка тестовых данных |
| `npm run db:setup` | Полная настройка БД |

## Разработка

### Добавление нового лендинга

1. Добавьте тип в `prisma/schema.prisma` → `enum LanderType`
2. Создайте компонент `src/components/lands/MyLand.tsx`
3. Добавьте в `src/components/LanderSwitch.tsx`
4. Добавьте в `prisma/seed.ts` → массив `LANDERS`
5. Выполните миграцию: `npx prisma migrate dev --name add_my_lander`

### Изменение схемы БД

```bash
# Отредактируйте prisma/schema.prisma
npx prisma migrate dev --name my_change
npx prisma generate
```

### Добавление языка

1. Добавьте переводы в `src/lib/i18n.ts` → `TRANSLATIONS`
2. Добавьте fallback в `detectLocale()`
3. (Опционально) Добавьте правило телефона в `src/lib/phone.ts`

## CI/CD

GitHub Actions автоматически запускает тесты при push/PR:

```bash
# Локально проверить, что пройдет CI:
npm ci --legacy-peer-deps
npm test
npm run lint
```

## Production

### Сборка

```bash
npm run build
npm start
```

### Переменные окружения для production

Обязательно установите:
- `AUTH_SECRET` - случайная строка 32+ символов
- `DATABASE_URL` - URL вашей PostgreSQL БД
- `NEXT_PUBLIC_APP_URL` - публичный URL вашего домена
- `NODE_ENV=production`

### Деплой на Vercel

```bash
vercel
# Добавьте env переменные в dashboard
```
