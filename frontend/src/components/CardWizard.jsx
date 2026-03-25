import { useState, useEffect, useRef, memo } from 'react';
import CardView from './CardView';
import { getPresignedUrls, confirmUpload, uploadCard } from '../api';

// ── Floating Particles decoration ──
const FloatingParticles = memo(function FloatingParticles({ count = 6 }) {
  return (
    <div className="particles" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={`particle particle--${(i % 4) + 1}`}
          style={{
            left: `${(i * 7.3 + 5) % 95}%`,
            top:  `${(i * 11.7 + 10) % 90}%`,
            '--delay': `${(i * 0.35).toFixed(1)}s`,
            '--dur':   `${3 + (i % 4)}s`,
          }}
        />
      ))}
    </div>
  );
});

// ── Wizard welcome SVG (open envelope) ──
const WizardIllustration = memo(() => (
  <svg className="wizard-illustration" viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="10" y="28" width="80" height="50" rx="5" stroke="#ff7e5f" strokeWidth="2" strokeOpacity="0.6"/>
    <path d="M10 33l40 28 40-28" stroke="#feb47b" strokeWidth="2" strokeOpacity="0.7" strokeLinecap="round"/>
    {/* Open flap */}
    <path d="M10 33L50 6l40 27" stroke="#ff7e5f" strokeWidth="2" strokeOpacity="0.5" fill="none"/>
    {/* Heart inside */}
    <path d="M42 20 Q42 14 50 18 Q58 14 58 20 Q58 26 50 32 Q42 26 42 20z" fill="#ff7e5f" opacity="0.7"/>
    {/* Sparkles */}
    <circle cx="6"  cy="20" r="2.5" fill="#ffcaa7" opacity="0.55"/>
    <circle cx="94" cy="18" r="2"   fill="#feb47b" opacity="0.7"/>
    <circle cx="92" cy="68" r="1.5" fill="#ff7e5f" opacity="0.5"/>
    <text x="78" y="12" fontSize="10" fill="#feb47b" opacity="0.75" fontFamily="serif">✦</text>
  </svg>
));

const UPLOAD_MSGS = [
  'Выбираем красивую бумагу...',
  'Пишем текст поздравления...',
  'Завязываем атласную ленточку...',
  'Подбираем идеальный конверт...',
  'Складываем открытку по линии...',
  'Проверяем орфографию дважды...',
  'Упаковываем с любовью...',
  'Украшаем золотыми звёздочками...',
  'Добавляем блёстки и конфетти...',
  'Пишем пожелания от чистого сердца...',
  'Приклеиваем красивую марку...',
  'Перевязываем золотой нитью...',
  'Прячем маленький сюрприз внутри...',
  'Запечатываем конверт с трепетом...',
  'Надуваем воздушные шарики рядом...',
  'Раскладываем лепестки роз на столе...',
  'Вкладываем частичку себя...',
  'Добавляем капельку волшебства...',
  'Ставим печать с сердечком...',
  'Проверяем, что всё идеально...',
  'Делаем финальные штрихи...',
  'Отправляем с улыбкой...',
];

function CardWizard({ cardId, onComplete }) {
  const [step, setStep] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadMsgIdx, setUploadMsgIdx] = useState(0);

  const [senderName, setSenderName] = useState('');
  const [message, setMessage] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [photoFiles, setPhotoFiles] = useState([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState([]);

  const [isPreview, setIsPreview] = useState(false);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState('');

  const videoInputRef = useRef(null);
  const photoInputRef = useRef(null);

  // Создаём object URL для превью видео, отзываем при смене файла
  useEffect(() => {
    if (!videoFile) { setVideoPreviewUrl(''); return; }
    const url = URL.createObjectURL(videoFile);
    setVideoPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [videoFile]);

  // Крутим сообщения последовательно, без повтора, каждые 8с
  useEffect(() => {
    if (!uploading) return;
    setUploadMsgIdx(0);
    const t = setInterval(() => {
      setUploadMsgIdx((i) => Math.min(i + 1, UPLOAD_MSGS.length - 1));
    }, 8000);
    return () => clearInterval(t);
  }, [uploading]);

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 10);
    setPhotoFiles(files);
    setPhotoPreviewUrls(files.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async () => {
    setUploading(true);
    try {
      // Attempt presigned URL upload flow
      let usedPresigned = false;
      try {
        const urlData = await getPresignedUrls(cardId);
        if (urlData.success) {
          usedPresigned = true;

          // Upload video directly to S3
          let finalVideoUrl = '';
          if (videoFile) {
            const videoRes = await fetch(urlData.videoUploadUrl, {
              method: 'PUT',
              body: videoFile,
              headers: { 'Content-Type': videoFile.type || 'video/mp4' }
            });
            if (!videoRes.ok) throw new Error('Video upload to S3 failed');
            // Derive public URL from the presigned URL (strip query params)
            finalVideoUrl = urlData.videoUploadUrl.split('?')[0];
          }

          // Upload all photos to S3 in parallel
          const finalPhotoUrls = await Promise.all(
            photoFiles.map(async (photo, i) => {
              const photoRes = await fetch(urlData.photoUploadUrls[i], {
                method: 'PUT',
                body: photo,
                headers: { 'Content-Type': photo.type || 'image/jpeg' }
              });
              if (!photoRes.ok) throw new Error(`Photo ${i} upload to S3 failed`);
              return urlData.photoUploadUrls[i].split('?')[0];
            })
          );

          // Confirm upload
          const confirmData = await confirmUpload(cardId, {
            senderName,
            message,
            videoUrl: finalVideoUrl,
            photoUrls: finalPhotoUrls
          });
          if (confirmData.success) {
            onComplete();
            return;
          }
          throw new Error(confirmData.error || 'Confirm upload failed');
        }
      } catch (presignedErr) {
        if (usedPresigned) throw presignedErr;
        console.warn('Presigned URL flow failed, falling back to direct upload:', presignedErr);
      }

      // Fallback: direct multipart upload through backend
      const formData = new FormData();
      formData.append('senderName', senderName);
      formData.append('message', message);
      if (videoFile) formData.append('video', videoFile);
      photoFiles.forEach((photo) => formData.append('photos', photo));

      const data = await uploadCard(cardId, formData);
      if (data.success) {
        onComplete();
      } else {
        alert('Ошибка: ' + data.error);
        setUploading(false);
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Ошибка загрузки. Попробуйте ещё раз.');
      setUploading(false);
    }
  };

  // ── Режим предпросмотра ──
  if (isPreview) {
    return (
      <div>
        {uploading && (
          <div className="uploading-screen">
            <FloatingParticles count={14} />
            <div className="uploading-ring" aria-hidden="true">
              <svg width="72" height="72" viewBox="0 0 72 72">
                <defs>
                  <linearGradient id="ringGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ff7e5f" />
                    <stop offset="100%" stopColor="#feb47b" />
                  </linearGradient>
                </defs>
                <circle className="uploading-ring-track" cx="36" cy="36" r="28" />
                <circle className="uploading-ring-fill" cx="36" cy="36" r="28" stroke="url(#ringGrad2)" />
              </svg>
            </div>
            <div className="uploading-icon">🎁</div>
            <p className="uploading-msg" key={uploadMsgIdx}>{UPLOAD_MSGS[uploadMsgIdx]}</p>
            <p className="uploading-sub">Создаём вашу открытку</p>
          </div>
        )}
        <div className="preview-bar">
          <button className="preview-back-btn" onClick={() => setIsPreview(false)}>
            ← Редактировать
          </button>
          <span className="preview-label">✦ Предпросмотр</span>
          <button className="cta-button cta-small" onClick={handleSubmit} disabled={uploading}>
            ✉️ Отправить
          </button>
        </div>
        <div className="preview-content">
          <CardView card={{
            sender_name: senderName || 'Имя отправителя',
            video_url: videoPreviewUrl,
            message: message,
            photos_urls: photoPreviewUrls,
            status: 'filled',
          }} />
        </div>
      </div>
    );
  }

  return (
    <div className="wizard-wrapper">

      {/* ── Uploading overlay ── */}
      {uploading && (
        <div className="uploading-screen">
          <FloatingParticles count={14} />
          <div className="uploading-ring" aria-hidden="true">
            <svg width="72" height="72" viewBox="0 0 72 72">
              <defs>
                <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff7e5f" />
                  <stop offset="100%" stopColor="#feb47b" />
                </linearGradient>
              </defs>
              <circle className="uploading-ring-track" cx="36" cy="36" r="28" />
              <circle className="uploading-ring-fill" cx="36" cy="36" r="28" stroke="url(#ringGrad)" />
            </svg>
          </div>
          <div className="uploading-icon">🎁</div>
          <p className="uploading-msg" key={uploadMsgIdx}>{UPLOAD_MSGS[uploadMsgIdx]}</p>
          <p className="uploading-sub">Создаём вашу открытку</p>
        </div>
      )}

      {/* ── Step 0: Welcome ── */}
      {step === 0 && (
        <div className="wizard-screen" key="step-0">
          <FloatingParticles count={12} />
          <WizardIllustration />
          <h1 className="wizard-title">Создайте незабываемую открытку</h1>
          <p className="wizard-subtitle">Это займёт пару минут</p>
          <button className="cta-button" onClick={() => setStep(1)}>
            Начать →
          </button>
        </div>
      )}

      {/* ── Step 1: Name ── */}
      {step === 1 && (
        <div className="wizard-screen" key="step-1">
          <div className="wizard-progress">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`progress-dot ${1 >= i ? 'active' : ''}`} />
            ))}
          </div>
          <p className="wizard-question">Как вас зовут?</p>
          <p className="wizard-hint">Шаг 1 из 3</p>
          <input
            className="wizard-input"
            type="text"
            placeholder="Ваше имя"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter' && senderName.trim()) setStep(2); }}
          />
          <div className="wizard-nav">
            <button className="btn-back" onClick={() => setStep(0)}>← Назад</button>
            <button
              className="cta-button"
              onClick={() => setStep(2)}
              disabled={!senderName.trim()}
            >
              Далее →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Video ── */}
      {step === 2 && (
        <div className="wizard-screen" key="step-2">
          <div className="wizard-progress">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`progress-dot ${2 >= i ? 'active' : ''}`} />
            ))}
          </div>
          <p className="wizard-question">Загрузите видео</p>
          <p className="wizard-hint">Шаг 2 из 3 · Необязательно</p>

          {/* Скрытый системный input */}
          <input
            type="file"
            ref={videoInputRef}
            accept="video/*"
            style={{ display: 'none' }}
            onChange={(e) => setVideoFile(e.target.files[0] || null)}
          />

          <div
            className={`upload-zone ${videoFile ? 'upload-zone--filled' : ''}`}
            onClick={() => videoInputRef.current.click()}
          >
            {videoFile ? (
              <div className="upload-preview">
                <span>✅</span>
                <span>{videoFile.name}</span>
              </div>
            ) : (
              <div className="upload-prompt">
                <span className="upload-icon">🎬</span>
                <p>Нажмите для выбора видео</p>
              </div>
            )}
          </div>
          <p className="upload-max">Максимум 50 MB</p>

          <div className="wizard-nav">
            <button className="btn-back" onClick={() => setStep(1)}>← Назад</button>
            <button className="cta-button" onClick={() => setStep(3)}>Далее →</button>
            <button className="btn-skip" onClick={() => { setVideoFile(null); setStep(3); }}>
              Пропустить
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Photos + Message + Submit ── */}
      {step === 3 && (
        <div className="wizard-screen" key="step-3">
          <div className="wizard-progress">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`progress-dot ${3 >= i ? 'active' : ''}`} />
            ))}
          </div>
          <p className="wizard-question">Добавьте фото</p>
          <p className="wizard-hint">Шаг 3 из 3 · До 10 фотографий</p>

          {/* Скрытый input фото */}
          <input
            type="file"
            ref={photoInputRef}
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={handlePhotoChange}
          />

          <div
            className={`upload-zone ${photoFiles.length > 0 ? 'upload-zone--filled' : ''}`}
            onClick={() => photoInputRef.current.click()}
          >
            {photoFiles.length > 0 ? (
              <div className="upload-preview">
                <span>✅</span>
                <span>Выбрано {photoFiles.length} фото</span>
              </div>
            ) : (
              <div className="upload-prompt">
                <span className="upload-icon">📸</span>
                <p>Нажмите для выбора фотографий</p>
              </div>
            )}
          </div>

          {photoPreviewUrls.length > 0 && (
            <div className="photo-thumbs">
              {photoPreviewUrls.map((url, i) => (
                <img key={i} src={url} alt={`Превью ${i + 1}`} className="photo-thumb" loading="lazy" />
              ))}
            </div>
          )}

          <p className="wizard-question" style={{ fontSize: '1.1rem', marginTop: '1.25rem' }}>
            Напишите поздравление
          </p>
          <textarea
            className="wizard-textarea"
            placeholder="Тёплые слова от вас…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
          />

          <div className="wizard-nav">
            <button className="btn-back" onClick={() => setStep(2)}>← Назад</button>
            <button className="btn-skip" onClick={() => setIsPreview(true)}>
              👁 Предпросмотр
            </button>
            <button
              className="cta-button"
              onClick={handleSubmit}
              disabled={uploading}
            >
              {uploading ? 'Отправляем…' : '✉️ Отправить'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default CardWizard;
