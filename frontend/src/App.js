import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import './App.css';

// API конфигурация
  const API_BASE = process.env.REACT_APP_API_URL || 'https://smartcard-production.up.railway.app';

// Главная страница (лендинг)
function HomePage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleDemoClick = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/cards/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      
      if (data.success) {
        navigate(data.url);
      }
    } catch (error) {
      console.error('Error creating demo card:', error);
      alert('Ошибка создания карточки. Попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="home-page">
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">
            <span className="logo-icon">📹</span>
            <span className="logo-text">ВидеоМиг</span>
          </div>
          <button className="nav-button">Создать открытку</button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">Открытки нового поколения</div>
          <h1 className="hero-title">
            Моменты, которые
            <span className="hero-title-accent"> не забываются</span>
          </h1>
          <p className="hero-description">
            Создайте видео-открытку с вашим персональным поздравлением. 
            Просто приложите телефон к карточке — и магия оживёт.
          </p>
          <div className="hero-actions">
            <button 
              className="cta-button primary"
              onClick={handleDemoClick}
              disabled={isLoading}
            >
              {isLoading ? 'Создаём...' : 'Попробовать демо'}
            </button>
            <button className="cta-button secondary">
              Как это работает?
            </button>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <div className="stat-value">15 сек</div>
              <div className="stat-label">Создать поздравление</div>
            </div>
            <div className="stat">
              <div className="stat-value">∞</div>
              <div className="stat-label">Эмоций и впечатлений</div>
            </div>
            <div className="stat">
              <div className="stat-value">0₽</div>
              <div className="stat-label">Попробовать сейчас</div>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="phone-mockup">
            <div className="phone-screen">
              <div className="video-preview">
                <div className="play-icon">▶</div>
              </div>
            </div>
          </div>
          <div className="floating-card card-1">
            <div className="card-content">💝</div>
          </div>
          <div className="floating-card card-2">
            <div className="card-content">🎂</div>
          </div>
          <div className="floating-card card-3">
            <div className="card-content">💐</div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="features-container">
          <div className="section-header">
            <h2 className="section-title">Почему ВидеоМиг?</h2>
            <p className="section-subtitle">
              Современные технологии для самых теплых чувств
            </p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">✨</div>
              <h3 className="feature-title">Просто волшебство</h3>
              <p className="feature-text">
                Приложите телефон к открытке — и ваше видео-поздравление оживёт. 
                Без приложений и регистрации.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🎬</div>
              <h3 className="feature-title">Ваша история</h3>
              <p className="feature-text">
                Запишите видео, добавьте фото и текст. Создайте уникальное 
                поздравление за пару минут.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">💎</div>
              <h3 className="feature-title">Навсегда в памяти</h3>
              <p className="feature-text">
                Открытки обычно выбрасывают. Эту будут хранить годами, 
                пересматривая снова и снова.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3 className="feature-title">Любой повод</h3>
              <p className="feature-text">
                День рождения, свадьба, рождение ребёнка, 14 февраля — 
                создайте открытку для любого события.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <div className="hiw-container">
          <h2 className="section-title">Как это работает?</h2>
          
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3 className="step-title">Закажите открытку</h3>
                <p className="step-text">
                  Выберите дизайн и получите открытку с NFC-чипом и QR-кодом
                </p>
              </div>
            </div>
            
            <div className="step-arrow">→</div>
            
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3 className="step-title">Создайте поздравление</h3>
                <p className="step-text">
                  Отсканируйте QR или приложите телефон к NFC. 
                  Загрузите видео, фото и текст.
                </p>
              </div>
            </div>
            
            <div className="step-arrow">→</div>
            
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3 className="step-title">Подарите эмоцию</h3>
                <p className="step-text">
                  Получатель прикладывает телефон — и сразу видит ваше видео-поздравление
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-container">
          <h2 className="cta-title">Готовы создать незабываемый подарок?</h2>
          <p className="cta-text">
            Попробуйте демо-версию прямо сейчас — это бесплатно и занимает всего минуту
          </p>
          <button 
            className="cta-button primary large"
            onClick={handleDemoClick}
            disabled={isLoading}
          >
            {isLoading ? 'Создаём...' : 'Создать открытку'}
          </button>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-brand">
            <div className="logo">
              <span className="logo-icon">📹</span>
              <span className="logo-text">ВидеоМиг</span>
            </div>
            <p className="footer-tagline">Моменты, которые не забываются</p>
          </div>
          <div className="footer-links">
            <a href="#about">О нас</a>
            <a href="#pricing">Цены</a>
            <a href="#contact">Контакты</a>
            <a href="#faq">FAQ</a>
          </div>
          <div className="footer-social">
            <a href="#instagram" className="social-link">Instagram</a>
            <a href="#telegram" className="social-link">Telegram</a>
            <a href="#vk" className="social-link">ВКонтакте</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 ВидеоМиг. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
}

// Страница карточки
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
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/cards/${cardId}`);
      const data = await response.json();
      
      if (data.success) {
        setCard(data.card);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Ошибка загрузки карточки');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card-page loading">
        <div className="spinner"></div>
        <p>Загрузка...</p>
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="card-page error">
        <h2>❌ Карточка не найдена</h2>
        <p>{error || 'Проверьте правильность ссылки'}</p>
        <button onClick={() => window.location.href = '/'}>
          На главную
        </button>
      </div>
    );
  }

  // Если карточка новая или активная -> показываем форму создания
  // (статус 'new' автоматически меняется на 'active' в API)
  if (card.status === 'new' || card.status === 'active') {
    return <CreateGreeting cardId={cardId} onSuccess={loadCard} />;
  }

  // Если карточка заполнена -> показываем просмотр
  if (card.status === 'filled') {
    return <ViewGreeting card={card} />;
  }

  // Неизвестный статус
  return (
    <div className="card-page error">
      <h2>⚠️ Неизвестный статус карточки</h2>
      <p>Обратитесь в поддержку</p>
    </div>
  );
}

// Страница создания поздравления
function CreateGreeting({ cardId, onSuccess }) {
  const [formData, setFormData] = useState({
    senderName: '',
    message: '',
    video: null,
    photos: []
  });
  const [uploading, setUploading] = useState(false);
  const [videoPreview, setVideoPreview] = useState(null);
  const [photosPreviews, setPhotosPreviews] = useState([]);

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, video: file });
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handlePhotosChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 10);
    setFormData({ ...formData, photos: files });
    setPhotosPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.video) {
      alert('Пожалуйста, загрузите видео');
      return;
    }

    setUploading(true);
    
    try {
      const data = new FormData();
      data.append('video', formData.video);
      data.append('senderName', formData.senderName);
      data.append('message', formData.message);
      
      formData.photos.forEach(photo => {
        data.append('photos', photo);
      });

      const response = await fetch(`${API_BASE}/api/cards/${cardId}/upload`, {
        method: 'POST',
        body: data
      });

      const result = await response.json();
      
      if (result.success) {
        onSuccess();
      } else {
        alert('Ошибка: ' + result.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Ошибка загрузки. Попробуйте позже.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="create-greeting">
      <div className="create-container">
        <div className="create-header">
          <h1>Создайте ваше поздравление</h1>
          <p>Загрузите видео, фото и добавьте личное сообщение</p>
        </div>

        <form onSubmit={handleSubmit} className="create-form">
          <div className="form-group">
            <label>Ваше имя</label>
            <input
              type="text"
              value={formData.senderName}
              onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
              placeholder="Как вас зовут?"
              required
            />
          </div>

          <div className="form-group">
            <label>Видео-поздравление *</label>
            <div className="upload-area video-upload">
              {videoPreview ? (
                <div className="preview-container">
                  <video src={videoPreview} controls className="video-preview" />
                  <button 
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, video: null });
                      setVideoPreview(null);
                    }}
                    className="remove-btn"
                  >
                    Удалить
                  </button>
                </div>
              ) : (
                <label className="upload-label">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    style={{ display: 'none' }}
                  />
                  <div className="upload-placeholder">
                    <div className="upload-icon">🎬</div>
                    <div className="upload-text">
                      <strong>Нажмите для загрузки видео</strong>
                      <span>или перетащите файл сюда</span>
                    </div>
                  </div>
                </label>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Фотографии (до 10 шт.)</label>
            <div className="upload-area photos-upload">
              {photosPreviews.length > 0 ? (
                <div className="photos-grid">
                  {photosPreviews.map((preview, idx) => (
                    <div key={idx} className="photo-preview">
                      <img src={preview} alt={`Фото ${idx + 1}`} />
                    </div>
                  ))}
                </div>
              ) : (
                <label className="upload-label">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotosChange}
                    style={{ display: 'none' }}
                  />
                  <div className="upload-placeholder small">
                    <div className="upload-icon">📷</div>
                    <div className="upload-text">
                      <strong>Добавить фотографии</strong>
                    </div>
                  </div>
                </label>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Текст поздравления</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Напишите что-то от души..."
              rows={6}
            />
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={uploading}
          >
            {uploading ? 'Загрузка...' : 'Сохранить поздравление'}
          </button>
        </form>
      </div>
    </div>
  );
}

// Страница просмотра поздравления
function ViewGreeting({ card }) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="view-greeting">
      <div className="greeting-container">
        <div className="greeting-header">
          <div className="sender-info">
            <div className="sender-avatar">
              {card.senderName ? card.senderName[0].toUpperCase() : '💝'}
            </div>
            <div>
              <div className="sender-name">
                {card.senderName || 'Кто-то особенный'}
              </div>
              <div className="sender-subtitle">отправил вам поздравление</div>
            </div>
          </div>
        </div>

        {card.video && (
          <div className="video-section">
            <video
              src={API_BASE + card.video}
              controls
              autoPlay
              className="greeting-video"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          </div>
        )}

        {card.message && (
          <div className="message-section">
            <div className="message-icon">💌</div>
            <p className="message-text">{card.message}</p>
          </div>
        )}

        {card.photos && card.photos.length > 0 && (
          <div className="photos-section">
            <h3>Фотографии</h3>
            <div className="photos-gallery">
              {card.photos.map((photo, idx) => (
                <div key={idx} className="gallery-photo">
                  <img src={API_BASE + photo} alt={`Фото ${idx + 1}`} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="greeting-footer">
          <div className="brand-badge">
            <span className="logo-icon">📹</span>
            <span>Сделано с ❤️ через ВидеоМиг</span>
          </div>
          <button 
            className="create-own-btn"
            onClick={() => window.location.href = '/'}
          >
            Создать свою открытку
          </button>
        </div>
      </div>
    </div>
  );
}

// Главный App компонент
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/c/:cardId" element={<CardPage />} />
      </Routes>
    </Router>
  );
}

export default App;
