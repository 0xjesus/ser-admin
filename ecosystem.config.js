module.exports = {
  apps: [
    {
      name: 'ser-admin',
      script: 'npx',
      args: 'serve -s dist -l 1266',  // Servir la carpeta dist en el puerto 1266
      env: {
        NODE_ENV: 'production',
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M'
    }
  ]
};
