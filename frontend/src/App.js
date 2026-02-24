import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import './App.css';

// API URL из переменных окружения
const API_URL = process.env.REACT_APP_API_URL || 'https://smartcard-production.up.railway.app';

console.log('🔍 Using API_URL:', API_URL);

// Главная страница
function HomePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleCreateDemo = async () => {
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
    <div className="homepage">
      <div className="hero">
        <p className="hero-eyebrow">NFC · Видео · Моменты</p>
        <h1>ВидеоМиг</h1>
        <p className="subtitle">Моменты, которые остаются навсегда</p>
        <p className="description">
          Создайте уникальное видео-поздравление с помощью NFC-карточки
        </p>
        <button
          className="cta-button"
          onClick={handleCreateDemo}
          disabled={loading}
        >
          {loading ? 'Создаем...' : 'Попробовать демо'}
        </button>
      </div>
    </div>
  );
}

// Страница карточки
function CardPage() {
  const { cardId } = useParams();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Форма
  const [senderName, setSenderName] = useState('');
  const [message, setMessage] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [photoFiles, setPhotoFiles] = useState([]);

  // Загрузка данных карточки
  useEffect(() => {
    loadCard();
  }, [cardId]);

  const loadCard = async () => {
    try {
      console.log('Loading card:', cardId);
      const response = await fetch(`${API_URL}/api/cards/${cardId}`);
      const data = await response.json();
      
      console.log('Card data:', data);
      
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!videoFile) {
      alert('Пожалуйста, загрузите видео');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('senderName', senderName);
      formData.append('message', message);
      formData.append('video', videoFile);
      
      photoFiles.forEach((photo, index) => {
        formData.append('photos', photo);
      });

      const response = await fetch(`${API_URL}/api/cards/${cardId}/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        alert('✅ Поздравление успешно сохранено!');
        loadCard(); // Перезагрузить данные карточки
      } else {
        alert('Ошибка: ' + data.error);
      }
    } catch (error) {
      console.error('Error uploading:', error);
      alert('Ошибка загрузки. Попробуйте еще раз.');
    } finally {
      setUploading(false);
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
        <button onClick={() => window.location.href = '/'}>
          На главную
        </button>
      </div>
    );
  }

  // Если карточка заполнена - показываем просмотр
  if (card.status === 'filled') {
    return (
      <div className="card-view">
        <div className="card-header">
          <h1>ВидеоМиг</h1>
          <p className="from">От <span>{card.sender_name}</span></p>
        </div>
        
        <div className="card-content">
          {card.video_url && (
            <div className="video-container">
              <video controls>
                <source src={card.video_url} type="video/mp4" />
                Ваш браузер не поддерживает видео
              </video>
            </div>
          )}
          
          {card.message && (
            <div className="message-box">
              <p>{card.message}</p>
            </div>
          )}
          
          {card.photos_urls && card.photos_urls.length > 0 && (
            <div className="photos-grid">
              {card.photos_urls.map((url, index) => (
                <img key={index} src={url} alt={`Фото ${index + 1}`} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Если карточка активна - показываем форму создания
  return (
    <div className="card-form">
      <div className="form-header">
        <h1>ВидеоМиг</h1>
        <p className="subtitle">Создайте видео-поздравление</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Ваше имя</label>
          <input
            type="text"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            placeholder="Иван Иванов"
            required
          />
        </div>

        <div className="form-group">
          <label>Видео-поздравление *</label>
          <div className="file-upload">
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files[0])}
              required
            />
            {videoFile && (
              <p className="file-name">
                ✅ {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(1)} MB)
              </p>
            )}
          </div>
          <small>Максимум 50 MB</small>
        </div>

        <div className="form-group">
          <label>Фотографии (опционально)</label>
          <div className="file-upload">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setPhotoFiles(Array.from(e.target.files))}
            />
            {photoFiles.length > 0 && (
              <p className="file-name">
                ✅ Выбрано фото: {photoFiles.length}
              </p>
            )}
          </div>
          <small>До 10 фотографий</small>
        </div>

        <div className="form-group">
          <label>Текст поздравления</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Напишите ваше поздравление..."
            rows="4"
          />
        </div>

        <button 
          type="submit" 
          className="submit-button"
          disabled={uploading}
        >
          {uploading ? 'Загрузка...' : 'Сохранить поздравление'}
        </button>
      </form>
    </div>
  );
}

// Главный компонент приложения
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
