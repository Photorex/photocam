# 🚀 Quick Start Guide - PM2 Processes

## 📦 What You Have

1. **PM2_MANUAL.md** - Complete manual with all commands and troubleshooting
2. **ecosystem.production.config.js** - Bulletproof PM2 configuration
3. **ecosystem.config.js** - Simple PM2 configuration (already in use)
4. **START_PROCESSES.sh** - Automated startup script (Linux/Mac)

---

## ⚡ Quick Commands

### Start Everything (Method 1 - Using Config):
```bash
cd /var/www/simcam/photo
pm2 start ecosystem.config.js
pm2 save
```

### Start Everything (Method 2 - Using Script):
```bash
cd /var/www/simcam/photo
chmod +x START_PROCESSES.sh
./START_PROCESSES.sh
```

### Start Individual Processes:
```bash
# Simcam (Next.js App)
cd /var/www/simcam/photo/simcam
pm2 start npm --name simcam --max-memory-restart 1G -- start

# Health Checker
cd /var/www/simcam/photo/health-checker
pm2 start index.js --name health-checker --max-memory-restart 200M

# Webhook Server
cd /var/www/simcam/photo/webhook_server
pm2 start server.js --name webhook_server --max-memory-restart 500M

# Mongo Backup
cd /var/www/simcam/photo/mongo-backup
pm2 start backup.js --name mongo-backup --max-memory-restart 300M
```

---

## 🔧 Common Tasks

### Check Status:
```bash
pm2 list
```

### View Logs:
```bash
pm2 logs                    # All processes
pm2 logs simcam             # Specific process
pm2 logs --lines 50         # More lines
```

### Restart:
```bash
pm2 restart all             # All processes
pm2 restart simcam          # Specific process
```

### Stop:
```bash
pm2 stop all                # All processes
pm2 stop simcam             # Specific process
```

### Monitor:
```bash
pm2 monit                   # Real-time dashboard
```

---

## 🆘 Emergency Commands

### If Everything is Down:
```bash
pm2 kill
pm2 start ecosystem.config.js
pm2 save
```

### If Process Won't Stop:
```bash
sudo pkill -9 node
pm2 start ecosystem.config.js
```

### Check Logs for Errors:
```bash
pm2 logs --err --lines 100
```

---

## 📚 Full Documentation

- **Complete Manual:** `PM2_MANUAL.md`
- **Production Config:** `ecosystem.production.config.js`
- **Startup Script:** `START_PROCESSES.sh`

---

## ✅ Setup Auto-Start on Boot

```bash
# Run once:
pm2 startup

# Follow the instructions it gives (requires sudo)

# After starting your apps:
pm2 save

# Now PM2 will auto-start on reboot!
```

---

## 🎯 Health Check URLs

- **Basic Health:** http://localhost:3000/api/status/test
- **Database Health:** http://localhost:3000/api/health/db
- **Simcam App:** http://localhost:3000
- **Webhook Server:** http://localhost:4000

---

## 📊 What Each Process Does

| Process | Port | Memory | Purpose |
|---------|------|--------|---------|
| **simcam** | 3000 | 1GB | Main Next.js website |
| **health-checker** | - | 200MB | Monitors app health, auto-restarts |
| **webhook_server** | 4000 | 500MB | Handles image/video webhooks |
| **mongo-backup** | - | 300MB | Automated database backups |

---

## 🔥 Pro Tips

1. Always run `pm2 save` after starting processes
2. Use `pm2 monit` to watch resource usage
3. Check logs regularly: `pm2 logs --lines 50`
4. Health checker will auto-restart simcam if it crashes
5. Memory limits prevent OOM kills

---

**Need Help?** Check `PM2_MANUAL.md` for detailed troubleshooting!

