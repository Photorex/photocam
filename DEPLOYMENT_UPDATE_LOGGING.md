# 🚀 Deployment: Adding Comprehensive Logging

## 📦 Что добавлено:

### 1. **Centralized Logger** (`simcam/app/lib/logger.ts`)
- Логирование всех критических событий
- Автоматическое отслеживание memory usage
- Global error handlers для uncaught exceptions
- Запись в файл `/home/dev2/.pm2/logs/critical/critical-errors.log`

### 2. **Enhanced MongoDB Logging** (`simcam/app/lib/mongodb/mongodb.ts`)
- Логирование всех подключений/отключений
- Мониторинг connection pool
- Детальные ошибки при проблемах с БД

### 3. **API Error Middleware** (`simcam/app/api/middleware/errorLogger.ts`)
- Логирование всех API запросов
- Отслеживание медленных запросов (>5s)
- Автоматическое логирование memory при ошибках

### 4. **Enhanced Health Checker** (`health-checker/index.js`)
- Детальное логирование каждой проверки
- Отдельный лог файл: `/home/dev2/.pm2/logs/critical/health-checker-critical.log`
- Таймеры для всех операций
- Предупреждения о низком connection pool

---

## 📝 Шаги Deployment:

### Шаг 1: Commit и Push (на локальной машине)

```bash
# В Windows PowerShell
cd C:\Users\machine\Desktop\dev\ggsel\photorend

git add .
git commit -m "Add comprehensive logging system for debugging site crashes"
git push origin main
```

### Шаг 2: Pull на сервере

```bash
# SSH в сервер как dev2
ssh -i C:\Users\machine\ggsel dev2@185.252.233.149

# Проверить текущие процессы
pm2 list

# Pull новый код
cd /var/www/simcam/photo
git pull origin main

# Установить dependencies (если добавились новые)
cd simcam
npm install
```

### Шаг 3: Build Next.js

```bash
cd /var/www/simcam/photo/simcam
npm run build
```

### Шаг 4: Restart Health-Checker

```bash
pm2 restart health-checker

# Проверить что новые логи работают
tail -f /home/dev2/.pm2/logs/critical/health-checker-critical.log
```

### Шаг 5: Restart Simcam

```bash
# Остановить
pm2 stop simcam
pm2 delete simcam

# Запустить с 4GB памяти
cd /var/www/simcam/photo/simcam
pm2 start npm --name "simcam" \
  --max-memory-restart 4G \
  --node-args="--max-old-space-size=4096" \
  -- start

# Сохранить конфигурацию
pm2 save
```

### Шаг 6: Проверить что логи работают

```bash
# Проверить что директория создана
ls -la /home/dev2/.pm2/logs/critical/

# Проверить логи simcam (через 1-2 минуты должны появиться записи)
tail -50 /home/dev2/.pm2/logs/critical/critical-errors.log

# Проверить логи health-checker
tail -50 /home/dev2/.pm2/logs/critical/health-checker-critical.log

# Мониторить в реальном времени
tail -f /home/dev2/.pm2/logs/critical/critical-errors.log
```

### Шаг 7: Мониторинг

```bash
# Проверить статус всех процессов
pm2 list

# Смотреть логи
pm2 logs

# Проверить сайт
curl http://localhost:3000/api/status/test
curl http://localhost:3000/api/health/db
```

---

## ✅ Проверка после Deployment:

### 1. Проверить что файлы созданы:

```bash
ls -lh /home/dev2/.pm2/logs/critical/
# Должны быть:
# - critical-errors.log
# - health-checker-critical.log
```

### 2. Проверить что логи пишутся:

```bash
# Должны быть записи INFO о подключении к MongoDB
grep "MONGODB" /home/dev2/.pm2/logs/critical/critical-errors.log | head -20

# Должны быть записи MEMORY_MONITOR каждые 5 минут
grep "MEMORY_MONITOR" /home/dev2/.pm2/logs/critical/critical-errors.log | tail -10

# Должны быть записи health check
grep "health check" /home/dev2/.pm2/logs/critical/health-checker-critical.log | tail -20
```

### 3. Проверить PM2 статус:

```bash
pm2 list

# Restart count НЕ должен расти
# Через 10 минут проверьте снова - должно быть то же число
```

### 4. Проверить сайт в браузере:

- Открыть https://simcam.net
- Проверить что загружается нормально
- Не должно быть 404 или 502 ошибок

---

## 🔍 Теперь при падении сайта:

### 1. Смотрите критические логи:

```bash
tail -100 /home/dev2/.pm2/logs/critical/critical-errors.log
```

### 2. Смотрите health-checker логи:

```bash
tail -100 /home/dev2/.pm2/logs/critical/health-checker-critical.log
```

### 3. Ищите паттерны:

- **CRITICAL** = самые важные ошибки
- **ERROR** = ошибки которые нужно исправить
- **WARN** = предупреждения (high memory, slow requests, etc)

### 4. Смотрите конкретные категории:

```bash
# MongoDB проблемы
grep "MONGODB.*ERROR\|MONGODB.*CRITICAL" /home/dev2/.pm2/logs/critical/critical-errors.log

# Memory проблемы
grep "High memory\|MEMORY" /home/dev2/.pm2/logs/critical/critical-errors.log

# API ошибки
grep "API.*ERROR" /home/dev2/.pm2/logs/critical/critical-errors.log

# Uncaught exceptions
grep "UNCAUGHT\|Unhandled" /home/dev2/.pm2/logs/critical/critical-errors.log
```

---

## 🚨 Если что-то пошло не так:

### Build failed:

```bash
# Проверить ошибки
cd /var/www/simcam/photo/simcam
npm run build

# Если TypeScript ошибки - смотрите детали и сообщите мне
```

### Логи не пишутся:

```bash
# Проверить права на директорию
ls -la /home/dev2/.pm2/logs/

# Создать вручную если нужно
mkdir -p /home/dev2/.pm2/logs/critical
chmod 755 /home/dev2/.pm2/logs/critical
```

### Сайт не работает после restart:

```bash
# Откатиться назад
pm2 stop simcam
pm2 delete simcam

cd /var/www/simcam/photo
git log --oneline | head -5
git checkout <previous-commit-hash>

cd simcam
npm run build

pm2 start npm --name "simcam" -- start
pm2 save
```

---

## 📊 Expected Logs:

После успешного deployment вы должны видеть:

### В `critical-errors.log`:
```
[2025-12-29T...] [INFO] [MONGODB] Creating new MongoDB connection
[2025-12-29T...] [INFO] [MONGODB] Successfully connected to MongoDB
[2025-12-29T...] [INFO] [MONGODB] Mongoose connected to MongoDB
[2025-12-29T...] [INFO] [MEMORY_MONITOR] Memory usage
Details: {
  "rss": 450,
  "heapTotal": 280,
  "heapUsed": 210,
  "external": 15
}
```

### В `health-checker-critical.log`:
```
[2025-12-29T...] [INFO] === Starting health check ===
[2025-12-29T...] [INFO] Health check passed
Details: {
  "duration": "125ms",
  "status": 200
}
[2025-12-29T...] [INFO] Database health check passed
Details: {
  "duration": "78ms",
  "status": 200,
  "poolSize": 15,
  "availableConnections": 85
}
```

---

**Теперь у вас полный контроль и видимость всех критических процессов!** 🎯

