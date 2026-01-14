#!/bin/bash

################################################################################
# Security Monitor & Auto-Heal Script
# Description: Monitors critical services and scans for crypto miner threats
# Usage: sudo ./security_monitor.sh [--kill-miners]
################################################################################

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Log file
LOG_FILE="/var/log/security_monitor.log"
ALERT_LOG="/var/log/security_alerts.log"

# Known miner process names
MINER_PROCESSES=(
    "linuxsys"
    "uhavenobotsxd"
    "ozrpdr"
    "klogd"
    "libsystemd_core"
    "xmrig"
    "minerd"
    "cpuminer"
    "ccminer"
    "nanominer"
    "ethminer"
)

# Known miner file paths
MINER_PATHS=(
    "/var/crash/ozrpdr*"
    "/tmp/corn"
    "/tmp/.*miner"
    "/tmp/kdevtmpfsi"
    "/tmp/systemd-private-*"
    "/dev/shm/.*"
    "/var/tmp/.*sys"
)

# Function to log messages
log_message() {
    local level=$1
    shift
    local message="$@"
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} ${level} ${message}"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ${level} ${message}" >> "$LOG_FILE"
}

# Function to log alerts
log_alert() {
    local message="$@"
    echo -e "${RED}🚨 ALERT: ${message}${NC}"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ALERT: ${message}" >> "$ALERT_LOG"
    log_message "ALERT" "$message"
}

################################################################################
# SERVICE MONITORING
################################################################################

check_mongodb() {
    log_message "${BLUE}[INFO]${NC}" "Checking MongoDB status..."
    
    if systemctl is-active --quiet mongod; then
        log_message "${GREEN}[OK]${NC}" "MongoDB is running"
        return 0
    else
        log_alert "MongoDB is DOWN! Attempting to start..."
        
        # Try to start MongoDB
        sudo systemctl start mongod
        sleep 3
        
        if systemctl is-active --quiet mongod; then
            log_message "${GREEN}[OK]${NC}" "MongoDB started successfully"
            return 0
        else
            log_alert "Failed to start MongoDB! Check logs: sudo journalctl -u mongod -n 50"
            return 1
        fi
    fi
}

check_nginx() {
    log_message "${BLUE}[INFO]${NC}" "Checking nginx status..."
    
    if systemctl is-active --quiet nginx; then
        log_message "${GREEN}[OK]${NC}" "nginx is running"
        return 0
    else
        log_alert "nginx is DOWN! Attempting to start..."
        
        # Kill zombie processes first
        sudo pkill -9 nginx 2>/dev/null
        sleep 1
        
        # Test configuration
        if sudo nginx -t 2>&1 | grep -q "syntax is ok"; then
            sudo systemctl start nginx
            sleep 2
            
            if systemctl is-active --quiet nginx; then
                log_message "${GREEN}[OK]${NC}" "nginx started successfully"
                return 0
            else
                log_alert "Failed to start nginx after killing zombies!"
                return 1
            fi
        else
            log_alert "nginx configuration test FAILED! Fix config first"
            sudo nginx -t
            return 1
        fi
    fi
}

check_pm2_services() {
    log_message "${BLUE}[INFO]${NC}" "Checking PM2 services..."
    
    local services=("simcam" "webhook_server" "health-checker" "mongo-backup")
    local all_ok=true
    
    for service in "${services[@]}"; do
        if pm2 list | grep -q "$service.*online"; then
            log_message "${GREEN}[OK]${NC}" "PM2 service '$service' is online"
        else
            log_alert "PM2 service '$service' is NOT online!"
            all_ok=false
        fi
    done
    
    if [ "$all_ok" = false ]; then
        log_message "${YELLOW}[WARN]${NC}" "Some PM2 services are down. Run: pm2 status"
    fi
}

################################################################################
# MINER DETECTION
################################################################################

scan_miner_processes() {
    log_message "${BLUE}[INFO]${NC}" "Scanning for miner processes..."
    local found=false
    
    for miner in "${MINER_PROCESSES[@]}"; do
        if pgrep -f "$miner" > /dev/null 2>&1; then
            local pids=$(pgrep -f "$miner" | tr '\n' ' ')
            log_alert "MINER DETECTED: Process '$miner' found (PIDs: $pids)"
            found=true
            
            if [ "$1" = "--kill-miners" ]; then
                log_message "${YELLOW}[ACTION]${NC}" "Killing miner process: $miner"
                sudo pkill -9 -f "$miner"
                log_message "${GREEN}[OK]${NC}" "Killed process: $miner"
            fi
        fi
    done
    
    # Check for high CPU processes that might be miners
    log_message "${BLUE}[INFO]${NC}" "Checking for high CPU usage processes..."
    high_cpu=$(ps aux --sort=-%cpu | head -n 6 | tail -n 5)
    
    if echo "$high_cpu" | grep -qE "linuxsys|xmrig|miner"; then
        log_alert "High CPU process detected that looks like a miner!"
        echo "$high_cpu"
    fi
    
    if [ "$found" = false ]; then
        log_message "${GREEN}[OK]${NC}" "No known miner processes detected"
    fi
}

scan_miner_files() {
    log_message "${BLUE}[INFO]${NC}" "Scanning for miner files..."
    local found=false
    
    for path_pattern in "${MINER_PATHS[@]}"; do
        if compgen -G "$path_pattern" > /dev/null 2>&1; then
            for file in $path_pattern; do
                if [ -e "$file" ]; then
                    log_alert "MINER FILE DETECTED: $file"
                    ls -lah "$file"
                    found=true
                    
                    if [ "$1" = "--kill-miners" ]; then
                        log_message "${YELLOW}[ACTION]${NC}" "Deleting miner file: $file"
                        sudo rm -f "$file"
                        log_message "${GREEN}[OK]${NC}" "Deleted: $file"
                    fi
                fi
            done
        fi
    done
    
    if [ "$found" = false ]; then
        log_message "${GREEN}[OK]${NC}" "No known miner files detected"
    fi
}

check_cron_jobs() {
    log_message "${BLUE}[INFO]${NC}" "Checking cron jobs for malicious entries..."
    local found=false
    
    # Check cron for all users
    for user in dev1 dev2 root; do
        log_message "${BLUE}[INFO]${NC}" "Checking crontab for user: $user"
        
        if sudo crontab -l -u "$user" 2>/dev/null | grep -qE "ozrpdr|linuxsys|miner|/var/crash|/tmp/corn"; then
            log_alert "Malicious cron job found for user: $user"
            sudo crontab -l -u "$user" | grep -E "ozrpdr|linuxsys|miner|/var/crash|/tmp/corn"
            found=true
            
            if [ "$1" = "--kill-miners" ]; then
                log_message "${YELLOW}[ACTION]${NC}" "Cleaning crontab for user: $user"
                sudo crontab -l -u "$user" 2>/dev/null | \
                    grep -vE "ozrpdr|linuxsys|miner|/var/crash|/tmp/corn" | \
                    sudo crontab -u "$user" -
                log_message "${GREEN}[OK]${NC}" "Cleaned crontab for: $user"
            fi
        fi
    done
    
    # Check system-wide cron directories
    for cron_dir in /etc/cron.d /etc/cron.daily /etc/cron.hourly /etc/cron.monthly /etc/cron.weekly; do
        if [ -d "$cron_dir" ]; then
            if sudo grep -rE "ozrpdr|linuxsys|miner|/var/crash" "$cron_dir" 2>/dev/null; then
                log_alert "Malicious cron file found in: $cron_dir"
                found=true
            fi
        fi
    done
    
    if [ "$found" = false ]; then
        log_message "${GREEN}[OK]${NC}" "No malicious cron jobs detected"
    fi
}

check_profile_files() {
    log_message "${BLUE}[INFO]${NC}" "Checking .profile and .bashrc files..."
    local found=false
    
    for user_home in /home/dev1 /home/dev2 /root; do
        for file in .profile .bashrc .bash_profile; do
            if [ -f "$user_home/$file" ]; then
                if grep -qE "ozrpdr|linuxsys|/var/crash|/tmp/corn" "$user_home/$file" 2>/dev/null; then
                    log_alert "Malicious code found in: $user_home/$file"
                    grep -E "ozrpdr|linuxsys|/var/crash|/tmp/corn" "$user_home/$file"
                    found=true
                    
                    if [ "$1" = "--kill-miners" ]; then
                        log_message "${YELLOW}[ACTION]${NC}" "Cleaning: $user_home/$file"
                        sudo sed -i '/ozrpdr\|linuxsys\|\/var\/crash\|\/tmp\/corn/d' "$user_home/$file"
                        log_message "${GREEN}[OK]${NC}" "Cleaned: $user_home/$file"
                    fi
                fi
            fi
        done
    done
    
    if [ "$found" = false ]; then
        log_message "${GREEN}[OK]${NC}" "No malicious code in profile files"
    fi
}

check_suspicious_network() {
    log_message "${BLUE}[INFO]${NC}" "Checking for suspicious network connections..."
    
    # Check for connections to known mining pools
    local mining_ports=("3333" "4444" "5555" "7777" "8888" "14444")
    
    for port in "${mining_ports[@]}"; do
        if netstat -an 2>/dev/null | grep -q "ESTABLISHED.*:$port"; then
            log_alert "Suspicious connection detected on mining port: $port"
            netstat -anp | grep ":$port.*ESTABLISHED"
        fi
    done
}

################################################################################
# SECURITY CHECKS
################################################################################

check_upload_security() {
    log_message "${BLUE}[INFO]${NC}" "Checking upload directories for suspicious files..."
    
    local upload_dirs=(
        "/var/www/simcam/photo/webhook_server/uploads"
        "/var/www/simcam/photo/simcam/public"
    )
    
    for dir in "${upload_dirs[@]}"; do
        if [ -d "$dir" ]; then
            # Check for non-image files
            find "$dir" -type f ! \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.webp" \) 2>/dev/null | while read file; do
                log_alert "Non-image file in upload directory: $file"
            done
            
            # Check for SVG files (can contain JavaScript)
            find "$dir" -type f -name "*.svg" 2>/dev/null | while read file; do
                log_alert "SVG file found (potential XSS): $file"
            done
        fi
    done
}

################################################################################
# MAIN EXECUTION
################################################################################

main() {
    clear
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║           Security Monitor & Auto-Heal Script                  ║"
    echo "║                   $(date '+%Y-%m-%d %H:%M:%S')                        ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
    
    # Check if running with sudo for some operations
    if [ "$EUID" -ne 0 ] && [ "$1" = "--kill-miners" ]; then 
        echo -e "${RED}ERROR: --kill-miners requires sudo privileges${NC}"
        echo "Usage: sudo ./security_monitor.sh --kill-miners"
        exit 1
    fi
    
    log_message "${BLUE}[START]${NC}" "Starting security monitoring..."
    
    # Service checks
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    echo "  SERVICE HEALTH CHECKS"
    echo "═══════════════════════════════════════════════════════════════"
    check_mongodb
    check_nginx
    check_pm2_services
    
    # Miner detection
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    echo "  CRYPTO MINER DETECTION"
    echo "═══════════════════════════════════════════════════════════════"
    scan_miner_processes "$1"
    scan_miner_files "$1"
    check_cron_jobs "$1"
    check_profile_files "$1"
    check_suspicious_network
    
    # Security checks
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    echo "  SECURITY CHECKS"
    echo "═══════════════════════════════════════════════════════════════"
    check_upload_security
    
    # Summary
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    echo "  SCAN COMPLETE"
    echo "═══════════════════════════════════════════════════════════════"
    log_message "${GREEN}[DONE]${NC}" "Security monitoring completed"
    
    if [ "$1" != "--kill-miners" ]; then
        echo ""
        echo -e "${YELLOW}TIP: Run with --kill-miners to automatically remove threats${NC}"
        echo "Example: sudo ./security_monitor.sh --kill-miners"
    fi
    
    echo ""
    echo "Logs saved to: $LOG_FILE"
    echo "Alerts saved to: $ALERT_LOG"
    echo ""
}

# Run main function
main "$@"
