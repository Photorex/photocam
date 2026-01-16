#!/bin/bash
###############################################################################
# TRACED_BUILD_INSTALL.sh
# 
# Heavy tracing for npm install and build to detect malicious activity
# 
# This script will:
# - Log every npm lifecycle script execution
# - Monitor for curl/wget/shell commands
# - Track child process spawns
# - Detect network connections during install
# - Capture all file modifications
# 
# Usage:
#   chmod +x TRACED_BUILD_INSTALL.sh
#   ./TRACED_BUILD_INSTALL.sh [simcam|webhook_server|mongo-backup|all]
#
# Author: Security Audit
# Date: 2026-01-16
###############################################################################

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging configuration
LOG_DIR="/var/log/npm-security-trace"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
INSTALL_LOG="${LOG_DIR}/npm-install-${TIMESTAMP}.log"
BUILD_LOG="${LOG_DIR}/npm-build-${TIMESTAMP}.log"
NETWORK_LOG="${LOG_DIR}/network-${TIMESTAMP}.log"
PROCESS_LOG="${LOG_DIR}/process-${TIMESTAMP}.log"
SYSCALL_LOG="${LOG_DIR}/syscall-${TIMESTAMP}.log"
ALERT_LOG="${LOG_DIR}/ALERTS-${TIMESTAMP}.log"

# Suspicious patterns to detect
SUSPICIOUS_PATTERNS=(
    "curl.*https://.*\\.sh"
    "wget.*https://.*\\.sh"
    "repositorylinux"
    "publicvm.com"
    "linuxsys"
    "pulseadio"
    "x86_64.kok"
    "/tmp/.*miner"
    "crontab -"
    "bash -c.*curl"
    "bash -c.*wget"
    "nohup.*&"
    "disown"
    "/dev/shm/"
    "base64.*eval"
    "eval.*base64"
)

###############################################################################
# Helper Functions
###############################################################################

print_header() {
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC}  $1"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_alert() {
    echo -e "${MAGENTA}🚨 SECURITY ALERT:${NC} $1"
    echo "[$(date -Iseconds)] ALERT: $1" >> "${ALERT_LOG}"
}

print_info() {
    echo -e "${CYAN}ℹ${NC} $1"
}

# Setup logging directory
setup_logging() {
    print_header "Setting up security logging"
    
    sudo mkdir -p "${LOG_DIR}"
    sudo chmod 755 "${LOG_DIR}"
    
    # Create log files
    sudo touch "${INSTALL_LOG}" "${BUILD_LOG}" "${NETWORK_LOG}" "${PROCESS_LOG}" "${SYSCALL_LOG}" "${ALERT_LOG}"
    sudo chmod 644 "${INSTALL_LOG}" "${BUILD_LOG}" "${NETWORK_LOG}" "${PROCESS_LOG}" "${SYSCALL_LOG}" "${ALERT_LOG}"
    
    print_success "Log directory: ${LOG_DIR}"
    print_success "Install log: ${INSTALL_LOG}"
    print_success "Build log: ${BUILD_LOG}"
    print_success "Network log: ${NETWORK_LOG}"
    print_success "Alerts log: ${ALERT_LOG}"
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking prerequisites"
    
    # Check Node version
    if ! command -v node &> /dev/null; then
        print_error "Node.js not installed!"
        exit 1
    fi
    
    NODE_VERSION=$(node -v)
    if [[ ! "$NODE_VERSION" =~ ^v22\. ]]; then
        print_error "Node.js version must be 22.x, found: $NODE_VERSION"
        exit 1
    fi
    print_success "Node.js version: $NODE_VERSION"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm not installed!"
        exit 1
    fi
    print_success "npm version: $(npm -v)"
    
    # Check if strace is available (for deep syscall monitoring)
    if command -v strace &> /dev/null; then
        print_success "strace available for syscall monitoring"
        STRACE_AVAILABLE=true
    else
        print_warning "strace not available - install with: sudo apt install strace"
        STRACE_AVAILABLE=false
    fi
    
    # Check if auditd is available
    if command -v auditctl &> /dev/null; then
        print_success "auditd available for audit logging"
    else
        print_warning "auditd not available - install with: sudo apt install auditd"
    fi
}

# Start network monitoring
start_network_monitor() {
    print_header "Starting network monitoring"
    
    # Monitor all network connections in background
    {
        while true; do
            echo "=== $(date -Iseconds) ===" >> "${NETWORK_LOG}"
            netstat -tupn 2>/dev/null | grep -E 'node|npm' >> "${NETWORK_LOG}" || true
            sleep 2
        done
    } &
    NETWORK_MONITOR_PID=$!
    
    print_success "Network monitor started (PID: $NETWORK_MONITOR_PID)"
}

# Stop network monitoring
stop_network_monitor() {
    if [[ -n "$NETWORK_MONITOR_PID" ]]; then
        kill $NETWORK_MONITOR_PID 2>/dev/null || true
        print_success "Network monitor stopped"
    fi
}

# Start process monitoring
start_process_monitor() {
    print_header "Starting process monitoring"
    
    # Monitor all child processes
    {
        while true; do
            echo "=== $(date -Iseconds) ===" >> "${PROCESS_LOG}"
            ps auxf | grep -E 'node|npm|curl|wget|bash|sh' | grep -v grep >> "${PROCESS_LOG}" || true
            sleep 2
        done
    } &
    PROCESS_MONITOR_PID=$!
    
    print_success "Process monitor started (PID: $PROCESS_MONITOR_PID)"
}

# Stop process monitoring
stop_process_monitor() {
    if [[ -n "$PROCESS_MONITOR_PID" ]]; then
        kill $PROCESS_MONITOR_PID 2>/dev/null || true
        print_success "Process monitor stopped"
    fi
}

# Scan for suspicious patterns in logs
scan_for_suspicious_activity() {
    local logfile=$1
    local found_suspicious=false
    
    print_header "Scanning for suspicious activity"
    
    for pattern in "${SUSPICIOUS_PATTERNS[@]}"; do
        if grep -qiE "$pattern" "$logfile" 2>/dev/null; then
            print_alert "Suspicious pattern detected: $pattern"
            print_alert "Found in: $logfile"
            grep -niE "$pattern" "$logfile" | head -5 >> "${ALERT_LOG}"
            found_suspicious=true
        fi
    done
    
    if $found_suspicious; then
        print_error "⚠️⚠️⚠️ SUSPICIOUS ACTIVITY DETECTED ⚠️⚠️⚠️"
        print_error "Check: $ALERT_LOG"
        return 1
    else
        print_success "No suspicious activity detected"
        return 0
    fi
}

# Traced npm install
traced_npm_install() {
    local dir=$1
    local name=$2
    
    print_header "Traced npm install: $name"
    
    cd "$dir"
    
    # Clean install
    print_info "Removing node_modules and package-lock.json..."
    rm -rf node_modules package-lock.json
    
    # Start monitoring
    start_network_monitor
    start_process_monitor
    
    # Run npm install with heavy tracing
    print_info "Running npm ci --ignore-scripts with tracing..."
    
    # Create trace preload for this install
    export NODE_OPTIONS="--require /var/www/simcam/photo/trace-preload.js"
    export TRACE_LOG_DIR="${LOG_DIR}"
    export TRACE_MAX_SNIP=2000
    
    if [[ "$STRACE_AVAILABLE" == true ]]; then
        # Use strace for deep syscall monitoring
        print_info "Using strace for syscall monitoring..."
        sudo strace -f -e trace=execve,clone,fork,vfork,connect,socket -s 1000 \
            -o "${SYSCALL_LOG}" \
            npm ci --ignore-scripts --loglevel verbose 2>&1 | tee -a "${INSTALL_LOG}"
    else
        # Regular npm install with verbose logging
        npm ci --ignore-scripts --loglevel verbose 2>&1 | tee -a "${INSTALL_LOG}"
    fi
    
    # Stop monitoring
    stop_network_monitor
    stop_process_monitor
    
    # Scan for suspicious activity
    scan_for_suspicious_activity "${INSTALL_LOG}"
    local scan_result=$?
    
    if [[ $scan_result -ne 0 ]]; then
        print_error "npm install completed but suspicious activity detected!"
        print_error "DO NOT PROCEED - Review logs at: ${LOG_DIR}"
        return 1
    fi
    
    print_success "npm install completed successfully (no suspicious activity)"
}

# Traced npm build
traced_npm_build() {
    local dir=$1
    local name=$2
    
    print_header "Traced npm build: $name"
    
    cd "$dir"
    
    # Start monitoring
    start_network_monitor
    start_process_monitor
    
    # Run build with tracing
    print_info "Running npm run build with tracing..."
    
    export NODE_OPTIONS="--require /var/www/simcam/photo/trace-preload.js"
    export TRACE_LOG_DIR="${LOG_DIR}"
    export TRACE_MAX_SNIP=2000
    
    if [[ "$STRACE_AVAILABLE" == true ]]; then
        sudo strace -f -e trace=execve,clone,fork,vfork,connect,socket -s 1000 \
            -o "${SYSCALL_LOG}" \
            npm run build 2>&1 | tee -a "${BUILD_LOG}"
    else
        npm run build 2>&1 | tee -a "${BUILD_LOG}"
    fi
    
    # Stop monitoring
    stop_network_monitor
    stop_process_monitor
    
    # Scan for suspicious activity
    scan_for_suspicious_activity "${BUILD_LOG}"
    local scan_result=$?
    
    if [[ $scan_result -ne 0 ]]; then
        print_error "npm build completed but suspicious activity detected!"
        print_error "DO NOT PROCEED - Review logs at: ${LOG_DIR}"
        return 1
    fi
    
    print_success "npm build completed successfully (no suspicious activity)"
}

# Check for malicious files after install
check_for_malicious_files() {
    local dir=$1
    local name=$2
    
    print_header "Checking for malicious files: $name"
    
    cd "$dir"
    
    # Check for suspicious binaries
    print_info "Scanning for suspicious binaries..."
    
    local suspicious_files=()
    
    # Check for binaries with suspicious names
    while IFS= read -r -d '' file; do
        filename=$(basename "$file")
        if [[ "$filename" =~ linuxsys|pulseadio|x86_64\.kok|miner|xmrig ]]; then
            suspicious_files+=("$file")
            print_alert "Suspicious file found: $file"
        fi
    done < <(find node_modules -type f -executable -print0 2>/dev/null)
    
    # Check for shell scripts that download from internet
    print_info "Scanning for download scripts..."
    while IFS= read -r file; do
        for pattern in "${SUSPICIOUS_PATTERNS[@]}"; do
            if grep -qiE "$pattern" "$file" 2>/dev/null; then
                suspicious_files+=("$file")
                print_alert "Suspicious script found: $file"
                print_alert "Contains pattern: $pattern"
                break
            fi
        done
    done < <(find node_modules -name "*.sh" -o -name "install.js" -o -name "postinstall.js" 2>/dev/null)
    
    if [[ ${#suspicious_files[@]} -gt 0 ]]; then
        print_error "⚠️⚠️⚠️ MALICIOUS FILES DETECTED ⚠️⚠️⚠️"
        print_error "Found ${#suspicious_files[@]} suspicious files"
        for file in "${suspicious_files[@]}"; do
            echo "MALICIOUS FILE: $file" >> "${ALERT_LOG}"
        done
        return 1
    else
        print_success "No malicious files detected"
        return 0
    fi
}

###############################################################################
# Main Installation Functions
###############################################################################

install_simcam() {
    print_header "Installing SIMCAM (Next.js App)"
    
    local SIMCAM_DIR="/var/www/simcam/photo/simcam"
    
    traced_npm_install "$SIMCAM_DIR" "simcam" || return 1
    check_for_malicious_files "$SIMCAM_DIR" "simcam" || return 1
    traced_npm_build "$SIMCAM_DIR" "simcam" || return 1
    
    print_success "✅ SIMCAM installation complete and verified"
}

install_webhook_server() {
    print_header "Installing WEBHOOK SERVER"
    
    local WEBHOOK_DIR="/var/www/simcam/photo/webhook_server"
    
    traced_npm_install "$WEBHOOK_DIR" "webhook_server" || return 1
    check_for_malicious_files "$WEBHOOK_DIR" "webhook_server" || return 1
    
    print_success "✅ WEBHOOK SERVER installation complete and verified"
}

install_mongo_backup() {
    print_header "Installing MONGO BACKUP"
    
    local BACKUP_DIR="/var/www/simcam/photo/mongo-backup"
    
    traced_npm_install "$BACKUP_DIR" "mongo-backup" || return 1
    check_for_malicious_files "$BACKUP_DIR" "mongo-backup" || return 1
    
    print_success "✅ MONGO BACKUP installation complete and verified"
}

###############################################################################
# Main Script
###############################################################################

main() {
    print_header "🔒 SECURITY-TRACED NPM INSTALLATION"
    
    setup_logging
    check_prerequisites
    
    local target="${1:-all}"
    
    case "$target" in
        simcam)
            install_simcam
            ;;
        webhook_server|webhook)
            install_webhook_server
            ;;
        mongo-backup|backup)
            install_mongo_backup
            ;;
        all)
            install_simcam || exit 1
            echo ""
            install_webhook_server || exit 1
            echo ""
            install_mongo_backup || exit 1
            ;;
        *)
            print_error "Unknown target: $target"
            echo ""
            echo "Usage: $0 [simcam|webhook_server|mongo-backup|all]"
            exit 1
            ;;
    esac
    
    print_header "🎉 INSTALLATION COMPLETE"
    print_success "All logs saved to: ${LOG_DIR}"
    print_info "Review security logs:"
    echo "  - Alerts: ${ALERT_LOG}"
    echo "  - Install: ${INSTALL_LOG}"
    echo "  - Network: ${NETWORK_LOG}"
    echo "  - Processes: ${PROCESS_LOG}"
    
    if [[ -f "${ALERT_LOG}" ]] && [[ -s "${ALERT_LOG}" ]]; then
        print_warning "⚠️ ALERTS WERE GENERATED - REVIEW IMMEDIATELY"
        echo ""
        cat "${ALERT_LOG}"
    fi
}

# Cleanup on exit
cleanup() {
    stop_network_monitor
    stop_process_monitor
}

trap cleanup EXIT

# Run main
main "$@"
