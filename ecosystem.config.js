require('dotenv').config({ path: '/root/diamond-plus/core/.env' });

module.exports = {
  apps: [{
    name: 'dp-core',
    script: 'npm',
    args: 'start',
    cwd: '/root/diamond-plus/core',
    env: {
      ...process.env,
      NODE_ENV: 'production',
      PORT: 3020
    },
    error_file: '/var/log/pm2/dp-core-error.log',
    out_file: '/var/log/pm2/dp-core-out.log',
    log_file: '/var/log/pm2/dp-core-combined.log',
    time: true,
    watch: false  // Next.js handles file watching
  }]
}
