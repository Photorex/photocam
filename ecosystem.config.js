module.exports = {
    apps: [
      {
        name: 'simcam',
        cwd: '/var/www/simcam/photo/simcam',
        script: 'start-with-heap.sh',
        interpreter: 'bash',
        instances: 1,
        exec_mode: 'fork',
        max_memory_restart: '4G', // Restart if memory exceeds 4GB
        env: {
          NODE_ENV: 'production',
          PORT: 3000
        },
        error_file: '/home/dev2/.pm2/logs/simcam-error.log',
        out_file: '/home/dev2/.pm2/logs/simcam-out.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
        autorestart: true,
        watch: false,
        max_restarts: 1000000, // Bulletproof restart policy
        min_uptime: '1s',
        restart_delay: 1000,
        exp_backoff_restart_delay: 100,
        listen_timeout: 10000,
        kill_timeout: 5000
      },
      {
        name: 'health-checker',
        cwd: '/var/www/simcam/photo/health-checker',
        script: 'index.js',
        interpreter: 'node',
        interpreter_args: '--max-old-space-size=512',
        instances: 1,
        exec_mode: 'fork',
        max_memory_restart: '512M',
        env: {
          NODE_ENV: 'production'
        },
        error_file: '/home/dev2/.pm2/logs/health-checker-error.log',
        out_file: '/home/dev2/.pm2/logs/health-checker-out.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
        autorestart: true,
        watch: false,
        max_restarts: 1000000,
        min_uptime: '1s',
        restart_delay: 500,
        exp_backoff_restart_delay: 100
      },
      {
        name: 'webhook_server',
        cwd: '/var/www/simcam/photo/webhook_server',
        script: 'server.js',
        instances: 1,
        exec_mode: 'fork',
        max_memory_restart: '1G',
        env: {
          NODE_ENV: 'production'
        },
        error_file: '/home/dev2/.pm2/logs/webhook-server-error.log',
        out_file: '/home/dev2/.pm2/logs/webhook-server-out.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
        autorestart: true,
        watch: false,
        max_restarts: 1000000,
        min_uptime: '1s',
        restart_delay: 1000,
        exp_backoff_restart_delay: 100
      },
      {
        name: 'mongo-backup',
        cwd: '/var/www/simcam/photo/mongo-backup',
        script: 'backup.js',
        instances: 1,
        exec_mode: 'fork',
        max_memory_restart: '512M',
        env: {
          NODE_ENV: 'production'
        },
        error_file: '/home/dev2/.pm2/logs/mongo-backup-error.log',
        out_file: '/home/dev2/.pm2/logs/mongo-backup-out.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
        autorestart: true,
        watch: false,
        max_restarts: 1000000,
        min_uptime: '1s',
        restart_delay: 1000,
        exp_backoff_restart_delay: 100
      }
    ]
  };
  