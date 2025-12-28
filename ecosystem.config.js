module.exports = {
  apps: [
    {
      name: 'simcam',
      cwd: '/var/www/simcam/photo/simcam',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '1G', // Restart if memory exceeds 1GB
      node_args: '--max-old-space-size=1024', // Limit Node.js heap to 1GB
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/home/dev1/.pm2/logs/simcam-error.log',
      out_file: '/home/dev1/.pm2/logs/simcam-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      autorestart: true,
      watch: false,
      max_restarts: 10, // Max 10 restarts within min_uptime window
      min_uptime: '10s', // Process must stay up for 10s to be considered started
      listen_timeout: 10000, // Wait 10s for app to be ready
      kill_timeout: 5000, // Wait 5s before force killing
      restart_delay: 4000 // Wait 4s between restarts
    },
    {
      name: 'health-checker',
      cwd: '/var/www/simcam/photo/health-checker',
      script: 'index.js',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '200M', // Health checker should use minimal memory
      env: {
        NODE_ENV: 'production'
      },
      error_file: '/home/dev1/.pm2/logs/health-checker-error.log',
      out_file: '/home/dev1/.pm2/logs/health-checker-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      autorestart: true,
      watch: false,
      max_restarts: 50, // Allow more restarts for health checker
      min_uptime: '5s'
    },
    {
      name: 'webhook_server',
      cwd: '/var/www/simcam/photo/webhook_server',
      script: 'server.js',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production'
      },
      error_file: '/home/dev1/.pm2/logs/webhook-server-error.log',
      out_file: '/home/dev1/.pm2/logs/webhook-server-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      name: 'mongo-backup',
      cwd: '/var/www/simcam/photo/mongo-backup',
      script: 'backup.js',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production'
      },
      error_file: '/home/dev1/.pm2/logs/mongo-backup-error.log',
      out_file: '/home/dev1/.pm2/logs/mongo-backup-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      autorestart: true,
      watch: false,
      max_restarts: 5,
      min_uptime: '10s'
    }
  ]
};

