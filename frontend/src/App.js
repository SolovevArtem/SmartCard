import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'https://smartcard-production.up.railway.app';

console.log('🔍 Using API_URL:', API_URL);

// ── Floating Particles decoration ──
function FloatingParticles({ count = 14 }) {
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
}

// ── SVG Icons ──
const IconEnvelope = () => (
  <svg className="step-svg-icon" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="14" width="40" height="28" rx="4" stroke="#FF6B9D" strokeWidth="2"/>
    <path d="M6 18l20 14 20-14" stroke="#FFB800" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="38" cy="16" r="6" fill="#FF4785" opacity="0.85"/>
    <path d="M35 16l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconClapperboard = () => (
  <svg className="step-svg-icon" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="18" width="40" height="26" rx="3" stroke="#FF6B9D" strokeWidth="2"/>
    <rect x="6" y="10" width="40" height="10" rx="2" stroke="#FFB800" strokeWidth="2"/>
    <line x1="14" y1="10" x2="18" y2="20" stroke="#FFB800" strokeWidth="2"/>
    <line x1="24" y1="10" x2="28" y2="20" stroke="#FFB800" strokeWidth="2"/>
    <line x1="34" y1="10" x2="38" y2="20" stroke="#FFB800" strokeWidth="2"/>
    <path d="M21 28l10 5-10 5V28z" fill="#00E5CC" opacity="0.8"/>
  </svg>
);

const IconPhoneSpark = () => (
  <svg className="step-svg-icon" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="14" y="6" width="20" height="36" rx="4" stroke="#FF6B9D" strokeWidth="2"/>
    <circle cx="24" cy="38" r="2" fill="#FF6B9D" opacity="0.7"/>
    <line x1="19" y1="10" x2="29" y2="10" stroke="#FF6B9D" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
    <path d="M38 12l2-4" stroke="#FFB800" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M42 16l4-2" stroke="#FFB800" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M40 20l4 1" stroke="#00E5CC" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="40" cy="15" r="2" fill="#FFB800" opacity="0.9"/>
    <circle cx="36" cy="24" r="1.5" fill="#00E5CC" opacity="0.7"/>
    <circle cx="44" cy="24" r="1" fill="#FF6B9D" opacity="0.6"/>
  </svg>
);

const IconVideo = () => (
  <svg className="feature-svg-icon" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="9" width="24" height="18" rx="3" stroke="#FF6B9D" strokeWidth="1.8"/>
    <path d="M27 16l10-5v14l-10-5V16z" stroke="#FFB800" strokeWidth="1.8" strokeLinejoin="round"/>
  </svg>
);

const IconPhotos = () => (
  <svg className="feature-svg-icon" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="8" width="24" height="20" rx="3" stroke="#FF6B9D" strokeWidth="1.8"/>
    <rect x="10" y="14" width="24" height="20" rx="3" stroke="#00E5CC" strokeWidth="1.8" opacity="0.7"/>
    <circle cx="12" cy="16" r="2.5" fill="#FFB800" opacity="0.8"/>
    <path d="M4 24l6-5 5 5 4-4 9 8" stroke="#FF6B9D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
  </svg>
);

const IconMessage = () => (
  <svg className="feature-svg-icon" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="6" width="32" height="22" rx="4" stroke="#FFB800" strokeWidth="1.8"/>
    <path d="M10 30l4-8h12l4 8" stroke="#FFB800" strokeWidth="1.5" strokeLinejoin="round" opacity="0.6"/>
    <line x1="10" y1="14" x2="30" y2="14" stroke="#FF6B9D" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
    <line x1="10" y1="20" x2="24" y2="20" stroke="#FF6B9D" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
  </svg>
);

const IconNoApp = () => (
  <svg className="feature-svg-icon" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="4" width="20" height="32" rx="4" stroke="#00E5CC" strokeWidth="1.8"/>
    <circle cx="20" cy="32" r="1.5" fill="#00E5CC" opacity="0.7"/>
    <path d="M15 7h10" stroke="#00E5CC" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
    <path d="M16 18l3 3 6-6" stroke="#FFB800" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ── Hero SVG gift illustration ──
const HeroIllustration = () => (
  <div className="hero-illustration" aria-hidden="true">
    <svg viewBox="0 0 220 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Box body */}
      <rect x="55" y="62" width="110" height="62" rx="5" stroke="#FF6B9D" strokeWidth="2" strokeOpacity="0.55"/>
      {/* Box lid */}
      <rect x="48" y="44" width="124" height="22" rx="4" stroke="#FF6B9D" strokeWidth="2" strokeOpacity="0.55"/>
      {/* Vertical ribbon */}
      <line x1="110" y1="44" x2="110" y2="124" stroke="#FFB800" strokeWidth="2.5" strokeOpacity="0.65"/>
      {/* Horizontal ribbon on lid */}
      <line x1="48" y1="55" x2="172" y2="55" stroke="#FFB800" strokeWidth="2.5" strokeOpacity="0.65"/>
      {/* Bow left loop */}
      <path d="M90 44 Q95 22 110 44" stroke="#FF6B9D" strokeWidth="2" strokeOpacity="0.8" fill="none"/>
      {/* Bow right loop */}
      <path d="M130 44 Q125 22 110 44" stroke="#FF6B9D" strokeWidth="2" strokeOpacity="0.8" fill="none"/>
      {/* Bow knot */}
      <circle cx="110" cy="44" r="4" fill="#FFB800" opacity="0.9"/>
      {/* Sparkles */}
      <circle cx="28"  cy="22" r="3.5" fill="#00E5CC" opacity="0.55"/>
      <circle cx="192" cy="28" r="2.5" fill="#FFB800" opacity="0.65"/>
      <circle cx="18"  cy="80" r="2"   fill="#FF6B9D" opacity="0.45"/>
      <circle cx="198" cy="90" r="3"   fill="#00E5CC" opacity="0.4"/>
      <circle cx="42"  cy="115" r="2"  fill="#FFB800" opacity="0.5"/>
      <circle cx="180" cy="115" r="2.5" fill="#FF6B9D" opacity="0.4"/>
      {/* Stars */}
      <text x="168" y="20" fontSize="15" fill="#FFB800" opacity="0.75" fontFamily="serif">✦</text>
      <text x="12"  y="48" fontSize="11" fill="#FF6B9D" opacity="0.65" fontFamily="serif">✦</text>
      <text x="172" y="108" fontSize="9" fill="#00E5CC" opacity="0.55" fontFamily="serif">✦</text>
      <text x="36"  y="36" fontSize="9" fill="#00E5CC" opacity="0.5" fontFamily="serif">✦</text>
    </svg>
  </div>
);

// ── Wizard welcome SVG (open envelope) ──
const WizardIllustration = () => (
  <svg className="wizard-illustration" viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="10" y="28" width="80" height="50" rx="5" stroke="#FF6B9D" strokeWidth="2" strokeOpacity="0.6"/>
    <path d="M10 33l40 28 40-28" stroke="#FFB800" strokeWidth="2" strokeOpacity="0.7" strokeLinecap="round"/>
    {/* Open flap */}
    <path d="M10 33L50 6l40 27" stroke="#FF6B9D" strokeWidth="2" strokeOpacity="0.5" fill="none"/>
    {/* Heart inside */}
    <path d="M42 20 Q42 14 50 18 Q58 14 58 20 Q58 26 50 32 Q42 26 42 20z" fill="#FF4785" opacity="0.7"/>
    {/* Sparkles */}
    <circle cx="6"  cy="20" r="2.5" fill="#00E5CC" opacity="0.55"/>
    <circle cx="94" cy="18" r="2"   fill="#FFB800" opacity="0.7"/>
    <circle cx="92" cy="68" r="1.5" fill="#FF6B9D" opacity="0.5"/>
    <text x="78" y="12" fontSize="10" fill="#FFB800" opacity="0.75" fontFamily="serif">✦</text>
  </svg>
);

// ── View intro SVG (gift with sparkles) ──
const ViewIntroIllustration = () => (
  <svg className="view-intro-illustration" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="20" y="48" width="80" height="48" rx="5" stroke="#FF6B9D" strokeWidth="2" strokeOpacity="0.6"/>
    <rect x="14" y="32" width="92" height="18" rx="4" stroke="#FF6B9D" strokeWidth="2" strokeOpacity="0.6"/>
    <line x1="60" y1="32" x2="60" y2="96" stroke="#FFB800" strokeWidth="2.5" strokeOpacity="0.7"/>
    <line x1="14" y1="41" x2="106" y2="41" stroke="#FFB800" strokeWidth="2.5" strokeOpacity="0.7"/>
    <path d="M44 32 Q52 14 60 32" stroke="#FF6B9D" strokeWidth="2" strokeOpacity="0.8" fill="none"/>
    <path d="M76 32 Q68 14 60 32" stroke="#FF6B9D" strokeWidth="2" strokeOpacity="0.8" fill="none"/>
    <circle cx="60" cy="32" r="4" fill="#FFB800" opacity="0.9"/>
    <circle cx="10"  cy="18" r="4" fill="#00E5CC" opacity="0.5"/>
    <circle cx="110" cy="22" r="3" fill="#FFB800" opacity="0.6"/>
    <circle cx="8"   cy="65" r="2" fill="#FF6B9D" opacity="0.45"/>
    <circle cx="112" cy="75" r="3" fill="#00E5CC" opacity="0.4"/>
    <text x="96" y="14" fontSize="13" fill="#FFB800" opacity="0.8" fontFamily="serif">✦</text>
    <text x="4"  y="38" fontSize="10" fill="#FF6B9D" opacity="0.65" fontFamily="serif">✦</text>
    <text x="98" y="95" fontSize="8"  fill="#00E5CC" opacity="0.5" fontFamily="serif">✦</text>
  </svg>
);

// ── Главная страница (Лендинг) ──
function HomePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/cards/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.success) {
        navigate(`/c/${data.cardId}`);
      } else {
        alert('Ошибка создания карточки: ' + data.error);
      }
    } catch (error) {
      console.error('Error creating card:', error);
      alert('Ошибка подключения к серверу');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing">

      {/* ── Sticky Navbar ── */}
      <nav className="sticky-nav">
        <div className="nav-logo">
          <span className="logo-text">OneTapGift</span>
        </div>
        <button className="nav-cta" onClick={handleCreate} disabled={loading}>
          {loading ? '...' : 'Создать →'}
        </button>
      </nav>

      {/* ── Hero ── */}
      <section className="hero-section">
        <FloatingParticles count={16} />
        <HeroIllustration />
        <h1 className="hero-title">Подарите незабываемые впечатления</h1>
        <p className="hero-sub">Открытка, которая оживает в руках адресата</p>
        <button className="cta-button" onClick={handleCreate} disabled={loading}>
          {loading ? 'Создаём...' : 'Начать бесплатно'}
        </button>
      </section>

      {/* ── Как это работает ── */}
      <section className="how-section">
        <FloatingParticles count={8} />
        <h2 className="section-title">Как это работает</h2>
        <div className="steps-row">
          <div className="step-card">
            <div className="step-badge">1</div>
            <IconEnvelope />
            <h3>Приложи открытку к телефону</h3>
            <p>Создай и оформи свою уникальную открытку</p>
          </div>

          <div className="steps-arrow" aria-hidden="true">→</div>

          <div className="step-card">
            <div className="step-badge">2</div>
            <IconClapperboard />
            <h3>Добавь видео и фото</h3>
            <p>Загрузи воспоминания и личное поздравление</p>
          </div>

          <div className="steps-arrow" aria-hidden="true">→</div>

          <div className="step-card">
            <div className="step-badge">3</div>
            <IconPhoneSpark />
            <h3>Наведи телефон на открытку</h3>
            <p>Адресат видит живую анимированную открытку</p>
          </div>
        </div>
      </section>

      {/* ── Возможности ── */}
      <section className="features-section">
        <FloatingParticles count={8} />
        <h2 className="section-title">Возможности</h2>
        <div className="features-grid">
          <div className="feature-card">
            <IconVideo />
            <h3>Видео в открытке</h3>
            <p>Оживи поздравление личным видео</p>
          </div>
          <div className="feature-card">
            <IconPhotos />
            <h3>Фото-галерея</h3>
            <p>Целая история воспоминаний в одной открытке</p>
          </div>
          <div className="feature-card">
            <IconMessage />
            <h3>Личное сообщение</h3>
            <p>Тёплые слова прямо от тебя</p>
          </div>
          <div className="feature-card">
            <IconNoApp />
            <h3>Без приложений</h3>
            <p>Просто наведи телефон — всё откроется в браузере</p>
          </div>
        </div>
      </section>

      {/* ── Sticky Bottom CTA ── */}
      <div className="sticky-cta">
        <p>Создай свою первую открытку прямо сейчас</p>
        <button className="cta-button cta-small" onClick={handleCreate} disabled={loading}>
          {loading ? 'Создаём...' : 'Создать открытку'}
        </button>
      </div>

    </div>
  );
}

// ── Просмотр заполненной карточки ──
function CardView({ card }) {
  const videoRef = useRef(null);
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const photos = card.photos_urls || [];

  // Автоплей видео через 4с (muted — обязательно для iOS)
  useEffect(() => {
    if (!card.video_url) return;
    const t = setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.muted = true;
        videoRef.current.play().catch(() => {});
      }
    }, 4000);
    return () => clearTimeout(t);
  }, [card.video_url]);

  // Scroll reveal через IntersectionObserver
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.18 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const prevPhoto = () => setCurrentPhoto((p) => Math.max(p - 1, 0));
  const nextPhoto = () => setCurrentPhoto((p) => Math.min(p + 1, photos.length - 1));

  return (
    <div>
      {/* ── Intro экран ── */}
      <section className="view-intro">
        <FloatingParticles count={18} />
        <ViewIntroIllustration />
        <p className="intro-surprise">✦ Для вас особый сюрприз</p>
        <h1 className="intro-name">{card.sender_name}</h1>
        <p className="intro-tagline">подготовил(а) для вас что-то особенное</p>
        <span className="intro-scroll-hint" aria-hidden="true">↓</span>
      </section>

      {/* ── Основной контент ── */}
      <div className="view-content">

        {/* Видео */}
        {card.video_url && (
          <div className="view-section reveal">
            <p className="view-section-title">Видео-поздравление</p>
            <div className="video-container">
              <video ref={videoRef} controls playsInline muted>
                <source src={card.video_url} type="video/mp4" />
                Ваш браузер не поддерживает видео
              </video>
            </div>
          </div>
        )}

        {/* Сообщение */}
        {card.message && (
          <div className="view-section reveal">
            <p className="view-section-title">Слова от {card.sender_name}</p>
            <div className="view-message">{card.message}</div>
          </div>
        )}

        {/* Фото */}
        {photos.length > 0 && (
          <div className="view-section reveal">
            <p className="view-section-title">
              Фотографии{photos.length > 1 ? ` · ${currentPhoto + 1} / ${photos.length}` : ''}
            </p>
            {photos.length === 1 ? (
              <img src={photos[0]} alt="Фото" className="single-photo" />
            ) : (
              <div className="carousel-wrapper">
                <div className="carousel-track-container">
                  <div
                    className="carousel-track"
                    style={{ transform: `translateX(-${currentPhoto * 100}%)` }}
                  >
                    {photos.map((url, i) => (
                      <img key={i} src={url} alt={`Фото ${i + 1}`} className="carousel-slide" />
                    ))}
                  </div>
                </div>
                <div className="carousel-controls">
                  <button
                    className="carousel-btn"
                    onClick={prevPhoto}
                    disabled={currentPhoto === 0}
                    aria-label="Предыдущее фото"
                  >‹</button>
                  <div className="carousel-dots">
                    {photos.map((_, i) => (
                      <span
                        key={i}
                        className={`carousel-dot ${i === currentPhoto ? 'active' : ''}`}
                        onClick={() => setCurrentPhoto(i)}
                        aria-label={`Фото ${i + 1}`}
                      />
                    ))}
                  </div>
                  <button
                    className="carousel-btn"
                    onClick={nextPhoto}
                    disabled={currentPhoto === photos.length - 1}
                    aria-label="Следующее фото"
                  >›</button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

// ── Пошаговый wizard создания карточки ──
function CardWizard({ cardId, onComplete }) {
  const [step, setStep] = useState(0);
  const [uploading, setUploading] = useState(false);

  const [senderName, setSenderName] = useState('');
  const [message, setMessage] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [photoFiles, setPhotoFiles] = useState([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState([]);

  const videoInputRef = useRef(null);
  const photoInputRef = useRef(null);

  // Авто-переход со step 0 через 2с если пользователь не нажал сам
  useEffect(() => {
    if (step !== 0) return;
    const t = setTimeout(() => setStep(1), 2500);
    return () => clearTimeout(t);
  }, [step]);

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 10);
    setPhotoFiles(files);
    setPhotoPreviewUrls(files.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async () => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('senderName', senderName);
      formData.append('message', message);
      if (videoFile) formData.append('video', videoFile);
      photoFiles.forEach((photo) => formData.append('photos', photo));

      const response = await fetch(`${API_URL}/api/cards/${cardId}/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
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

  return (
    <div className="wizard-wrapper">

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
                <img key={i} src={url} alt={`Превью ${i + 1}`} className="photo-thumb" />
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
            <button
              className="cta-button"
              onClick={handleSubmit}
              disabled={uploading}
            >
              {uploading ? 'Отправляем…' : '✉️ Отправить поздравление'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

// ── Страница карточки ──
function CardPage() {
  const { cardId } = useParams();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCard();
  }, [cardId]);

  const loadCard = async () => {
    try {
      const response = await fetch(`${API_URL}/api/cards/${cardId}`);
      const data = await response.json();
      if (data.success) {
        setCard(data.card);
      } else {
        setError(data.error || 'Карточка не найдена');
      }
    } catch (err) {
      console.error('Error loading card:', err);
      setError('Ошибка подключения к серверу');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Загрузка карточки...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-screen">
        <h2>❌ Ошибка</h2>
        <p>{error}</p>
        <button onClick={() => window.location.href = '/'}>На главную</button>
      </div>
    );
  }

  if (card.status === 'filled') {
    return <CardView card={card} />;
  }

  return <CardWizard cardId={cardId} onComplete={loadCard} />;
}

// ── Главный компонент ──
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/c/:cardId" element={<CardPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
