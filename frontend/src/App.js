import React, { useState, useEffect, useRef, useCallback } from 'react';
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
    <rect x="6" y="14" width="40" height="28" rx="4" stroke="#E89B88" strokeWidth="2"/>
    <path d="M6 18l20 14 20-14" stroke="#C77B6B" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="38" cy="16" r="6" fill="#D18973" opacity="0.85"/>
    <path d="M35 16l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconClapperboard = () => (
  <svg className="step-svg-icon" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="18" width="40" height="26" rx="3" stroke="#E89B88" strokeWidth="2"/>
    <rect x="6" y="10" width="40" height="10" rx="2" stroke="#C77B6B" strokeWidth="2"/>
    <line x1="14" y1="10" x2="18" y2="20" stroke="#C77B6B" strokeWidth="2"/>
    <line x1="24" y1="10" x2="28" y2="20" stroke="#C77B6B" strokeWidth="2"/>
    <line x1="34" y1="10" x2="38" y2="20" stroke="#C77B6B" strokeWidth="2"/>
    <path d="M21 28l10 5-10 5V28z" fill="#A8C9A4" opacity="0.8"/>
  </svg>
);

const IconPhoneSpark = () => (
  <svg className="step-svg-icon" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="14" y="6" width="20" height="36" rx="4" stroke="#E89B88" strokeWidth="2"/>
    <circle cx="24" cy="38" r="2" fill="#E89B88" opacity="0.7"/>
    <line x1="19" y1="10" x2="29" y2="10" stroke="#E89B88" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
    <path d="M38 12l2-4" stroke="#C77B6B" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M42 16l4-2" stroke="#C77B6B" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M40 20l4 1" stroke="#A8C9A4" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="40" cy="15" r="2" fill="#C77B6B" opacity="0.9"/>
    <circle cx="36" cy="24" r="1.5" fill="#A8C9A4" opacity="0.7"/>
    <circle cx="44" cy="24" r="1" fill="#E89B88" opacity="0.6"/>
  </svg>
);

const IconVideo = () => (
  <svg className="feature-svg-icon" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="9" width="24" height="18" rx="3" stroke="#E89B88" strokeWidth="1.8"/>
    <path d="M27 16l10-5v14l-10-5V16z" stroke="#C77B6B" strokeWidth="1.8" strokeLinejoin="round"/>
  </svg>
);

const IconPhotos = () => (
  <svg className="feature-svg-icon" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="8" width="24" height="20" rx="3" stroke="#E89B88" strokeWidth="1.8"/>
    <rect x="10" y="14" width="24" height="20" rx="3" stroke="#A8C9A4" strokeWidth="1.8" opacity="0.7"/>
    <circle cx="12" cy="16" r="2.5" fill="#C77B6B" opacity="0.8"/>
    <path d="M4 24l6-5 5 5 4-4 9 8" stroke="#E89B88" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
  </svg>
);

const IconMessage = () => (
  <svg className="feature-svg-icon" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="6" width="32" height="22" rx="4" stroke="#C77B6B" strokeWidth="1.8"/>
    <path d="M10 30l4-8h12l4 8" stroke="#C77B6B" strokeWidth="1.5" strokeLinejoin="round" opacity="0.6"/>
    <line x1="10" y1="14" x2="30" y2="14" stroke="#E89B88" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
    <line x1="10" y1="20" x2="24" y2="20" stroke="#E89B88" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
  </svg>
);

const IconNoApp = () => (
  <svg className="feature-svg-icon" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="4" width="20" height="32" rx="4" stroke="#A8C9A4" strokeWidth="1.8"/>
    <circle cx="20" cy="32" r="1.5" fill="#A8C9A4" opacity="0.7"/>
    <path d="M15 7h10" stroke="#A8C9A4" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
    <path d="M16 18l3 3 6-6" stroke="#C77B6B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ── Social media icons ──
const IconTelegram = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22">
    <path d="M22 2L11 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconInstagram = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22">
    <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.8"/>
    <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.8"/>
    <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor"/>
  </svg>
);

// ── Hero SVG gift illustration ──
const HeroIllustration = () => (
  <div className="hero-illustration" aria-hidden="true">
    <svg viewBox="0 0 220 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Box body */}
      <rect x="55" y="62" width="110" height="62" rx="5" stroke="#E89B88" strokeWidth="2" strokeOpacity="0.55"/>
      {/* Box lid */}
      <rect x="48" y="44" width="124" height="22" rx="4" stroke="#E89B88" strokeWidth="2" strokeOpacity="0.55"/>
      {/* Vertical ribbon */}
      <line x1="110" y1="44" x2="110" y2="124" stroke="#C77B6B" strokeWidth="2.5" strokeOpacity="0.65"/>
      {/* Horizontal ribbon on lid */}
      <line x1="48" y1="55" x2="172" y2="55" stroke="#C77B6B" strokeWidth="2.5" strokeOpacity="0.65"/>
      {/* Bow left loop */}
      <path d="M90 44 Q95 22 110 44" stroke="#E89B88" strokeWidth="2" strokeOpacity="0.8" fill="none"/>
      {/* Bow right loop */}
      <path d="M130 44 Q125 22 110 44" stroke="#E89B88" strokeWidth="2" strokeOpacity="0.8" fill="none"/>
      {/* Bow knot */}
      <circle cx="110" cy="44" r="4" fill="#C77B6B" opacity="0.9"/>
      {/* Sparkles */}
      <circle cx="28"  cy="22" r="3.5" fill="#A8C9A4" opacity="0.55"/>
      <circle cx="192" cy="28" r="2.5" fill="#C77B6B" opacity="0.65"/>
      <circle cx="18"  cy="80" r="2"   fill="#E89B88" opacity="0.45"/>
      <circle cx="198" cy="90" r="3"   fill="#A8C9A4" opacity="0.4"/>
      <circle cx="42"  cy="115" r="2"  fill="#C77B6B" opacity="0.5"/>
      <circle cx="180" cy="115" r="2.5" fill="#E89B88" opacity="0.4"/>
      {/* Stars */}
      <text x="168" y="20" fontSize="15" fill="#C77B6B" opacity="0.75" fontFamily="serif">✦</text>
      <text x="12"  y="48" fontSize="11" fill="#E89B88" opacity="0.65" fontFamily="serif">✦</text>
      <text x="172" y="108" fontSize="9" fill="#A8C9A4" opacity="0.55" fontFamily="serif">✦</text>
      <text x="36"  y="36" fontSize="9" fill="#A8C9A4" opacity="0.5" fontFamily="serif">✦</text>
    </svg>
  </div>
);

// ── Wizard welcome SVG (open envelope) ──
const WizardIllustration = () => (
  <svg className="wizard-illustration" viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="10" y="28" width="80" height="50" rx="5" stroke="#E89B88" strokeWidth="2" strokeOpacity="0.6"/>
    <path d="M10 33l40 28 40-28" stroke="#C77B6B" strokeWidth="2" strokeOpacity="0.7" strokeLinecap="round"/>
    {/* Open flap */}
    <path d="M10 33L50 6l40 27" stroke="#E89B88" strokeWidth="2" strokeOpacity="0.5" fill="none"/>
    {/* Heart inside */}
    <path d="M42 20 Q42 14 50 18 Q58 14 58 20 Q58 26 50 32 Q42 26 42 20z" fill="#D18973" opacity="0.7"/>
    {/* Sparkles */}
    <circle cx="6"  cy="20" r="2.5" fill="#A8C9A4" opacity="0.55"/>
    <circle cx="94" cy="18" r="2"   fill="#C77B6B" opacity="0.7"/>
    <circle cx="92" cy="68" r="1.5" fill="#E89B88" opacity="0.5"/>
    <text x="78" y="12" fontSize="10" fill="#C77B6B" opacity="0.75" fontFamily="serif">✦</text>
  </svg>
);

// ── View intro SVG (gift with sparkles) ──
const ViewIntroIllustration = () => (
  <svg className="view-intro-illustration" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="20" y="48" width="80" height="48" rx="5" stroke="#E89B88" strokeWidth="2" strokeOpacity="0.6"/>
    <rect x="14" y="32" width="92" height="18" rx="4" stroke="#E89B88" strokeWidth="2" strokeOpacity="0.6"/>
    <line x1="60" y1="32" x2="60" y2="96" stroke="#C77B6B" strokeWidth="2.5" strokeOpacity="0.7"/>
    <line x1="14" y1="41" x2="106" y2="41" stroke="#C77B6B" strokeWidth="2.5" strokeOpacity="0.7"/>
    <path d="M44 32 Q52 14 60 32" stroke="#E89B88" strokeWidth="2" strokeOpacity="0.8" fill="none"/>
    <path d="M76 32 Q68 14 60 32" stroke="#E89B88" strokeWidth="2" strokeOpacity="0.8" fill="none"/>
    <circle cx="60" cy="32" r="4" fill="#C77B6B" opacity="0.9"/>
    <circle cx="10"  cy="18" r="4" fill="#A8C9A4" opacity="0.5"/>
    <circle cx="110" cy="22" r="3" fill="#C77B6B" opacity="0.6"/>
    <circle cx="8"   cy="65" r="2" fill="#E89B88" opacity="0.45"/>
    <circle cx="112" cy="75" r="3" fill="#A8C9A4" opacity="0.4"/>
    <text x="96" y="14" fontSize="13" fill="#C77B6B" opacity="0.8" fontFamily="serif">✦</text>
    <text x="4"  y="38" fontSize="10" fill="#E89B88" opacity="0.65" fontFamily="serif">✦</text>
    <text x="98" y="95" fontSize="8"  fill="#A8C9A4" opacity="0.5" fontFamily="serif">✦</text>
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
          <span className="logo-text">Умная открытка</span>
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

      {/* ── Social Footer ── */}
      <footer className="social-footer">
        <p className="social-label">Следите за нами</p>
        <div className="social-links">
          <a
            href="https://t.me/s0lart"
            target="_blank"
            rel="noreferrer"
            className="social-link"
            aria-label="Telegram"
          >
            <IconTelegram />
          </a>
          <a
            href="https://instagram.com/s0lart"
            target="_blank"
            rel="noreferrer"
            className="social-link"
            aria-label="Instagram"
          >
            <IconInstagram />
          </a>
        </div>
        <p className="social-handle">@s0lart</p>
      </footer>

    </div>
  );
}

// ── Просмотр заполненной карточки ──
function CardView({ card }) {
  const videoRef = useRef(null);
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const autoTimer = useRef(null);
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

  // Scroll reveal через IntersectionObserver (threshold 0.06 — срабатывает сразу при появлении)
  useEffect(() => {
    const els = document.querySelectorAll('.reveal, .reveal-right, .reveal-left');
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.06 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  // Авто-карусель: через 4с бездействия переходим к следующему фото
  const resetAutoRotate = useCallback(() => {
    if (photos.length <= 1) return;
    clearTimeout(autoTimer.current);
    autoTimer.current = setTimeout(() => {
      setCurrentPhoto((p) => (p + 1) % photos.length);
    }, 4000);
  }, [photos.length]);

  useEffect(() => {
    resetAutoRotate();
    return () => clearTimeout(autoTimer.current);
  }, [currentPhoto, resetAutoRotate]);

  // Бесконечная прокрутка: оба конца замыкаются
  const prevPhoto = () => setCurrentPhoto((p) => (p - 1 + photos.length) % photos.length);
  const nextPhoto = () => setCurrentPhoto((p) => (p + 1) % photos.length);

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
          <div className="view-section reveal-right">
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
          <div className="view-section reveal-left">
            <div className="message-envelope">
              <svg
                className="envelope-flap"
                viewBox="0 0 320 72"
                preserveAspectRatio="none"
                fill="none"
                aria-hidden="true"
              >
                <rect x="0" y="0" width="320" height="72" fill="#FDFBF9"/>
                <path d="M0 72 L0 36 L160 0 L320 36 L320 72"
                  stroke="rgba(232,155,136,0.30)" strokeWidth="1.5" fill="none"/>
                <line x1="0" y1="36" x2="320" y2="36"
                  stroke="rgba(232,155,136,0.18)" strokeWidth="1"/>
                <path d="M155 18 Q155 13 160 15.5 Q165 13 165 18 Q165 22.5 160 26 Q155 22.5 155 18z"
                  fill="#D18973" opacity="0.65"/>
                <text x="22"  y="62" fontSize="10" fill="#C77B6B" opacity="0.35" fontFamily="serif">✦</text>
                <text x="282" y="60" fontSize="8"  fill="#E89B88" opacity="0.35" fontFamily="serif">✦</text>
              </svg>
              <div className="envelope-body">
                <div className="envelope-message">{card.message}</div>
                <p className="envelope-from">— {card.sender_name}</p>
              </div>
            </div>
          </div>
        )}

        {/* Фото */}
        {photos.length > 0 && (
          <div className="view-section reveal-right">
            <p className="view-section-title">
              Фотографии{photos.length > 1 ? ` · ${currentPhoto + 1} / ${photos.length}` : ''}
            </p>
            {photos.length === 1 ? (
              <>
                <img src={photos[0]} alt="Фото" className="single-photo" />
                <div className="single-photo-download">
                  <a
                    className="download-btn"
                    href={photos[0]}
                    download="photo-1.jpg"
                    target="_blank"
                    rel="noreferrer"
                  >↓ Сохранить</a>
                </div>
              </>
            ) : (
              <div
                className="carousel-wrapper"
                onMouseMove={resetAutoRotate}
                onTouchStart={resetAutoRotate}
              >
                <div className="carousel-download">
                  <a
                    className="download-btn"
                    href={photos[currentPhoto]}
                    download={`photo-${currentPhoto + 1}.jpg`}
                    target="_blank"
                    rel="noreferrer"
                  >↓ Сохранить</a>
                </div>
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
                    <stop offset="0%" stopColor="#E89B88" />
                    <stop offset="100%" stopColor="#A8C9A4" />
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
                  <stop offset="0%" stopColor="#E89B88" />
                  <stop offset="100%" stopColor="#A8C9A4" />
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
