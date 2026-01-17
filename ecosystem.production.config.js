/**
 * PM2 Ecosystem Configuration - Minimal
 * 
 * PM2 only job: Keep processes alive FOREVER
 * Health-checker handles smart monitoring and restarts
 * Logs persist for debugging even after crashes
 * 
 * Usage:
 *   pm2 start ecosystem.production.config.js
 *   pm2 save
 */

module.exports = {
  apps: [
    {
      // SIMCAM - Next.js Application (Port 3000)
      name: 'simcam',
      cwd: '/var/www/simcam/photo/simcam',
      script: 'npm',
      args: 'start',
      
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NODE_OPTIONS: '--max-old-space-size=512'  // Reduced from 768 to 512MB
      },
      
      autorestart: true,                    // Always restart on crash
      kill_timeout: 5000,                   // Force kill after 5s if not graceful
      max_memory_restart: '600M',           // Safety valve: restart before crash
      
      error_file: '/home/dev1/.pm2/logs/simcam-error.log',
      out_file: '/home/dev1/.pm2/logs/simcam-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },

    {
      // HEALTH CHECKER - Monitors app health and restarts when unresponsive
      name: 'health-checker',
      cwd: '/var/www/simcam/photo/health-checker',
      script: 'index.js',
      
      env: {
        NODE_ENV: 'production',
      },
      
      autorestart: true,
      
      error_file: '/home/dev1/.pm2/logs/health-checker-error.log',
      out_file: '/home/dev1/.pm2/logs/health-checker-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },

    {
      // WEBHOOK SERVER - Handles API webhooks (Port 4000)
      name: 'webhook_server',
      cwd: '/var/www/simcam/photo/webhook_server',
      script: 'server.js',
      
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
      
      autorestart: true,
      
      error_file: '/home/dev1/.pm2/logs/webhook-server-error.log',
      out_file: '/home/dev1/.pm2/logs/webhook-server-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },

    {
      // MONGO BACKUP - Database backup service
      name: 'mongo-backup',
      cwd: '/var/www/simcam/photo/mongo-backup',
      script: 'backup.js',
      
      env: {
        NODE_ENV: 'production',
      },
      
      autorestart: true,
      
      error_file: '/home/dev1/.pm2/logs/mongo-backup-error.log',
      out_file: '/home/dev1/.pm2/logs/mongo-backup-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    }
  ]
};

