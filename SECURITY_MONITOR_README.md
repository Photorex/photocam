# Security Monitor & Auto-Heal System

Automated security monitoring script that checks services and detects crypto miners.

## 🎯 What It Does

### Service Health Checks
- ✅ **MongoDB** - Auto-restarts if down
- ✅ **Nginx** - Kills zombies and restarts if needed
- ✅ **PM2 Services** - Monitors simcam, webhook_server, health-checker, mongo-backup

### Crypto Miner Detection
- 🔍 **Process Scanning** - Detects known miner processes (linuxsys, uhavenobotsxd, ozrpdr, xmrig, etc.)
- 🔍 **File Scanning** - Finds miner files in /var/crash, /tmp, /dev/shm
- 🔍 **Cron Jobs** - Detects malicious cron entries
- 🔍 **Profile Files** - Scans .bashrc, .profile for injected code
- 🔍 **Network** - Checks for connections to mining pools
- 🔍 **Upload Security** - Finds suspicious files in upload directories

## 📦 Installation

### On Server (dev1 or dev2)

```bash
# 1. Upload both scripts to server
scp security_monitor.sh install_security_monitor.sh dev2@your-server:/tmp/

# 2. SSH to server
ssh dev2@your-server

# 3. Move to scripts directory
cd /tmp
chmod +x security_monitor.sh install_security_monitor.sh

# 4. Install (sets up cron + systemd timer)
sudo ./install_security_monitor.sh
```

## 🚀 Usage

### Manual Scan (Read-Only)
```bash
sudo /usr/local/bin/security_monitor.sh
```

### Active Remediation (Kill Miners)
```bash
sudo /usr/local/bin/security_monitor.sh --kill-miners
```

This will:
- Kill miner processes
- Delete miner files
- Clean cron jobs
- Remove malicious code from profile files

### View Logs
```bash
# Main log
sudo tail -f /var/log/security_monitor.log

# Alerts only
sudo tail -f /var/log/security_alerts.log

# Cron execution log
sudo tail -f /var/log/security_monitor_cron.log
```

### Check Automatic Monitoring Status
```bash
# Via cron
crontab -l | grep security_monitor

# Via systemd timer
sudo systemctl status security-monitor.timer
```

## 🔧 Configuration

The script runs automatically every 5 minutes via both:
1. **Cron** - `*/5 * * * *`
2. **Systemd Timer** - More reliable than cron

## 📊 What Gets Checked

### Known Miner Processes
```
linuxsys, uhavenobotsxd, ozrpdr, klogd, libsystemd_core
xmrig, minerd, cpuminer, ccminer, nanominer, ethminer
```

### Suspicious File Locations
```
/var/crash/ozrpdr*
/tmp/corn
/tmp/.*miner
/tmp/kdevtmpfsi
/dev/shm/.*
/var/tmp/.*sys
```

### Mining Pool Ports
```
3333, 4444, 5555, 7777, 8888, 14444
```

## 🚨 Alert Examples

```
🚨 ALERT: MongoDB is DOWN! Attempting to start...
🚨 ALERT: nginx is DOWN! Attempting to start...
🚨 ALERT: MINER DETECTED: Process 'linuxsys' found (PIDs: 12345)
🚨 ALERT: MINER FILE DETECTED: /var/crash/ozrpdr
🚨 ALERT: Malicious cron job found for user: dev1
🚨 ALERT: Malicious code found in: /home/dev2/.bashrc
```

## 📝 Logs Location

| File | Purpose |
|------|---------|
| `/var/log/security_monitor.log` | All activity |
| `/var/log/security_alerts.log` | Critical alerts only |
| `/var/log/security_monitor_cron.log` | Cron execution logs |

## 🔄 Updating the Script

```bash
# 1. Upload new version
scp security_monitor.sh dev2@your-server:/tmp/

# 2. Copy to system
sudo cp /tmp/security_monitor.sh /usr/local/bin/
sudo chmod +x /usr/local/bin/security_monitor.sh

# 3. Test
sudo /usr/local/bin/security_monitor.sh
```

## 🛑 Uninstallation

```bash
# Remove cron job
crontab -l | grep -v security_monitor | crontab -

# Remove systemd timer
sudo systemctl stop security-monitor.timer
sudo systemctl disable security-monitor.timer
sudo rm /etc/systemd/system/security-monitor.service
sudo rm /etc/systemd/system/security-monitor.timer
sudo systemctl daemon-reload

# Remove script
sudo rm /usr/local/bin/security_monitor.sh
```

## ⚙️ Works With

- ✅ dev1 and dev2 users
- ✅ Ubuntu/Debian systems
- ✅ MongoDB + nginx + PM2 stack
- ✅ Systemd-based systems

## 🔒 Security Notes

1. **Requires sudo** for service restarts and killing processes
2. **Logs contain timestamps** for audit trail
3. **Safe to run frequently** - minimal performance impact
4. **Read-only by default** - use `--kill-miners` to take action

## 📞 Troubleshooting

### Script not running automatically?
```bash
# Check cron
sudo service cron status

# Check systemd timer
sudo systemctl status security-monitor.timer

# Force run
sudo /usr/local/bin/security_monitor.sh
```

### Permissions issues?
```bash
sudo chmod +x /usr/local/bin/security_monitor.sh
sudo chown root:root /usr/local/bin/security_monitor.sh
```

### Still seeing miners?
```bash
# Nuclear option - kill ALL suspicious processes
sudo /usr/local/bin/security_monitor.sh --kill-miners

# Then check what's listening
sudo netstat -tulpn | grep ESTABLISHED

# Block at firewall level
sudo ufw deny out 3333
sudo ufw deny out 4444
sudo ufw deny out 5555
```

## 📈 Sample Output

```
╔════════════════════════════════════════════════════════════════╗
║           Security Monitor & Auto-Heal Script                  ║
║                   2026-01-14 17:50:00                          ║
╚════════════════════════════════════════════════════════════════╝

═══════════════════════════════════════════════════════════════
  SERVICE HEALTH CHECKS
═══════════════════════════════════════════════════════════════
[2026-01-14 17:50:01] [OK] MongoDB is running
[2026-01-14 17:50:02] [OK] nginx is running
[2026-01-14 17:50:03] [OK] PM2 service 'simcam' is online
[2026-01-14 17:50:03] [OK] PM2 service 'webhook_server' is online
[2026-01-14 17:50:03] [OK] PM2 service 'health-checker' is online
[2026-01-14 17:50:03] [OK] PM2 service 'mongo-backup' is online

═══════════════════════════════════════════════════════════════
  CRYPTO MINER DETECTION
═══════════════════════════════════════════════════════════════
[2026-01-14 17:50:04] [OK] No known miner processes detected
[2026-01-14 17:50:05] [OK] No known miner files detected
[2026-01-14 17:50:06] [OK] No malicious cron jobs detected
[2026-01-14 17:50:07] [OK] No malicious code in profile files

═══════════════════════════════════════════════════════════════
  SECURITY CHECKS
═══════════════════════════════════════════════════════════════
[2026-01-14 17:50:08] [OK] No suspicious files in upload directories

═══════════════════════════════════════════════════════════════
  SCAN COMPLETE
═══════════════════════════════════════════════════════════════
[2026-01-14 17:50:09] [DONE] Security monitoring completed

Logs saved to: /var/log/security_monitor.log
Alerts saved to: /var/log/security_alerts.log
```

---

**Created:** 2026-01-14  
**Version:** 1.0  
**For:** dev1 & dev2 users on photorend infrastructure
