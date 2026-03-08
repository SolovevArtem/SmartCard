module.exports = {
  apps: [{
    name: 'smartcard-backend',
    script: 'server.js',
    instances: 2,
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production'
    }
  }]
};
