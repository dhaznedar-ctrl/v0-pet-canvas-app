// PM2 Ecosystem Configuration for Hostinger VPS
// Usage: pm2 start ecosystem.config.js

module.exports = {
  apps: [
    {
      name: 'petcanvas',
      script: 'server.js',
      cwd: '/var/www/petcanvas',
      instances: 2,
      exec_mode: 'cluster',
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '/var/log/pm2/petcanvas-error.log',
      out_file: '/var/log/pm2/petcanvas-out.log',
      merge_logs: true,
      time: true,
      watch: false,
      max_restarts: 10,
      restart_delay: 5000,
    },
  ],
}
