#!/bin/bash

################################################################################
# Security Monitor Installation Script
# Installs security_monitor.sh and sets up automatic monitoring
################################################################################

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║       Installing Security Monitor & Auto-Heal Script           ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}ERROR: This script must be run as root${NC}"
    echo "Usage: sudo ./install_security_monitor.sh"
    exit 1
fi

# Create directory for scripts
INSTALL_DIR="/usr/local/bin"
SCRIPT_NAME="security_monitor.sh"
LOG_DIR="/var/log"

echo -e "${YELLOW}[1/5]${NC} Copying security monitor script..."
if [ -f "$SCRIPT_NAME" ]; then
    cp "$SCRIPT_NAME" "$INSTALL_DIR/$SCRIPT_NAME"
    chmod +x "$INSTALL_DIR/$SCRIPT_NAME"
    echo -e "${GREEN}✓${NC} Script installed to $INSTALL_DIR/$SCRIPT_NAME"
else
    echo -e "${RED}✗${NC} $SCRIPT_NAME not found in current directory!"
    exit 1
fi

echo ""
echo -e "${YELLOW}[2/5]${NC} Creating log files..."
touch "$LOG_DIR/security_monitor.log"
touch "$LOG_DIR/security_alerts.log"
chmod 644 "$LOG_DIR/security_monitor.log"
chmod 644 "$LOG_DIR/security_alerts.log"
echo -e "${GREEN}✓${NC} Log files created"

echo ""
echo -e "${YELLOW}[3/5]${NC} Setting up cron job for automatic monitoring..."

# Create cron job that runs every 5 minutes
CRON_JOB="*/5 * * * * $INSTALL_DIR/$SCRIPT_NAME >> $LOG_DIR/security_monitor_cron.log 2>&1"

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "$SCRIPT_NAME"; then
    echo -e "${YELLOW}⚠${NC} Cron job already exists, updating..."
    (crontab -l 2>/dev/null | grep -v "$SCRIPT_NAME"; echo "$CRON_JOB") | crontab -
else
    (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
fi
echo -e "${GREEN}✓${NC} Cron job configured (runs every 5 minutes)"

echo ""
echo -e "${YELLOW}[4/5]${NC} Creating systemd service for immediate alerts..."

cat > /etc/systemd/system/security-monitor.service << 'EOF'
[Unit]
Description=Security Monitor & Auto-Heal Service
After=network.target

[Service]
Type=oneshot
ExecStart=/usr/local/bin/security_monitor.sh
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

cat > /etc/systemd/system/security-monitor.timer << 'EOF'
[Unit]
Description=Run Security Monitor every 5 minutes
Requires=security-monitor.service

[Timer]
OnBootSec=2min
OnUnitActiveSec=5min
AccuracySec=1s

[Install]
WantedBy=timers.target
EOF

systemctl daemon-reload
systemctl enable security-monitor.timer
systemctl start security-monitor.timer

echo -e "${GREEN}✓${NC} Systemd timer configured"

echo ""
echo -e "${YELLOW}[5/5]${NC} Running initial scan..."
echo ""
$INSTALL_DIR/$SCRIPT_NAME

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    INSTALLATION COMPLETE                       ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}Security Monitor is now active!${NC}"
echo ""
echo "The script will run automatically every 5 minutes."
echo ""
echo "Manual usage:"
echo "  - View status:  sudo $INSTALL_DIR/$SCRIPT_NAME"
echo "  - Kill miners:  sudo $INSTALL_DIR/$SCRIPT_NAME --kill-miners"
echo "  - View logs:    sudo tail -f $LOG_DIR/security_monitor.log"
echo "  - View alerts:  sudo tail -f $LOG_DIR/security_alerts.log"
echo ""
echo "Cron status:"
echo "  - List cron:    crontab -l"
echo "  - Timer status: sudo systemctl status security-monitor.timer"
echo ""
