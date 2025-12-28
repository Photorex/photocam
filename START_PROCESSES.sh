#!/bin/bash
###############################################################################
# START_PROCESSES.sh
# 
# Bulletproof script to start all PM2 processes for simcam application
# 
# Usage:
#   ./START_PROCESSES.sh              # Start all processes
#   ./START_PROCESSES.sh simcam       # Start only simcam
#   ./START_PROCESSES.sh health       # Start only health-checker
#   ./START_PROCESSES.sh webhook      # Start only webhook_server
#   ./START_PROCESSES.sh backup       # Start only mongo-backup
#
# Author: Simcam DevOps
# Date: December 28, 2025
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="/var/www/simcam/photo"
SIMCAM_DIR="${PROJECT_ROOT}/simcam"
HEALTH_DIR="${PROJECT_ROOT}/health-checker"
WEBHOOK_DIR="${PROJECT_ROOT}/webhook_server"
BACKUP_DIR="${PROJECT_ROOT}/mongo-backup"

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

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

check_pm2() {
    if ! command -v pm2 &> /dev/null; then
        print_error "PM2 is not installed!"
        echo "Install it with: npm install -g pm2"
        exit 1
    fi
    print_success "PM2 is installed"
}

check_directory() {
    local dir=$1
    local name=$2
    if [ ! -d "$dir" ]; then
        print_error "Directory not found: $dir"
        return 1
    fi
    print_success "$name directory exists"
    return 0
}

check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        print_warning "Port $port is already in use"
        return 1
    fi
    print_success "Port $port is available"
    return 0
}

wait_for_process() {
    local process_name=$1
    local max_wait=30
    local waited=0
    
    print_info "Waiting for $process_name to start..."
    
    while [ $waited -lt $max_wait ]; do
        if pm2 describe "$process_name" 2>/dev/null | grep -q "online"; then
            print_success "$process_name is online"
            return 0
        fi
        sleep 1
        waited=$((waited + 1))
    done
    
    print_error "$process_name failed to start after ${max_wait}s"
    return 1
}

###############################################################################
# Process Start Functions
###############################################################################

start_simcam() {
    print_header "Starting Simcam (Next.js App)"
    
    if ! check_directory "$SIMCAM_DIR" "Simcam"; then
        return 1
    fi
    
    # Check if already running
    if pm2 describe simcam &>/dev/null; then
        print_warning "Simcam is already registered in PM2"
        read -p "Do you want to restart it? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            pm2 restart simcam
            print_success "Simcam restarted"
        fi
        return 0
    fi
    
    check_port 3000
    
    cd "$SIMCAM_DIR"
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_warning "node_modules not found, running npm install..."
        npm install
    fi
    
    # Check if .next build exists
    if [ ! -d ".next" ]; then
        print_warning ".next build not found, running npm run build..."
        npm run build
    fi
    
    # Start process
    print_info "Starting simcam process..."
    pm2 start npm \
        --name "simcam" \
        --max-memory-restart 1G \
        --node-args="--max-old-space-size=1024" \
        -- start
    
    wait_for_process "simcam"
    
    # Test endpoint
    sleep 2
    if curl -f http://localhost:3000/api/status/test &>/dev/null; then
        print_success "Simcam is responding on port 3000"
    else
        print_warning "Simcam is running but not responding yet"
    fi
}

start_health_checker() {
    print_header "Starting Health Checker"
    
    if ! check_directory "$HEALTH_DIR" "Health Checker"; then
        return 1
    fi
    
    # Check if already running
    if pm2 describe health-checker &>/dev/null; then
        print_warning "Health Checker is already registered in PM2"
        read -p "Do you want to restart it? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            pm2 restart health-checker
            print_success "Health Checker restarted"
        fi
        return 0
    fi
    
    cd "$HEALTH_DIR"
    
    # Start process
    print_info "Starting health-checker process..."
    pm2 start index.js \
        --name "health-checker" \
        --max-memory-restart 200M
    
    wait_for_process "health-checker"
}

start_webhook_server() {
    print_header "Starting Webhook Server"
    
    if ! check_directory "$WEBHOOK_DIR" "Webhook Server"; then
        return 1
    fi
    
    # Check if already running
    if pm2 describe webhook_server &>/dev/null; then
        print_warning "Webhook Server is already registered in PM2"
        read -p "Do you want to restart it? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            pm2 restart webhook_server
            print_success "Webhook Server restarted"
        fi
        return 0
    fi
    
    check_port 4000
    
    cd "$WEBHOOK_DIR"
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_warning "node_modules not found, running npm install..."
        npm install
    fi
    
    # Start process
    print_info "Starting webhook_server process..."
    pm2 start server.js \
        --name "webhook_server" \
        --max-memory-restart 500M
    
    wait_for_process "webhook_server"
    
    # Test endpoint
    sleep 2
    if curl -f http://localhost:4000 &>/dev/null; then
        print_success "Webhook Server is responding on port 4000"
    else
        print_warning "Webhook Server is running but not responding yet"
    fi
}

start_mongo_backup() {
    print_header "Starting Mongo Backup"
    
    if ! check_directory "$BACKUP_DIR" "Mongo Backup"; then
        return 1
    fi
    
    # Check if already running
    if pm2 describe mongo-backup &>/dev/null; then
        print_warning "Mongo Backup is already registered in PM2"
        read -p "Do you want to restart it? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            pm2 restart mongo-backup
            print_success "Mongo Backup restarted"
        fi
        return 0
    fi
    
    cd "$BACKUP_DIR"
    
    # Start process
    print_info "Starting mongo-backup process..."
    pm2 start backup.js \
        --name "mongo-backup" \
        --max-memory-restart 300M
    
    wait_for_process "mongo-backup"
}

###############################################################################
# Main Script
###############################################################################

main() {
    print_header "PM2 Process Startup Script"
    
    # Check prerequisites
    check_pm2
    
    # Determine what to start
    local target="${1:-all}"
    
    case "$target" in
        simcam)
            start_simcam
            ;;
        health|health-checker)
            start_health_checker
            ;;
        webhook|webhook_server)
            start_webhook_server
            ;;
        backup|mongo-backup)
            start_mongo_backup
            ;;
        all)
            start_simcam
            echo ""
            start_health_checker
            echo ""
            start_webhook_server
            echo ""
            start_mongo_backup
            ;;
        *)
            print_error "Unknown target: $target"
            echo ""
            echo "Usage: $0 [simcam|health|webhook|backup|all]"
            exit 1
            ;;
    esac
    
    echo ""
    print_header "Process Status"
    pm2 list
    
    echo ""
    print_info "To save this configuration: pm2 save"
    print_info "To setup auto-start on boot: pm2 startup"
    print_info "To view logs: pm2 logs"
    print_info "To monitor: pm2 monit"
    
    echo ""
    print_success "Startup complete!"
}

# Run main function
main "$@"

