# 🚀 Production Deployment Guide

## Подготовка к production

### 1. Выбор хостинга

**Backend:**
- VK Cloud (рекомендуется)
- Yandex Cloud
- Selectel
- Timeweb Cloud

**Frontend:**
- Vercel (бесплатный tier)
- Netlify
- VK Cloud Static Sites

**Хранилище файлов:**
- VK Cloud Object Storage (S3-совместимое)
- Yandex Object Storage
- Selectel Storage

**База данных:**
- PostgreSQL (рекомендуется)
- MySQL
- MongoDB

---

## 2. Настройка облачного хранилища

### VK Cloud Object Storage

```bash
# Установка AWS CLI (S3-совместимый)
pip install awscli --break-system-packages

# Настройка
aws configure
# AWS Access Key ID: [ваш ключ]
# AWS Secret Access Key: [ваш секретный ключ]
# Default region name: ru-msk
# Default output format: json
```

### Обновление backend для S3

```javascript
// Добавить в server.js
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  endpoint: process.env.S3_ENDPOINT,
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_KEY,
  s3ForcePathStyle: true,
  signatureVersion: 'v4'
});

// Функция загрузки в S3
async function uploadToS3(file, cardId) {
  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: `${cardId}/${file.filename}`,
    Body: file.buffer,
    ContentType: file.mimetype
  };
  
  return s3.upload(params).promise();
}
```

---

## 3. Настройка базы данных

### PostgreSQL Schema

```sql
CREATE TABLE cards (
  id VARCHAR(32) PRIMARY KEY,
  status VARCHAR(20) NOT NULL DEFAULT 'empty',
  sender_name VARCHAR(255),
  message TEXT,
  video_url VARCHAR(500),
  photos_urls TEXT[], -- массив ссылок
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  filled_at TIMESTAMP
);

CREATE INDEX idx_cards_status ON cards(status);
CREATE INDEX idx_cards_created ON cards(created_at);
```

### Подключение к БД (backend/db.js)

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
```

---

## 4. Environment Variables

### Backend (.env)

```bash
# Server
PORT=3001
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:password@host:5432/videomig

# S3 Storage
S3_ENDPOINT=https://hb.vkcs.cloud
S3_ACCESS_KEY=your_access_key
S3_SECRET_KEY=your_secret_key
S3_BUCKET=videomig-uploads
S3_REGION=ru-msk

# Security
JWT_SECRET=your_jwt_secret_here
CORS_ORIGIN=https://yourdomain.ru

# Payment (ЮKassa)
YUKASSA_SHOP_ID=your_shop_id
YUKASSA_SECRET_KEY=your_secret_key

# Email
SMTP_HOST=smtp.yandex.ru
SMTP_PORT=465
SMTP_USER=noreply@videomig.ru
SMTP_PASS=your_email_password
```

### Frontend (.env.production)

```bash
REACT_APP_API_URL=https://api.videomig.ru
REACT_APP_DOMAIN=https://videomig.ru
```

---

## 5. Nginx конфигурация

### /etc/nginx/sites-available/videomig

```nginx
# Backend API
server {
    listen 80;
    server_name api.videomig.ru;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        # Увеличение лимитов для загрузки файлов
        client_max_body_size 50M;
    }
}

# Frontend
server {
    listen 80;
    server_name videomig.ru www.videomig.ru;
    root /var/www/videomig/build;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Кэширование статики
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### SSL с Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d videomig.ru -d www.videomig.ru -d api.videomig.ru
```

---

## 6. PM2 для production

### Установка

```bash
npm install -g pm2
```

### ecosystem.config.js

```javascript
module.exports = {
  apps: [{
    name: 'videomig-backend',
    script: './backend/server.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

### Команды

```bash
# Запуск
pm2 start ecosystem.config.js

# Перезапуск
pm2 restart videomig-backend

# Остановка
pm2 stop videomig-backend

# Логи
pm2 logs videomig-backend

# Мониторинг
pm2 monit

# Автозапуск при перезагрузке
pm2 startup
pm2 save
```

---

## 7. CI/CD Pipeline (GitHub Actions)

### .github/workflows/deploy.yml

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/videomig
            git pull origin main
            cd backend && npm install
            pm2 restart videomig-backend

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build
        run: |
          cd frontend
          npm install
          npm run build
          
      - name: Deploy to server
        uses: appleboy/scp-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          source: "frontend/build/*"
          target: "/var/www/videomig/"
```

---

## 8. Мониторинг и логирование

### Установка Sentry для отслеживания ошибок

```bash
npm install @sentry/node --save
```

### Интеграция в backend

```javascript
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

// Error handler
app.use(Sentry.Handlers.errorHandler());
```

### Logrotate для логов

```bash
# /etc/logrotate.d/videomig
/var/www/videomig/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

---

## 9. Бэкапы

### Автоматические бэкапы БД

```bash
#!/bin/bash
# /var/www/videomig/scripts/backup.sh

BACKUP_DIR="/var/backups/videomig"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="videomig_$DATE.sql"

mkdir -p $BACKUP_DIR

pg_dump $DATABASE_URL > $BACKUP_DIR/$FILENAME
gzip $BACKUP_DIR/$FILENAME

# Удаление старых бэкапов (старше 30 дней)
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup created: $FILENAME.gz"
```

### Cron для автоматизации

```bash
# Добавить в crontab
0 3 * * * /var/www/videomig/scripts/backup.sh
```

---

## 10. Безопасность

### Checklist

- [ ] Установлен firewall (ufw)
- [ ] Настроен fail2ban
- [ ] SSL сертификаты установлены
- [ ] Секретные ключи в .env (не в git)
- [ ] Rate limiting на API
- [ ] CORS настроен правильно
- [ ] Валидация всех входных данных
- [ ] Защита от SQL injection
- [ ] Защита от XSS
- [ ] CSP заголовки настроены

### Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 5, // максимум 5 загрузок
  message: 'Слишком много запросов, попробуйте позже'
});

app.post('/api/cards/:cardId/upload', uploadLimiter, ...);
```

---

## 11. Производительность

### Кэширование

```javascript
const redis = require('redis');
const client = redis.createClient({
  url: process.env.REDIS_URL
});

// Кэширование данных карточки
async function getCardWithCache(cardId) {
  const cached = await client.get(`card:${cardId}`);
  if (cached) return JSON.parse(cached);
  
  const card = await getCardData(cardId);
  await client.setEx(`card:${cardId}`, 3600, JSON.stringify(card));
  return card;
}
```

### CDN для статики

Использовать CDN для:
- Изображений
- CSS/JS файлов
- Шрифтов

Рекомендуемые CDN:
- Cloudflare (бесплатный)
- KeyCDN
- BunnyCDN

---

## 12. Checklist перед запуском

### Backend
- [ ] Environment variables настроены
- [ ] База данных мигрирована
- [ ] S3 хранилище настроено и протестировано
- [ ] PM2 запущен и настроен автостарт
- [ ] Логи пишутся корректно
- [ ] Sentry настроен
- [ ] Rate limiting включен

### Frontend
- [ ] Build создан без ошибок
- [ ] API URL указывает на production
- [ ] Meta tags настроены (SEO)
- [ ] Favicon добавлен
- [ ] Analytics подключена
- [ ] Robots.txt настроен

### Infrastructure
- [ ] SSL сертификаты установлены
- [ ] Nginx конфигурация проверена
- [ ] Firewall настроен
- [ ] Backup скрипт работает
- [ ] Monitoring настроен
- [ ] Domain DNS настроен правильно

### Testing
- [ ] Создание карточки работает
- [ ] Загрузка видео работает
- [ ] Загрузка фото работает
- [ ] Просмотр карточки работает
- [ ] Работает на мобильных
- [ ] Работает на старых браузерах

---

## 13. Стоимость infrastructure (примерно)

**Минимальная конфигурация для старта:**

- **VPS (2 CPU, 4GB RAM):** 500₽/месяц
- **PostgreSQL:** 300₽/месяц
- **S3 хранилище (100GB):** 200₽/месяц
- **Domain:** 200₽/год
- **SSL:** Бесплатно (Let's Encrypt)
- **Backup storage:** 100₽/месяц

**Итого:** ~1,100₽/месяц

**При росте (500+ открыток/месяц):**
- VPS: 1,500₽/месяц (4 CPU, 8GB RAM)
- S3: 500₽/месяц (300GB)
- CDN: 300₽/месяц

**Итого:** ~2,500₽/месяц

---

## 14. Поддержка и мониторинг

### Uptime monitoring
- UptimeRobot (бесплатно)
- Pingdom
- Freshping

### Мониторинг метрик
- Grafana + Prometheus
- Яндекс.Метрика
- Google Analytics

### Уведомления
- Telegram bot для алертов
- Email уведомления об ошибках
- SMS для критичных событий

---

## Поддержка

При возникновении проблем с деплоем:
- Email: tech@videomig.ru
- Telegram: @videomig_support
- GitHub Issues: github.com/videomig/mvp

---

**Успешного запуска! 🚀**
