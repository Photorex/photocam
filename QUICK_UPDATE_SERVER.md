# 🚀 Быстрое обновление на сервере (Heap 4GB Fix)

## На Windows (локально)

```bash
git add .
git commit -m "Fix: Use custom server with 4GB heap limit"
git push origin main
```

## На Ubuntu сервере

```bash
ssh -i C:\Users\machine\ggsel dev2@185.252.233.149
cd /var/www/simcam/photo
git pull origin main
pm2 delete all
pm2 start ecosystem.config.js
pm2 save
pm2 logs simcam --lines 20
```

### ✅ Ожидаемый результат:
```
✅ V8 Heap Limit: 4096.00 MB
> Ready on http://localhost:3000
```

### Проверить heap через 30 секунд:
```bash
pm2 describe simcam | grep -A 5 "Code metrics"
```

Должно показать:
```
Heap Size: ~4000 MiB  ✅ (было 77 MiB)
Heap Usage: <50%      ✅ (было 95%+)
```

---

## ⚠️ Если порт 3000 занят

```bash
sudo lsof -i :3000
sudo kill -9 <PID>
# Или
sudo pkill -9 node
pm2 start ecosystem.config.js
```

