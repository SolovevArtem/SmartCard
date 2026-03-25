import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CardView from './CardView';
import CardWizard from './CardWizard';
import { getCard } from '../api';

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
      const data = await getCard(cardId);
      if (data.success) {
        setCard(data.card);
      } else {
        setError(data.error || 'Карточка не найдена');
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('timeout');
      } else {
        console.error('Error loading card:', err);
        setError('Ошибка подключения к серверу');
      }
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
    const isTimeout = error === 'timeout';
    return (
      <div className="error-screen">
        <h2>{isTimeout ? '⏱ Долгое ожидание' : '❌ Ошибка'}</h2>
        <p>
          {isTimeout
            ? 'Сервер не ответил вовремя. Возможно, медленный интернет.'
            : error}
        </p>
        <button onClick={() => { setError(null); setLoading(true); loadCard(); }}>
          🔄 Попробовать ещё раз
        </button>
        <button onClick={() => window.location.href = '/'} style={{ marginTop: '0.5rem' }}>
          На главную
        </button>
      </div>
    );
  }

  if (card.status === 'filled') {
    return <CardView card={card} />;
  }

  return <CardWizard cardId={cardId} onComplete={loadCard} />;
}

export default CardPage;
