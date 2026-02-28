import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'https://smartcard-production.up.railway.app';

console.log('🔍 Using API_URL:', API_URL);

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
          <span className="logo-icon">🎁</span>
          <span className="logo-text">OneTapGift</span>
        </div>
        <button className="nav-cta" onClick={handleCreate} disabled={loading}>
          {loading ? '...' : 'Создать →'}
        </button>
      </nav>

      {/* ── Hero ── */}
      <section className="hero-section">
        <h1 className="hero-title">Подарите незабываемые впечатления</h1>
        <p className="hero-sub">Открытка, которая оживает в руках адресата</p>
        <button className="cta-button" onClick={handleCreate} disabled={loading}>
          {loading ? 'Создаём...' : 'Начать бесплатно'}
        </button>
      </section>

      {/* ── Как это работает ── */}
      <section className="how-section">
        <h2 className="section-title">Как это работает</h2>
        <div className="steps-row">
          <div className="step-card">
            <div className="step-badge">1</div>
            <div className="step-icon">📮</div>
            <h3>Приложи открытку к телефону</h3>
            <p>Создай и оформи свою уникальную открытку</p>
          </div>

          <div className="steps-arrow" aria-hidden="true">→</div>

          <div className="step-card">
            <div className="step-badge">2</div>
            <div className="step-icon">🎬</div>
            <h3>Добавь видео и фото</h3>
            <p>Загрузи воспоминания и личное поздравление</p>
          </div>

          <div className="steps-arrow" aria-hidden="true">→</div>

          <div className="step-card">
            <div className="step-badge">3</div>
            <div className="step-icon">✨</div>
            <h3>Наведи телефон на открытку</h3>
            <p>Адресат видит живую анимированную открытку</p>
          </div>
        </div>
      </section>

      {/* ── Возможности ── */}
      <section className="features-section">
        <h2 className="section-title">Возможности</h2>
        <div className="features-grid">
          <div className="feature-card">
            <span>🎥</span>
            <h3>Видео в открытке</h3>
            <p>Оживи поздравление личным видео</p>
          </div>
          <div className="feature-card">
            <span>📸</span>
            <h3>Фото-галерея</h3>
            <p>Целая история воспоминаний в одной открытке</p>
          </div>
          <div className="feature-card">
            <span>✍️</span>
            <h3>Личное сообщение</h3>
            <p>Тёплые слова прямо от тебя</p>
          </div>
          <div className="feature-card">
            <span>📱</span>
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
        <span className="intro-gift" aria-hidden="true">🎁</span>
        <p className="intro-surprise">✨ Для вас особый сюрприз</p>
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
          <span className="wizard-welcome-icon">🎁</span>
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
