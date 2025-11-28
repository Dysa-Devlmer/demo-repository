module.exports = {
  apps: [
    {
      name: 'chatbotdysa-backend',
      script: 'dist/main.js',
      cwd: './apps/backend',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 8005,
        DATABASE_HOST: '127.0.0.1',
        DATABASE_PORT: 15432,
        DATABASE_USER: 'postgres',
        DATABASE_PASSWORD: 'supersecret',
        DATABASE_NAME: 'chatbotdysa',
        REDIS_HOST: '127.0.0.1',
        REDIS_PORT: 16379
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 8005,
        DATABASE_HOST: '127.0.0.1',
        DATABASE_PORT: 15432,
        DATABASE_USER: 'postgres',
        DATABASE_PASSWORD: 'supersecret',
        DATABASE_NAME: 'chatbotdysa',
        REDIS_HOST: '127.0.0.1',
        REDIS_PORT: 16379,
        JWT_SECRET: 'dysabot-jwt-secret-2024-super-secure-production-key-v2',
        OLLAMA_URL: 'http://127.0.0.1:21434',
        OLLAMA_MODEL: 'llama3',
        WA_BUSINESS_PHONE_ID: '',
        WA_ACCESS_TOKEN: '',
        WA_WEBHOOK_VERIFY_TOKEN: '',
        TWILIO_ACCOUNT_SID: '',
        TWILIO_AUTH_TOKEN: '',
        TWILIO_PHONE_NUMBER: ''
      },
      // Advanced PM2 configuration
      max_memory_restart: '1G',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: '10s',
      
      // Graceful reload/restart
      kill_timeout: 5000,
      listen_timeout: 10000,
      
      // Source maps support
      source_map_support: true,
      
      // Environment variables
      env_file: '.env.production',
      
      // Monitoring
      pmx: true,
      
      // Advanced features
      increment_var: 'PORT',
      
      // Health check
      health_check_grace_period: 3000,
    },
    {
      name: 'chatbotdysa-admin',
      script: 'server.js',
      cwd: './apps/admin-panel/.next/standalone/apps/admin-panel',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: 8001,
        NEXT_PUBLIC_API_URL: 'http://localhost:8005',
        API_URL: 'http://localhost:8005'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 8001,
        NEXT_PUBLIC_API_URL: 'http://localhost:8005',
        API_URL: 'http://localhost:8005'
      },
      max_memory_restart: '500M',
      error_file: './logs/admin-err.log',
      out_file: './logs/admin-out.log',
      log_file: './logs/admin-combined.log',
      time: true,
      autorestart: true,
      watch: false,
    },
    {
      name: 'chatbotdysa-widget',
      script: 'serve',
      args: '-s dist -l 8002',
      cwd: './apps/web-widget',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: 8002,
        API_URL: 'http://localhost:8005'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 8002,
        API_URL: 'http://localhost:8005'
      },
      max_memory_restart: '200M',
      error_file: './logs/widget-err.log',
      out_file: './logs/widget-out.log',
      log_file: './logs/widget-combined.log',
      time: true,
      autorestart: true,
      watch: false,
    }
  ],

  deploy: {
    production: {
      user: 'deploy',
      host: 'your-server-ip',
      ref: 'origin/main',
      repo: 'git@github.com:your-username/chatbotdysa.git',
      path: '/var/www/chatbotdysa',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};