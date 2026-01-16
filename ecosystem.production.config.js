/**
 * PM2 Ecosystem Configuration - Production
 * 
 * This is a bulletproof PM2 configuration with:
 * - Memory limits to prevent OOM kills
 * - Restart throttling to prevent infinite loops
 * - Proper error handling and logging
 * - Health monitoring integration
 * - Auto-restart on crashes
 * 
 * Usage:
 *   pm2 start ecosystem.production.config.js
 *   pm2 save
 *   pm2 startup
 */

module.exports = {
  apps: [
    {
      // ==========================================
      // SIMCAM - Next.js Application (Port 3000)
      // ==========================================
      name: 'simcam',
      cwd: '/var/www/simcam/photo/simcam',
      
      // Start command
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      
      // Node.js options
      node_args: [
        '--require', '/var/www/simcam/photo/trace-child-process.js',
        '--max-old-space-size=1024',        // Limit heap to 1GB
        '--max-http-header-size=16384'      // Increase header size for large cookies
      ],
      
      // Process options
      instances: 1,                          // Single instance (not cluster)
      exec_mode: 'fork',                     // Fork mode for Next.js
      
      // Memory management
      max_memory_restart: '1G',              // Restart if exceeds 1GB
      
      // Restart behavior
      autorestart: true,                     // Auto-restart on crash
      max_restarts: 10,                      // Max 10 restarts in min_uptime window
      min_uptime: '10s',                     // Must stay up 10s to be considered started
      restart_delay: 4000,                   // Wait 4s between restarts
      
      // Timeouts
      listen_timeout: 10000,                 // Wait 10s for app to be ready
      kill_timeout: 5000,                    // Wait 5s before force kill
      
      // Environment variables
      env: {
        NODE_ENV: "production",
        TRACE_LOG_DIR: "/var/log/simcam-trace",
        TRACE_MAX_SNIP: "900",
        NODE_OPTIONS: "--require /var/www/simcam/photo/trace-preload.js"
      },
      
      // Logging
      error_file: '/home/dev1/.pm2/logs/simcam-error.log',
      out_file: '/home/dev1/.pm2/logs/simcam-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,                      // Merge cluster logs
      
      // Advanced options
      watch: false,                          // Don't watch files in production
      ignore_watch: ['node_modules', '.next', 'logs'],
      watch_delay: 1000,
      
      // Source maps for better error traces
      source_map_support: true,
      
      // Crash handling
      exp_backoff_restart_delay: 100,       // Exponential backoff
      
      // Interpreter
      interpreter: 'node',
      interpreter_args: '',
      
      // Instance variables (available in code via process.env)
      instance_var: 'INSTANCE_ID',
      
      // Cron restart (optional - restart at 3am daily)
      // cron_restart: '0 3 * * *',
      
      // Force restart if not responding
      // force: true,
    },

    {
      // ==========================================
      // HEALTH CHECKER - Monitors app health
      // ==========================================
      name: 'health-checker',
      cwd: '/var/www/simcam/photo/health-checker',
      
      script: 'index.js',
      
      // Process options
      instances: 1,
      exec_mode: 'fork',
      
      // Memory management
      max_memory_restart: '200M',            // Should use minimal memory
      
      // Restart behavior
      autorestart: true,
      max_restarts: 50,                      // Allow more restarts (it monitors)
      min_uptime: '5s',
      restart_delay: 3000,
      
      // Environment
      env: {
        NODE_ENV: 'production',
      },
      
      // Logging
      error_file: '/home/dev1/.pm2/logs/health-checker-error.log',
      out_file: '/home/dev1/.pm2/logs/health-checker-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Options
      watch: false,
      
      // Lower priority
      // nice: 10,
    },

    {
      // ==========================================
      // WEBHOOK SERVER - Handles API webhooks (Port 4000)
      // ==========================================
      name: 'webhook_server',
      cwd: '/var/www/simcam/photo/webhook_server',
      
      script: 'server.js',
      
      // Node.js options
      node_args: '--max-old-space-size=512', // 512MB heap
      
      // Process options
      instances: 1,
      exec_mode: 'fork',
      
      // Memory management
      max_memory_restart: '500M',
      
      // Restart behavior
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000,
      
      // Timeouts
      listen_timeout: 10000,
      kill_timeout: 5000,
      
      // Environment
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
      
      // Logging
      error_file: '/home/dev1/.pm2/logs/webhook-server-error.log',
      out_file: '/home/dev1/.pm2/logs/webhook-server-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Options
      watch: false,
    },

    {
      // ==========================================
      // MONGO BACKUP - Database backup service
      // ==========================================
      name: 'mongo-backup',
      cwd: '/var/www/simcam/photo/mongo-backup',
      
      script: 'backup.js',
      
      // Node.js options
      node_args: '--max-old-space-size=256',
      
      // Process options
      instances: 1,
      exec_mode: 'fork',
      
      // Memory management
      max_memory_restart: '300M',
      
      // Restart behavior
      autorestart: true,
      max_restarts: 5,                       // Fewer restarts (backup task)
      min_uptime: '10s',
      restart_delay: 5000,
      
      // Environment
      env: {
        NODE_ENV: 'production',
      },
      
      // Logging
      error_file: '/home/dev1/.pm2/logs/mongo-backup-error.log',
      out_file: '/home/dev1/.pm2/logs/mongo-backup-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Options
      watch: false,
      
      // Cron restart daily at 2am (after backup completes)
      // cron_restart: '0 2 * * *',
    }
  ],

  /**
   * Deployment configuration (optional)
   * Allows deployment via PM2
   */
  deploy: {
    production: {
      user: 'dev1',
      host: '185.252.233.149',
      ref: 'origin/main',
      repo: 'https://github.com/Photorex/photocam.git',
      path: '/var/www/simcam/photo',
      
      'post-deploy': 
        'cd simcam && npm install && npm run build && pm2 reload ecosystem.production.config.js --env production',
      
      'pre-setup': '',
      'post-setup': 'npm install',
      
      env: {
        NODE_ENV: 'production'
      }
    }
  }
};

