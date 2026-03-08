const Sentry = require('@sentry/node');
const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const AWS = require('aws-sdk');
const { Pool } = require('pg');
const cron = require('node-cron');
const rateLimit = require('express-rate-limit');

// ===== SENTRY =====
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development'
});

const app = express();
const PORT = process.env.PORT || 3001;

// ===== DATABASE SETUP =====
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection error:', err);
  } else {
    console.log('✅ Database connected:', res.rows[0].now);
  }
});

// ===== MIGRATIONS =====
async function runMigrations() {
  console.log('[migrations] Running startup migrations...');
  try {
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_cards_status ON cards(status)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_cards_created ON cards(created_at)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_cards_batch ON cards(batch_id)`);
    await pool.query(`ALTER TABLE cards ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0`);
    await pool.query(`ALTER TABLE cards ADD COLUMN IF NOT EXISTS last_viewed_at TIMESTAMP`);
    await pool.query(`ALTER TABLE cards ADD COLUMN IF NOT EXISTS channel VARCHAR(50)`);
    console.log('[migrations] Done.');
  } catch (err) {
    console.error('[migrations] Error:', err.message);
  }
}

// ===== MIDDLEWARE =====
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT'],
  allowedHeaders: ['Content-Type', 'X-Admin-Key']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== RATE LIMITERS =====
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many upload requests, please try again later.' }
});

const viewLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later.' }
});

const adminLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many admin requests, please try again later.' }
});

// ===== ADMIN AUTH =====
function requireAdminKey(req, res, next) {
  const key = req.headers['x-admin-key'];
  if (!process.env.ADMIN_SECRET || key !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ success: false, error: 'Forbidden' });
  }
  next();
}

// ===== S3 SETUP =====
const s3 = new AWS.S3({
  endpoint: process.env.S3_ENDPOINT,
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_KEY,
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
  region: process.env.S3_REGION || 'auto'
});

console.log('📦 Using S3 storage:', process.env.S3_ENDPOINT);
console.log('📦 Bucket:', process.env.S3_BUCKET);

// ===== MULTER SETUP FOR S3 =====
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET,
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    cacheControl: 'public, max-age=31536000',
    key: (req, file, cb) => {
      const cardId = req.params.cardId;
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const filename = `${cardId}/${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`;
      cb(null, filename);
    }
  }),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'video') {
      if (file.mimetype.startsWith('video/')) {
        cb(null, true);
      } else {
        cb(new Error('Только видео файлы разрешены'));
      }
    } else if (file.fieldname === 'photos') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Только изображения разрешены'));
      }
    } else {
      cb(null, true);
    }
  }
});

// ===== HELPER FUNCTIONS =====

function generateCardId() {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

async function getCardData(cardId) {
  const result = await pool.query('SELECT * FROM cards WHERE id = $1', [cardId]);
  return result.rows[0] || null;
}

async function saveCardData(cardId, data) {
  const {
    status,
    sender_name,
    message,
    video_url,
    photos_urls,
    batch_id,
    batch_name,
    is_demo,
    storage_type,
    activated_at,
    filled_at
  } = data;

  await pool.query(`
    INSERT INTO cards (
      id, status, sender_name, message, video_url, photos_urls,
      batch_id, batch_name, is_demo, storage_type, activated_at, filled_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    ON CONFLICT (id)
    DO UPDATE SET
      status = $2,
      sender_name = $3,
      message = $4,
      video_url = $5,
      photos_urls = $6,
      batch_id = $7,
      batch_name = $8,
      is_demo = $9,
      storage_type = $10,
      activated_at = $11,
      filled_at = $12,
      updated_at = NOW()
  `, [
    cardId, status, sender_name, message, video_url,
    photos_urls, batch_id, batch_name, is_demo, storage_type,
    activated_at, filled_at
  ]);
}

// ===== ADMIN ENDPOINTS =====

// Генерация партии карточек
app.post('/api/admin/generate-cards', adminLimiter, requireAdminKey, async (req, res) => {
  try {
    const { count = 1, batchName } = req.body;

    if (count > 500) {
      return res.status(400).json({
        success: false,
        error: 'Максимум 500 карточек за раз'
      });
    }

    const cards = [];
    const batchId = Date.now().toString();

    const frontendUrl = process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`;

    for (let i = 0; i < count; i++) {
      const cardId = generateCardId();
      const cardData = {
        status: 'new',
        batch_id: batchId,
        batch_name: batchName || `Партия ${batchId}`,
        storage_type: 's3',
        is_demo: false,
        sender_name: null,
        message: null,
        video_url: null,
        photos_urls: null,
        activated_at: null,
        filled_at: null
      };

      await saveCardData(cardId, cardData);

      cards.push({
        id: cardId,
        url: `/c/${cardId}`,
        qrUrl: `${frontendUrl}/c/${cardId}`,
        nfcUrl: `${frontendUrl}/c/${cardId}`
      });
    }

    res.json({
      success: true,
      batchId: batchId,
      count: cards.length,
      storageType: 's3',
      cards: cards
    });
  } catch (error) {
    console.error('Error generating cards:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Экспорт карточек в CSV
app.get('/api/admin/export-cards', adminLimiter, requireAdminKey, async (req, res) => {
  try {
    const { batchId } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(5000, Math.max(1, parseInt(req.query.limit) || 1000));
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM cards';
    const params = [];

    if (batchId) {
      query += ' WHERE batch_id = $1';
      params.push(batchId);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    const cards = result.rows;

    const frontendUrl = process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`;

    let csv = 'ID,URL,Status,Batch,Storage,Created\n';
    cards.forEach(card => {
      const url = `${frontendUrl}/c/${card.id}`;
      csv += `${card.id},${url},${card.status},${card.batch_name || ''},${card.storage_type || 's3'},${card.created_at}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=cards-export.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting cards:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== PUBLIC ENDPOINTS =====

// Получение карточки (с автоактивацией и подсчётом просмотров)
app.get('/api/cards/:cardId', viewLimiter, async (req, res) => {
  try {
    const { cardId } = req.params;
    let cardData = await getCardData(cardId);

    if (!cardData) {
      return res.status(404).json({
        success: false,
        error: 'Карточка не найдена',
        code: 'NOT_FOUND'
      });
    }

    // Автоактивация при первом сканировании
    if (cardData.status === 'new') {
      cardData.status = 'active';
      cardData.activated_at = new Date().toISOString();
      await saveCardData(cardId, cardData);
    }

    // Трекинг просмотров
    await pool.query(
      'UPDATE cards SET view_count = view_count + 1, last_viewed_at = NOW() WHERE id = $1',
      [cardId]
    );

    res.json({
      success: true,
      card: cardData
    });
  } catch (error) {
    console.error('Error fetching card:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Получение presigned URLs для загрузки напрямую в S3
app.get('/api/cards/:cardId/upload-url', uploadLimiter, async (req, res) => {
  try {
    const { cardId } = req.params;
    const cardData = await getCardData(cardId);

    if (!cardData) {
      return res.status(404).json({ success: false, error: 'Карточка не найдена' });
    }

    if (cardData.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'Карточка не активна',
        code: 'NOT_ACTIVE'
      });
    }

    const TTL = 600; // 10 minutes
    const bucket = process.env.S3_BUCKET;
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);

    const videoKey = `${cardId}/video-${uniqueSuffix}.mp4`;
    const videoUploadUrl = await s3.getSignedUrlPromise('putObject', {
      Bucket: bucket,
      Key: videoKey,
      Expires: TTL,
      ContentType: 'video/*',
      ACL: 'public-read'
    });

    const photoUploadUrls = await Promise.all(
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) =>
        s3.getSignedUrlPromise('putObject', {
          Bucket: bucket,
          Key: `${cardId}/photo-${uniqueSuffix}-${i}.jpg`,
          Expires: TTL,
          ContentType: 'image/*',
          ACL: 'public-read'
        })
      )
    );

    res.json({
      success: true,
      videoUploadUrl,
      videoKey,
      photoUploadUrls,
      photoKeys: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(
        (i) => `${cardId}/photo-${uniqueSuffix}-${i}.jpg`
      )
    });
  } catch (error) {
    console.error('Error generating presigned URLs:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Подтверждение загрузки через presigned URLs
app.post('/api/cards/:cardId/confirm-upload', uploadLimiter, async (req, res) => {
  try {
    const { cardId } = req.params;
    const { message, senderName, videoUrl, photoUrls = [] } = req.body;

    const cardData = await getCardData(cardId);

    if (!cardData) {
      return res.status(404).json({ success: false, error: 'Карточка не найдена' });
    }

    if (cardData.status === 'new') {
      return res.status(400).json({
        success: false,
        error: 'Карточка еще не активирована',
        code: 'NOT_ACTIVATED'
      });
    }

    if (cardData.status === 'filled') {
      return res.status(400).json({
        success: false,
        error: 'Карточка уже заполнена',
        code: 'ALREADY_FILLED'
      });
    }

    const updatedData = {
      ...cardData,
      status: 'filled',
      message: message || '',
      sender_name: senderName || '',
      video_url: videoUrl || '',
      photos_urls: photoUrls,
      filled_at: new Date().toISOString()
    };

    await saveCardData(cardId, updatedData);

    res.json({ success: true, card: updatedData });
  } catch (error) {
    console.error('Error confirming upload:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Загрузка контента на карточку (fallback multer upload)
app.post('/api/cards/:cardId/upload',
  uploadLimiter,
  upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'photos', maxCount: 10 }
  ]),
  async (req, res) => {
    try {
      const { cardId } = req.params;
      const { message, senderName } = req.body;

      const cardData = await getCardData(cardId);

      if (!cardData) {
        return res.status(404).json({
          success: false,
          error: 'Карточка не найдена'
        });
      }

      if (cardData.status === 'new') {
        return res.status(400).json({
          success: false,
          error: 'Карточка еще не активирована',
          code: 'NOT_ACTIVATED'
        });
      }

      if (cardData.status === 'filled') {
        return res.status(400).json({
          success: false,
          error: 'Карточка уже заполнена',
          code: 'ALREADY_FILLED'
        });
      }

      const videoFile = req.files.video ? req.files.video[0] : null;
      const photoFiles = req.files.photos || [];

      const videoUrl = videoFile ? videoFile.location : '';
      const photoUrls = photoFiles.map(f => f.location);

      const updatedData = {
        ...cardData,
        status: 'filled',
        message: message || '',
        sender_name: senderName || '',
        video_url: videoUrl,
        photos_urls: photoUrls,
        filled_at: new Date().toISOString()
      };

      await saveCardData(cardId, updatedData);

      res.json({
        success: true,
        card: updatedData
      });
    } catch (error) {
      console.error('Error uploading content:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Статистика
app.get('/api/stats', async (req, res) => {
  try {
    const mainResult = await pool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'new') as new,
        COUNT(*) FILTER (WHERE status = 'active') as active,
        COUNT(*) FILTER (WHERE status = 'filled') as filled,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 day') as today,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as this_week,
        COALESCE(SUM(view_count), 0) as total_views
      FROM cards
    `);

    const channelResult = await pool.query(`
      SELECT COALESCE(channel, 'unknown') as channel, COUNT(*) as count
      FROM cards
      GROUP BY channel
    `);

    const by_channel = {};
    channelResult.rows.forEach(row => {
      by_channel[row.channel] = parseInt(row.count);
    });

    const stats = mainResult.rows[0];

    res.json({
      success: true,
      stats: {
        total: parseInt(stats.total),
        new: parseInt(stats.new),
        active: parseInt(stats.active),
        filled: parseInt(stats.filled),
        today: parseInt(stats.today),
        this_week: parseInt(stats.this_week),
        total_views: parseInt(stats.total_views),
        by_channel,
        storageType: 's3'
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Демо создание карточки
app.post('/api/cards/create', async (req, res) => {
  try {
    const cardId = generateCardId();
    const cardData = {
      status: 'new',
      is_demo: true,
      storage_type: 's3',
      batch_id: null,
      batch_name: 'Demo',
      sender_name: null,
      message: null,
      video_url: null,
      photos_urls: null,
      activated_at: null,
      filled_at: null
    };

    await saveCardData(cardId, cardData);

    res.json({
      success: true,
      cardId: cardId,
      url: `/c/${cardId}`
    });
  } catch (error) {
    console.error('Error creating card:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Админ-панель
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Health check
app.get('/health', async (req, res) => {
  const db = await pool.query('SELECT 1').then(() => 'ok').catch(() => 'error');
  res.json({ status: 'ok', db, timestamp: new Date().toISOString() });
});

// Корневой путь
app.get('/', (req, res) => {
  res.json({
    message: 'ВидеоМиг Backend API',
    version: '1.0.0',
    endpoints: {
      stats: '/api/stats',
      admin: '/admin',
      health: '/health',
      createCard: 'POST /api/cards/create',
      getCard: 'GET /api/cards/:cardId',
      uploadUrl: 'GET /api/cards/:cardId/upload-url',
      confirmUpload: 'POST /api/cards/:cardId/confirm-upload',
      uploadContent: 'POST /api/cards/:cardId/upload'
    }
  });
});

// ===== AUTOMATIC CLEANUP =====

const CLEANUP_DAYS = parseInt(process.env.CLEANUP_DAYS || '90', 10);

async function deleteS3File(url) {
  if (!url) return;
  try {
    const urlObj = new URL(url);
    const parts = urlObj.pathname.split('/').filter(Boolean);
    const key = parts.slice(1).join('/');
    if (!key) return;
    await s3.deleteObject({ Bucket: process.env.S3_BUCKET, Key: key }).promise();
  } catch (err) {
    console.error('[cleanup] S3 delete error:', url, err.message);
  }
}

async function runCleanup() {
  console.log(`[cleanup] Running — deleting cards older than ${CLEANUP_DAYS} days`);
  try {
    const { rows } = await pool.query(`
      SELECT id, video_url, photos_urls
      FROM cards
      WHERE is_demo = false
        AND status = 'filled'
        AND filled_at < NOW() - INTERVAL '${CLEANUP_DAYS} days'
    `);

    console.log(`[cleanup] ${rows.length} card(s) to delete`);

    for (const card of rows) {
      if (card.video_url) await deleteS3File(card.video_url);
      for (const photoUrl of (card.photos_urls || [])) {
        await deleteS3File(photoUrl);
      }
      await pool.query('DELETE FROM cards WHERE id = $1', [card.id]);
      console.log(`[cleanup] Deleted card ${card.id}`);
    }

    console.log('[cleanup] Done.');
  } catch (err) {
    console.error('[cleanup] Unexpected error:', err);
  }
}

// Run daily at 03:00 AM server time
cron.schedule('0 3 * * *', runCleanup);

// ===== SENTRY ERROR HANDLER =====
Sentry.setupExpressErrorHandler(app);

// Generic error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// ===== STARTUP =====
async function start() {
  await runMigrations();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 ВидеоМиг Backend запущен на порту ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`💾 Storage: S3`);
    console.log(`🗄️ Database: PostgreSQL`);
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing database connection...');
  await pool.end();
  process.exit(0);
});
