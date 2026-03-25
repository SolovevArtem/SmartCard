// Self-hosted fonts (replaces Google Fonts — works in Russia)
import '@fontsource/merriweather/300.css';
import '@fontsource/merriweather/400.css';
import '@fontsource/merriweather/700.css';
import '@fontsource/merriweather/300-italic.css';
import '@fontsource/merriweather/400-italic.css';
import '@fontsource/montserrat/300.css';
import '@fontsource/montserrat/400.css';
import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700.css';
import { useState, useEffect, memo } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './Accordion';
import HeroScrollAnimation from './HeroScrollAnimation';
import TubeLightNav from './TubeLightNav';
import ProductCard from './ProductCard';
import CardView from './components/CardView';
import CardWizard from './components/CardWizard';
import { API_TIMEOUT_MS } from './constants';
import './App.css';

const STORES = [
  { name: 'OZON',        href: '#', logo: '/logos/ozon.svg'     },
  { name: 'Wildberries', href: '#', logo: '/logos/wb.svg'       },
  { name: 'Avito',       href: '#', logo: '/logos/avito.svg'    },
  { name: 'Telegram',    href: '#', logo: '/logos/telegram.svg' },
];

const PRODUCTS = [
  { imageUrl: '/card-1.png', title: 'Люби Твори Мечтай',  stores: STORES },
  { imageUrl: '/card-2.png', title: 'Смело Смотри Вперед', stores: STORES },
  { imageUrl: '/card-3.png', title: 'Сияй',                stores: STORES },
];

const API_URL = process.env.REACT_APP_API_URL || 'https://smartcard-production.up.railway.app';

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

// ── SVG Icons ──
const IconEnvelope = memo(() => (
  <svg className="step-svg-icon" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="14" width="40" height="28" rx="4" stroke="#ff7e5f" strokeWidth="2"/>
    <path d="M6 18l20 14 20-14" stroke="#feb47b" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="38" cy="16" r="6" fill="#ff7e5f" opacity="0.85"/>
    <path d="M35 16l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
));

const IconClapperboard = memo(() => (
  <svg className="step-svg-icon" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="18" width="40" height="26" rx="3" stroke="#ff7e5f" strokeWidth="2"/>
    <rect x="6" y="10" width="40" height="10" rx="2" stroke="#feb47b" strokeWidth="2"/>
    <line x1="14" y1="10" x2="18" y2="20" stroke="#feb47b" strokeWidth="2"/>
    <line x1="24" y1="10" x2="28" y2="20" stroke="#feb47b" strokeWidth="2"/>
    <line x1="34" y1="10" x2="38" y2="20" stroke="#feb47b" strokeWidth="2"/>
    <path d="M21 28l10 5-10 5V28z" fill="#ffcaa7" opacity="0.8"/>
  </svg>
));

const IconPhoneSpark = memo(() => (
  <svg className="step-svg-icon" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="14" y="6" width="20" height="36" rx="4" stroke="#ff7e5f" strokeWidth="2"/>
    <circle cx="24" cy="38" r="2" fill="#ff7e5f" opacity="0.7"/>
    <line x1="19" y1="10" x2="29" y2="10" stroke="#ff7e5f" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
    <path d="M38 12l2-4" stroke="#feb47b" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M42 16l4-2" stroke="#feb47b" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M40 20l4 1" stroke="#ffcaa7" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="40" cy="15" r="2" fill="#feb47b" opacity="0.9"/>
    <circle cx="36" cy="24" r="1.5" fill="#ffcaa7" opacity="0.7"/>
    <circle cx="44" cy="24" r="1" fill="#ff7e5f" opacity="0.6"/>
  </svg>
));

const IconVideo = memo(() => (
  <svg className="feature-svg-icon" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="9" width="24" height="18" rx="3" stroke="#ff7e5f" strokeWidth="1.8"/>
    <path d="M27 16l10-5v14l-10-5V16z" stroke="#feb47b" strokeWidth="1.8" strokeLinejoin="round"/>
  </svg>
));

const IconPhotos = memo(() => (
  <svg className="feature-svg-icon" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="8" width="24" height="20" rx="3" stroke="#ff7e5f" strokeWidth="1.8"/>
    <rect x="10" y="14" width="24" height="20" rx="3" stroke="#ffcaa7" strokeWidth="1.8" opacity="0.7"/>
    <circle cx="12" cy="16" r="2.5" fill="#feb47b" opacity="0.8"/>
    <path d="M4 24l6-5 5 5 4-4 9 8" stroke="#ff7e5f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
  </svg>
));

const IconMessage = memo(() => (
  <svg className="feature-svg-icon" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="6" width="32" height="22" rx="4" stroke="#feb47b" strokeWidth="1.8"/>
    <path d="M10 30l4-8h12l4 8" stroke="#feb47b" strokeWidth="1.5" strokeLinejoin="round" opacity="0.6"/>
    <line x1="10" y1="14" x2="30" y2="14" stroke="#ff7e5f" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
    <line x1="10" y1="20" x2="24" y2="20" stroke="#ff7e5f" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
  </svg>
));

const IconNoApp = memo(() => (
  <svg className="feature-svg-icon" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="4" width="20" height="32" rx="4" stroke="#ffcaa7" strokeWidth="1.8"/>
    <circle cx="20" cy="32" r="1.5" fill="#ffcaa7" opacity="0.7"/>
    <path d="M15 7h10" stroke="#ffcaa7" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
    <path d="M16 18l3 3 6-6" stroke="#feb47b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
));

// ── Social media icons ──
const IconTelegram = memo(() => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22">
    <path d="M22 2L11 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
));

const IconInstagram = memo(() => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22">
    <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.8"/>
    <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.8"/>
    <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor"/>
  </svg>
));

const IconOzon = memo(() => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22">
    <circle cx="12" cy="12" r="5.5" stroke="currentColor" strokeWidth="1.8"/>
    <ellipse cx="12" cy="12" rx="10.5" ry="4.5" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
));

const IconAvito = memo(() => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22">
    <circle cx="8" cy="9" r="3" stroke="currentColor" strokeWidth="1.7"/>
    <circle cx="16" cy="7" r="2" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="16" cy="15" r="2.5" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M8 12 L8 18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
  </svg>
));

const IconWildberries = memo(() => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22">
    <path d="M12 3 L20.5 12 L12 21 L3.5 12 Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
));

const TapeIcon = memo(() => (
  <svg viewBox="0 0 60 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="60" height="24">
    <rect x="0" y="0" width="60" height="24" rx="3" fill="#ce6a57" opacity="0.75"/>
    <rect x="0" y="0" width="60" height="24" rx="3" fill="url(#tapeShine)" opacity="0.3"/>
    <defs>
      <linearGradient id="tapeShine" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="white" stopOpacity="0.5"/>
        <stop offset="100%" stopColor="white" stopOpacity="0"/>
      </linearGradient>
    </defs>
  </svg>
));

// ── Hero SVG gift illustration ──
const HeroIllustration = memo(() => (
  <div className="hero-illustration" aria-hidden="true">
    <svg viewBox="0 0 220 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Box body */}
      <rect x="55" y="62" width="110" height="62" rx="5" stroke="#ff7e5f" strokeWidth="2" strokeOpacity="0.55"/>
      {/* Box lid */}
      <rect x="48" y="44" width="124" height="22" rx="4" stroke="#ff7e5f" strokeWidth="2" strokeOpacity="0.55"/>
      {/* Vertical ribbon */}
      <line x1="110" y1="44" x2="110" y2="124" stroke="#feb47b" strokeWidth="2.5" strokeOpacity="0.65"/>
      {/* Horizontal ribbon on lid */}
      <line x1="48" y1="55" x2="172" y2="55" stroke="#feb47b" strokeWidth="2.5" strokeOpacity="0.65"/>
      {/* Bow left loop */}
      <path d="M90 44 Q95 22 110 44" stroke="#ff7e5f" strokeWidth="2" strokeOpacity="0.8" fill="none"/>
      {/* Bow right loop */}
      <path d="M130 44 Q125 22 110 44" stroke="#ff7e5f" strokeWidth="2" strokeOpacity="0.8" fill="none"/>
      {/* Bow knot */}
      <circle cx="110" cy="44" r="4" fill="#feb47b" opacity="0.9"/>
      {/* Sparkles */}
      <circle cx="28"  cy="22" r="3.5" fill="#ffcaa7" opacity="0.55"/>
      <circle cx="192" cy="28" r="2.5" fill="#feb47b" opacity="0.65"/>
      <circle cx="18"  cy="80" r="2"   fill="#ff7e5f" opacity="0.45"/>
      <circle cx="198" cy="90" r="3"   fill="#ffcaa7" opacity="0.4"/>
      <circle cx="42"  cy="115" r="2"  fill="#feb47b" opacity="0.5"/>
      <circle cx="180" cy="115" r="2.5" fill="#ff7e5f" opacity="0.4"/>
      {/* Stars */}
      <text x="168" y="20" fontSize="15" fill="#feb47b" opacity="0.75" fontFamily="serif">✦</text>
      <text x="12"  y="48" fontSize="11" fill="#ff7e5f" opacity="0.65" fontFamily="serif">✦</text>
      <text x="172" y="108" fontSize="9" fill="#ffcaa7" opacity="0.55" fontFamily="serif">✦</text>
      <text x="36"  y="36" fontSize="9" fill="#ffcaa7" opacity="0.5" fontFamily="serif">✦</text>
    </svg>
  </div>
));

// ── View intro SVG (gift with sparkles) ──

// ── Главная страница (Лендинг) ──
function HomePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [navVisible, setNavVisible] = useState(false);
  const [activeCard, setActiveCard] = useState(null);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const target = document.getElementById('features');
    if (!target) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        setNavVisible(entry.isIntersecting || entry.boundingClientRect.top < 0);
      },
      { threshold: 0 }
    );
    obs.observe(target);
    return () => obs.disconnect();
  }, []);

  const handleCreate = async () => {
    setLoading(true);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
    try {
      const response = await fetch(`${API_URL}/api/cards/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal
      });
      const data = await response.json();
      if (data.success) {
        navigate(`/c/${data.cardId}`);
      } else {
        alert('Ошибка создания карточки: ' + data.error);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        alert('Сервер не ответил. Попробуйте ещё раз.');
      } else {
        console.error('Error creating card:', error);
        alert('Ошибка подключения к серверу');
      }
    } finally {
      clearTimeout(timer);
      setLoading(false);
    }
  };

  return (
    <>
    <TubeLightNav visible={navVisible} onScrollTo={scrollTo} />
    <div className="landing">

      <HeroScrollAnimation
        onCreateCard={handleCreate}
        onCardClick={(i) => {
          setTimeout(() => document.getElementById(`product-card-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
        }}
      />

      {/* ── Купить ── */}
      <section className="features-section" id="features">
        <FloatingParticles count={8} />
        <h2 className="section-title">Купить</h2>
        <div className="features-grid">
          {PRODUCTS.map((p, i) => (
            <div key={p.imageUrl} id={`product-card-${i}`}>
              <ProductCard
                imageUrl={p.imageUrl}
                title={p.title}
                stores={p.stores}
                isOpen={activeCard === i}
                onToggle={() => setActiveCard(activeCard === i ? null : i)}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="faq-section" id="faq">
        <FloatingParticles count={6} />
        <h2 className="section-title">Часто спрашивают</h2>
        <Accordion className="faq-accordion" type="single" collapsible>

          <AccordionItem value="q1">
            <AccordionTrigger>Как получатель открывает открытку?</AccordionTrigger>
            <AccordionContent>
              Просто наводит камеру на умный стикер на задней части открытки — или переходит по ссылке. Открытка загружается прямо в браузере за несколько секунд.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="q2">
            <AccordionTrigger>Нужно ли скачивать приложение?</AccordionTrigger>
            <AccordionContent>
              Нет. Всё работает в обычном браузере — Safari, Chrome, любом другом. Ни одной установки не требуется.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="q3">
            <AccordionTrigger>Сколько фото и видео можно добавить?</AccordionTrigger>
            <AccordionContent>
              До 10 фотографий и одно видео весом до 50 МБ. Этого хватит, чтобы рассказать целую историю.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="q4">
            <AccordionTrigger>Как долго будет доступна открытка?</AccordionTrigger>
            <AccordionContent>
              90 дней с момента создания. Этого достаточно для большинства поздравлений. Получатель может пересматривать сколько угодно раз в течение этого срока.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="q5">
            <AccordionTrigger>Подойдёт ли любой смартфон?</AccordionTrigger>
            <AccordionContent>
              Да — iPhone, Android, любое устройство с браузером. Видео воспроизводится автоматически, фото листаются свайпом.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="q6">
            <AccordionTrigger>Можно ли изменить содержимое после отправки?</AccordionTrigger>
            <AccordionContent>
              После публикации контент фиксируется. Поэтому перед отправкой есть режим предпросмотра — проверьте всё заранее.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="q7">
            <AccordionTrigger>Что такое физическая открытка и где её взять?</AccordionTrigger>
            <AccordionContent>
              Это бумажная открытка с умным стикером на обороте. Её можно купить у нас на Ozon, Wildberries или Avito. После покупки вы наполняете её своим видео, фото и посланием.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="q8">
            <AccordionTrigger>Как передать открытку получателю?</AccordionTrigger>
            <AccordionContent>
              Вложите физическую открытку в подарок или отдайте лично. Получатель сам откроет цифровое содержимое в нужный момент — всё будет ждать его внутри.
            </AccordionContent>
          </AccordionItem>

        </Accordion>
      </section>

      {/* ── Site Footer ── */}
      <footer className="site-footer" id="contacts">
        <div className="site-footer__card">
          <span className="site-footer__tape site-footer__tape--left"><TapeIcon /></span>
          <span className="site-footer__tape site-footer__tape--right"><TapeIcon /></span>
          <span className="site-footer__tape site-footer__tape--bottom-left"><TapeIcon /></span>
          <span className="site-footer__tape site-footer__tape--bottom-right"><TapeIcon /></span>

          <div className="site-footer__body">
            <div className="site-footer__brand-col">
              <p className="site-footer__brand">УМНАЯ ОТКРЫТКА</p>
              <p className="site-footer__tagline">Подарочные открытки с видео и музыкой</p>
              <div className="site-footer__social">
                <a href="https://t.me/smartcardgift" target="_blank" rel="noreferrer"
                   className="social-link" aria-label="Telegram">
                  <IconTelegram />
                </a>
                <a href="https://instagram.com/smartcardgift" target="_blank" rel="noreferrer"
                   className="social-link" aria-label="Instagram">
                  <IconInstagram />
                </a>
              </div>
            </div>

            <nav className="site-footer__nav">
              <button className="site-footer__nav-link"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                Главная страница
              </button>
              <button className="site-footer__nav-link" onClick={() => scrollTo('hsa-dark')}>
                Как это работает
              </button>
              <button className="site-footer__nav-link" onClick={() => scrollTo('faq')}>
                Часто задаваемые вопросы
              </button>
              <button className="site-footer__nav-link" onClick={() => scrollTo('features')}>
                Купить открытку
              </button>
            </nav>
          </div>
        </div>

        <p className="site-footer__copy">© {new Date().getFullYear()} Умная открытка</p>
      </footer>

    </div>
    </>
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
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
    try {
      const response = await fetch(`${API_URL}/api/cards/${cardId}`, {
        signal: controller.signal
      });
      const data = await response.json();
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
      clearTimeout(timer);
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
