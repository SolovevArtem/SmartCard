const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const AWS = require('aws-sdk');
const { Pool } = require('pg');
const cron = require('node-cron');

const app = express();
const PORT = process.env.PORT || 3001;

// ===== DATABASE SETUP =====
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection error:', err);
  } else {
    console.log('✅ Database connected:', res.rows[0].now);
  }
});

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== S3 SETUP (VK Cloud или Cloudflare R2) =====
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
app.post('/api/admin/generate-cards', async (req, res) => {
  try {
    const { count = 1, batchName } = req.body;

    if (count > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Максимум 1000 карточек за раз'
      });
    }

    const cards = [];
    const batchId = Date.now().toString();
    
    // URL frontend для ссылок на карточки (ИСПРАВЛЕНО!)
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
        qrUrl: `${frontendUrl}/c/${cardId}`,    // ИСПРАВЛЕНО: теперь ведет на frontend
        nfcUrl: `${frontendUrl}/c/${cardId}`    // ИСПРАВЛЕНО: теперь ведет на frontend
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
app.get('/api/admin/export-cards', async (req, res) => {
  try {
    const { batchId } = req.query;

    let query = 'SELECT * FROM cards';
    const params = [];

    if (batchId) {
      query += ' WHERE batch_id = $1';
      params.push(batchId);
    }

    query += ' ORDER BY created_at DESC';

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

// Получение карточки (с автоактивацией)
app.get('/api/cards/:cardId', async (req, res) => {
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

    res.json({
      success: true,
      card: cardData
    });
  } catch (error) {
    console.error('Error fetching card:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Загрузка контента на карточку
app.post('/api/cards/:cardId/upload',
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

      // Видео необязательно
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
    const result = await pool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'new') as new,
        COUNT(*) FILTER (WHERE status = 'active') as active,
        COUNT(*) FILTER (WHERE status = 'filled') as filled
      FROM cards
    `);

    const stats = result.rows[0];

    res.json({
      success: true,
      stats: {
        total: parseInt(stats.total),
        new: parseInt(stats.new),
        active: parseInt(stats.active),
        filled: parseInt(stats.filled),
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
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Корневой путь (для красоты)
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
      uploadContent: 'POST /api/cards/:cardId/upload'
    }
  });
});

// ===== AUTOMATIC CLEANUP =====

const CLEANUP_DAYS = parseInt(process.env.CLEANUP_DAYS || '90', 10);

// Extract S3 key from a public URL and delete the object
async function deleteS3File(url) {
  if (!url) return;
  try {
    const urlObj = new URL(url);
    // Pathname: /<bucket>/<cardId>/filename — key is everything after bucket
    const parts = urlObj.pathname.split('/').filter(Boolean);
    const key = parts.slice(1).join('/');
    if (!key) return;
    await s3.deleteObject({ Bucket: process.env.S3_BUCKET, Key: key }).promise();
  } catch (err) {
    console.error('[cleanup] S3 delete error:', url, err.message);
    // Non-fatal — continue with remaining files
  }
}

async function runCleanup() {
  console.log(`[cleanup] Running — deleting cards older than ${CLEANUP_DAYS} days`);
  try {
    const { rows } = await pool.query(`
      SELECT id, video_url, photos_urls
      FROM cards
      WHERE is_demo = false
        AND (
          (status = 'filled'           AND filled_at  < NOW() - INTERVAL '${CLEANUP_DAYS} days')
          OR
          (status IN ('new', 'active') AND created_at < NOW() - INTERVAL '${CLEANUP_DAYS} days')
        )
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

// Запуск сервера
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 ВидеоМиг Backend запущен на порту ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💾 Storage: S3`);
  console.log(`🗄️ Database: PostgreSQL`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing database connection...');
  await pool.end();
  process.exit(0);
});
