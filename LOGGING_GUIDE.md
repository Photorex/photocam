# 📊 Comprehensive Logging Guide

## 🎯 Где искать логи при падении сайта

### 1. **Критические ошибки (ГЛАВНЫЙ ЛОГ)**
```bash
# Все критические ошибки пишутся сюда:
cat /home/dev2/.pm2/logs/critical/critical-errors.log

# Последние 100 строк:
tail -100 /home/dev2/.pm2/logs/critical/critical-errors.log

# Следить в реальном времени:
tail -f /home/dev2/.pm2/logs/critical/critical-errors.log

# Искать ошибки за последний час:
tail -1000 /home/dev2/.pm2/logs/critical/critical-errors.log | grep "$(date -u +%Y-%m-%d)"
```

### 2. **PM2 логи**
```bash
# Все логи сразу:
pm2 logs --lines 200

# Только ошибки simcam:
pm2 logs simcam --err --lines 200

# Только ошибки health-checker:
pm2 logs health-checker --err --lines 200

# Output логи simcam:
pm2 logs simcam --out --lines 200
```

### 3. **Логи по категориям**

#### MongoDB проблемы:
```bash
grep "MONGODB" /home/dev2/.pm2/logs/critical/critical-errors.log | tail -50
```

#### API ошибки:
```bash
grep "API" /home/dev2/.pm2/logs/critical/critical-errors.log | tail -50
```

#### Memory проблемы:
```bash
grep "MEMORY" /home/dev2/.pm2/logs/critical/critical-errors.log | tail -50
```

#### Критические падения:
```bash
grep "CRITICAL" /home/dev2/.pm2/logs/critical/critical-errors.log | tail -50
```

---

## 📝 Что логируется

### Категории логов:

| Категория | Что логируется | Уровень |
|-----------|----------------|---------|
| **MONGODB** | Подключения, отключения, ошибки | WARN/ERROR/CRITICAL |
| **API** | Запросы, ошибки, медленные запросы (>5s) | INFO/WARN/ERROR |
| **HEALTH_CHECK** | Проверки здоровья БД | INFO/WARN/ERROR |
| **MEMORY_MONITOR** | Использование памяти каждые 5 мин | INFO/WARN |
| **PROCESS** | Uncaught exceptions, unhandled rejections | CRITICAL |

### Уровни логирования:

- **INFO**: Информационные сообщения (не пишутся в файл)
- **WARN**: Предупреждения (пишутся в файл)
- **ERROR**: Ошибки (пишутся в файл)
- **CRITICAL**: Критические проблемы (пишутся в файл)

---

## 🔍 Как анализировать падение сайта

### Шаг 1: Проверить критические логи
```bash
# Посмотреть последние критические ошибки
tail -200 /home/dev2/.pm2/logs/critical/critical-errors.log
```

### Шаг 2: Проверить PM2 статус
```bash
pm2 list
# Смотрим на колонку ↺ (restart count)
# Если число большое = проблема
```

### Шаг 3: Проверить конкретный процесс
```bash
pm2 describe simcam
# Смотрим:
# - unstable restarts
# - uptime (если маленький = часто падает)
# - restarts (если много = проблема)
```

### Шаг 4: Проверить последние ошибки
```bash
# Последние ошибки simcam
pm2 logs simcam --err --lines 100 | less

# Если видите "CRITICAL" - смотрите детали в critical-errors.log
```

### Шаг 5: Проверить memory
```bash
# Memory usage из логов
grep "MEMORY" /home/dev2/.pm2/logs/critical/critical-errors.log | tail -20

# Memory из PM2
pm2 describe simcam | grep -A 10 "Code metrics"
```

---

## 🚨 Типичные проблемы и где их искать

### Проблема: Сайт падает с timeout

**Что смотреть:**
```bash
# 1. Медленные запросы API
grep "Slow response" /home/dev2/.pm2/logs/critical/critical-errors.log | tail -20

# 2. MongoDB timeout
grep "socketTimeoutMS\|timeout" /home/dev2/.pm2/logs/critical/critical-errors.log | tail -20

# 3. Health check timeout
pm2 logs health-checker --err | grep "timeout"
```

### Проблема: Out of Memory

**Что смотреть:**
```bash
# 1. High memory warnings
grep "High memory usage" /home/dev2/.pm2/logs/critical/critical-errors.log | tail -20

# 2. SIGKILL в логах
pm2 logs simcam --err | grep "SIGKILL"

# 3. Memory usage history
grep "MEMORY_MONITOR" /home/dev2/.pm2/logs/critical/critical-errors.log | tail -50
```

### Проблема: Database disconnected

**Что смотреть:**
```bash
# 1. MongoDB connection errors
grep "MONGODB.*disconnected\|connection error" /home/dev2/.pm2/logs/critical/critical-errors.log | tail -30

# 2. Pool exhausted
grep "Connection pool" /home/dev2/.pm2/logs/critical/critical-errors.log | tail -20

# 3. Health check failures
pm2 logs health-checker --err | grep "Database unhealthy"
```

### Проблема: Uncaught Exception

**Что смотреть:**
```bash
# Все uncaught exceptions
grep "Uncaught Exception\|Unhandled.*Rejection" /home/dev2/.pm2/logs/critical/critical-errors.log | tail -50

# С полным stack trace
grep -A 20 "CRITICAL.*PROCESS" /home/dev2/.pm2/logs/critical/critical-errors.log | tail -100
```

---

## 📈 Мониторинг в реальном времени

### Следить за критическими ошибками:
```bash
tail -f /home/dev2/.pm2/logs/critical/critical-errors.log
```

### Следить за всеми PM2 логами:
```bash
pm2 logs
```

### Следить только за ошибками:
```bash
pm2 logs --err
```

### Мониторить memory и CPU:
```bash
pm2 monit
```

---

## 🛠️ Automation Scripts

### Скрипт для быстрой диагностики:
```bash
#!/bin/bash
# diagnostic.sh

echo "=== PM2 Status ==="
pm2 list

echo ""
echo "=== Last 20 Critical Errors ==="
tail -20 /home/dev2/.pm2/logs/critical/critical-errors.log

echo ""
echo "=== Memory Usage ==="
grep "MEMORY_MONITOR" /home/dev2/.pm2/logs/critical/critical-errors.log | tail -5

echo ""
echo "=== Recent Restarts ==="
pm2 logs simcam --err --lines 50 | grep "SIGKILL\|SIGTERM\|exit"

echo ""
echo "=== MongoDB Status ==="
grep "MONGODB" /home/dev2/.pm2/logs/critical/critical-errors.log | tail -10
```

Сохраните как `/home/dev2/diagnostic.sh` и запускайте:
```bash
chmod +x ~/diagnostic.sh
~/diagnostic.sh
```

---

## 📊 Log Rotation

Логи могут стать большими. Очистка:

```bash
# Очистить старые PM2 логи
pm2 flush

# Архивировать critical logs (каждую неделю)
cd /home/dev2/.pm2/logs/critical
tar -czf critical-$(date +%Y%m%d).tar.gz critical-errors.log
echo "" > critical-errors.log
```

---

## 🎯 Quick Commands Cheat Sheet

```bash
# Критические ошибки за последний час
tail -1000 /home/dev2/.pm2/logs/critical/critical-errors.log | grep "$(date -u +%Y-%m-%dT$(date -u +%H))"

# Все MongoDB ошибки сегодня
grep "MONGODB.*ERROR\|MONGODB.*CRITICAL" /home/dev2/.pm2/logs/critical/critical-errors.log | grep "$(date +%Y-%m-%d)"

# Подсчитать рестарты simcam
pm2 describe simcam | grep "restarts"

# Проверить heap usage
pm2 describe simcam | grep "Heap"

# Последние 100 API ошибок
grep "API.*ERROR" /home/dev2/.pm2/logs/critical/critical-errors.log | tail -100

# Memory warnings
grep "High memory" /home/dev2/.pm2/logs/critical/critical-errors.log | tail -50
```

---

## 🚀 После добавления логирования

После деплоя новых изменений с логированием:

1. **Проверить что логи пишутся:**
```bash
# Должен создаться файл
ls -lh /home/dev2/.pm2/logs/critical/critical-errors.log

# Должны появиться записи
tail -50 /home/dev2/.pm2/logs/critical/critical-errors.log
```

2. **Мониторить в реальном времени:**
```bash
# В одном терминале
tail -f /home/dev2/.pm2/logs/critical/critical-errors.log

# В другом терминале
pm2 logs
```

3. **Проверять каждый час:**
```bash
pm2 list
tail -20 /home/dev2/.pm2/logs/critical/critical-errors.log
```

---

**Теперь при любом падении у вас будет полная информация о причине!** 🎯

