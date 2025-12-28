# PM2 Process Management Manual

## 📋 Table of Contents
1. [Quick Start Guide](#quick-start-guide)
2. [Individual Process Startup](#individual-process-startup)
3. [Using Ecosystem Config](#using-ecosystem-config)
4. [Troubleshooting](#troubleshooting)
5. [Monitoring & Maintenance](#monitoring--maintenance)

---

## 🚀 Quick Start Guide

### Option 1: Start All Processes (Recommended)

```bash
# Navigate to project root
cd /var/www/simcam/photo

# Start all processes using ecosystem config
pm2 start ecosystem.config.js

# Save configuration for auto-restart on reboot
pm2 save

# Setup PM2 to start on system boot
pm2 startup

# Check status
pm2 list
```

### Option 2: Start Individual Processes

See [Individual Process Startup](#individual-process-startup) section below.

---

## 📦 Individual Process Startup

### 1. Simcam (Next.js App) - Port 3000

**Location:** `/var/www/simcam/photo/simcam`

#### Manual Start:
```bash
cd /var/www/simcam/photo/simcam

# Method 1: Using npm (recommended)
pm2 start npm --name "simcam" -- start

# Method 2: Direct Next.js start
pm2 start "node_modules/next/dist/bin/next" --name "simcam" -- start

# With memory limit:
pm2 start npm --name "simcam" --max-memory-restart 1G -- start
```

#### Configuration Options:
- **Port:** 3000
- **Memory Limit:** 1GB (recommended)
- **Instances:** 1 (fork mode)
- **Auto-restart:** Yes
- **Min uptime:** 10s before considered stable

#### Check if running:
```bash
pm2 describe simcam
curl http://localhost:3000/api/status/test
```

---

### 2. Health Checker

**Location:** `/var/www/simcam/photo/health-checker`

#### Manual Start:
```bash
cd /var/www/simcam/photo/health-checker

pm2 start index.js --name "health-checker"

# With memory limit:
pm2 start index.js --name "health-checker" --max-memory-restart 200M
```

#### Configuration Options:
- **Memory Limit:** 200MB
- **Check Interval:** 60 seconds
- **Initial Delay:** 10 seconds
- **Max Failures Before Restart:** 3

#### Check if running:
```bash
pm2 logs health-checker --lines 20
```

**Expected output:**
```
[2025-12-28T21:26:43] === Starting health check ===
[2025-12-28T21:26:43] Health check passed.
[2025-12-28T21:26:43] Database health check passed.
```

---

### 3. Webhook Server - Port 4000

**Location:** `/var/www/simcam/photo/webhook_server`

#### Manual Start:
```bash
cd /var/www/simcam/photo/webhook_server

pm2 start server.js --name "webhook_server"

# With memory limit:
pm2 start server.js --name "webhook_server" --max-memory-restart 500M
```

#### Configuration Options:
- **Port:** 4000
- **Memory Limit:** 500MB
- **Handles:** Image generation webhooks, video processing

#### Check if running:
```bash
pm2 describe webhook_server
curl http://localhost:4000
```

---

### 4. Mongo Backup (Optional)

**Location:** `/var/www/simcam/photo/mongo-backup`

#### Manual Start:
```bash
cd /var/www/simcam/photo/mongo-backup

pm2 start backup.js --name "mongo-backup"

# With memory limit:
pm2 start backup.js --name "mongo-backup" --max-memory-restart 300M
```

#### Configuration Options:
- **Memory Limit:** 300MB
- **Schedule:** Runs on schedule (check backup.js for cron)

---

## ⚙️ Using Ecosystem Config

### Start All Processes:

```bash
cd /var/www/simcam/photo

# Start all
pm2 start ecosystem.config.js

# Or start specific app
pm2 start ecosystem.config.js --only simcam
pm2 start ecosystem.config.js --only health-checker
pm2 start ecosystem.config.js --only webhook_server
pm2 start ecosystem.config.js --only mongo-backup
```

### Stop/Restart Processes:

```bash
# Stop all
pm2 stop all

# Stop specific
pm2 stop simcam
pm2 stop health-checker
pm2 stop webhook_server
pm2 stop mongo-backup

# Restart all
pm2 restart all

# Restart specific
pm2 restart simcam

# Reload (zero-downtime for cluster mode)
pm2 reload simcam
```

### Delete Processes:

```bash
# Delete all
pm2 delete all

# Delete specific
pm2 delete simcam
pm2 delete health-checker
```

---

## 🔧 Troubleshooting

### Process Won't Start

**Check logs:**
```bash
pm2 logs simcam --err --lines 50
pm2 logs health-checker --err --lines 50
pm2 logs webhook_server --err --lines 50
```

**Check if port is already in use:**
```bash
# Check port 3000 (simcam)
sudo lsof -i :3000
sudo netstat -tlnp | grep 3000

# Check port 4000 (webhook)
sudo lsof -i :4000
```

**Kill zombie processes:**
```bash
# Kill all node processes
sudo pkill -9 node

# Kill specific PM2 daemon
pm2 kill

# Restart fresh
pm2 start ecosystem.config.js
```

### Process Keeps Restarting

**Check restart count:**
```bash
pm2 list
# Look at the ↺ column - high number = restart loop
```

**Check why it's restarting:**
```bash
pm2 logs <process-name> --lines 100

# Common causes:
# 1. Port already in use
# 2. Missing dependencies
# 3. MongoDB connection failed
# 4. Memory limit exceeded
# 5. Uncaught exceptions
```

**Reset restart counter:**
```bash
pm2 reset <process-name>
```

### Out of Memory

**Check memory usage:**
```bash
pm2 monit

# Or
pm2 list
# Look at the 'mem' column
```

**Increase memory limit:**
```bash
# Stop process
pm2 stop simcam

# Start with higher limit
pm2 start npm --name "simcam" --max-memory-restart 2G -- start

# Or edit ecosystem.config.js and change max_memory_restart
```

### MongoDB Connection Issues

**Test MongoDB connection:**
```bash
# Check if MongoDB is running
sudo systemctl status mongodb
# or
sudo systemctl status mongod

# Test connection
mongosh mongodb://admin:123QWEasdf@127.0.0.1:27017/simcam

# Check health endpoint
curl http://localhost:3000/api/health/db
```

### Nginx Shows 404 or 502

**Check if simcam is running:**
```bash
pm2 list | grep simcam
curl http://localhost:3000
```

**Check nginx configuration:**
```bash
sudo nginx -t
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

**Restart nginx:**
```bash
sudo systemctl restart nginx
```

---

## 📊 Monitoring & Maintenance

### Real-Time Monitoring

```bash
# Dashboard view
pm2 monit

# List all processes
pm2 list

# Watch logs
pm2 logs --lines 50

# Watch specific process
pm2 logs simcam --lines 50

# Follow logs
pm2 logs simcam -f
```

### Check Process Details

```bash
pm2 describe simcam
pm2 describe health-checker
pm2 describe webhook_server
```

### View Resource Usage

```bash
# CPU and Memory
pm2 monit

# Detailed info
pm2 list
```

### Flush Logs

```bash
# Clear all logs
pm2 flush

# Clear specific app logs
pm2 flush simcam
```

### Save Current State

```bash
# Save current PM2 process list
pm2 save

# This creates a dump file at ~/.pm2/dump.pm2
```

### Auto-Start on Server Reboot

```bash
# Generate startup script (run once)
pm2 startup

# Follow the instructions it gives you (usually requires sudo)

# After starting all your apps, save:
pm2 save

# Now PM2 will resurrect your apps on reboot
```

---

## 🔄 Common Maintenance Tasks

### Update Application Code

```bash
# 1. Navigate to project
cd /var/www/simcam/photo

# 2. Pull latest code
git pull origin main

# 3. Install dependencies (if package.json changed)
cd simcam
npm install

# 4. Build (if needed)
npm run build

# 5. Restart PM2
cd /var/www/simcam/photo
pm2 restart ecosystem.config.js

# 6. Check status
pm2 list
pm2 logs --lines 30
```

### Backup PM2 Configuration

```bash
# Save current PM2 list
pm2 save

# Backup the dump file
cp ~/.pm2/dump.pm2 ~/pm2-backup-$(date +%Y%m%d).dump

# Backup ecosystem config
cp /var/www/simcam/photo/ecosystem.config.js ~/ecosystem-backup-$(date +%Y%m%d).js
```

### Restore PM2 Configuration

```bash
# Method 1: Using saved dump
pm2 resurrect

# Method 2: Using ecosystem
cd /var/www/simcam/photo
pm2 start ecosystem.config.js

# Method 3: Using backup
cp ~/pm2-backup-20251228.dump ~/.pm2/dump.pm2
pm2 resurrect
```

---

## 🚨 Emergency Recovery

### If Everything is Down

```bash
# 1. Check system resources
free -h
df -h
uptime

# 2. Kill everything PM2 related
pm2 kill
sudo pkill -9 node

# 3. Wait a moment
sleep 5

# 4. Start fresh
cd /var/www/simcam/photo
pm2 start ecosystem.config.js

# 5. Save state
pm2 save

# 6. Monitor
pm2 logs --lines 50
```

### If PM2 is Corrupted

```bash
# 1. Backup current config
cp ~/.pm2/dump.pm2 ~/pm2-backup.dump

# 2. Kill PM2 completely
pm2 kill

# 3. Remove PM2 folder
rm -rf ~/.pm2

# 4. Start processes again
cd /var/www/simcam/photo
pm2 start ecosystem.config.js

# 5. Save
pm2 save

# 6. Re-setup startup script
pm2 startup
```

---

## 📝 Quick Reference Commands

```bash
# Start
pm2 start ecosystem.config.js              # Start all from config
pm2 start <script> --name <name>          # Start single process

# Stop/Restart
pm2 stop <name|id|all>                    # Stop process(es)
pm2 restart <name|id|all>                 # Restart process(es)
pm2 reload <name|id|all>                  # Reload (zero-downtime)
pm2 delete <name|id|all>                  # Delete process(es)

# Info
pm2 list                                  # List all processes
pm2 describe <name|id>                    # Show process details
pm2 monit                                 # Monitor dashboard

# Logs
pm2 logs                                  # Show all logs
pm2 logs <name|id>                        # Show specific logs
pm2 logs --err                            # Show error logs only
pm2 flush                                 # Clear all logs

# Save/Restore
pm2 save                                  # Save process list
pm2 resurrect                             # Restore saved processes
pm2 startup                               # Setup auto-start on boot

# Maintenance
pm2 update                                # Update PM2
pm2 reset <name|id>                       # Reset restart counter
pm2 kill                                  # Kill PM2 daemon
```

---

## 🎯 Best Practices

1. **Always use ecosystem.config.js** for production
2. **Save after starting processes:** `pm2 save`
3. **Setup auto-start:** `pm2 startup`
4. **Monitor logs regularly:** `pm2 logs`
5. **Set memory limits** to prevent OOM kills
6. **Use proper error handling** in your apps
7. **Keep PM2 updated:** `npm install -g pm2@latest`
8. **Backup your configuration** before major changes
9. **Use health checks** to detect issues early
10. **Document any custom configurations**

---

## 📞 Support

If you encounter issues:

1. Check logs: `pm2 logs --lines 100`
2. Check process details: `pm2 describe <name>`
3. Check system resources: `free -h`, `df -h`
4. Check if ports are available: `sudo lsof -i :3000`
5. Restart processes: `pm2 restart all`
6. If all else fails: Follow [Emergency Recovery](#-emergency-recovery)

---

**Last Updated:** December 28, 2025  
**PM2 Version:** 6.0.13  
**Node Version:** 22.21.0

