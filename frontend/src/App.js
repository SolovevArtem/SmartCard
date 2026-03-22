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
import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './Accordion';
import HeroScrollAnimation from './HeroScrollAnimation';
import TubeLightNav from './TubeLightNav';
import ProductCard from './ProductCard';
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
    const timer = setTimeout(() => controller.abort(), 9000);
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

      <HeroScrollAnimation onCreateCard={handleCreate} />

      {/* ── Купить ── */}
      <section className="features-section" id="features">
        <FloatingParticles count={8} />
        <h2 className="section-title">Купить</h2>
        <div className="features-grid">
          {PRODUCTS.map((p, i) => (
            <ProductCard
              key={p.imageUrl}
              imageUrl={p.imageUrl}
              title={p.title}
              stores={p.stores}
              isOpen={activeCard === i}
              onToggle={() => setActiveCard(activeCard === i ? null : i)}
            />
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

// ── Просмотр заполненной карточки ──
function CardView({ card }) {
  const videoRef = useRef(null);
  const sectionRef = useRef(null);
  const [scrollProg, setScrollProg] = useState(0);
  const [trackIndex, setTrackIndex] = useState(1);
  const [carouselAnimate, setCarouselAnimate] = useState(true);
  const [saving, setSaving] = useState(false);
  const autoTimer = useRef(null);
  const touchStartX = useRef(null);
  const photos = card.photos_urls || [];
  const N = photos.length;
  const realPhoto = trackIndex <= 0 ? N - 1
                  : trackIndex >= N + 1 ? 0
                  : trackIndex - 1;

  // Scroll-parallax progress
  useEffect(() => {
    const onScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      const scrollable = el.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const prog = Math.max(0, Math.min(1, (window.scrollY - top) / scrollable));
      setScrollProg(prog);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Автоплей видео через 4с
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

  // Авто-карусель
  const resetAutoRotate = useCallback(() => {
    if (N <= 1) return;
    clearTimeout(autoTimer.current);
    autoTimer.current = setTimeout(() => {
      setCarouselAnimate(true);
      setTrackIndex(i => i + 1);
    }, 4000);
  }, [N]);

  useEffect(() => {
    resetAutoRotate();
    return () => clearTimeout(autoTimer.current);
  }, [trackIndex, resetAutoRotate]);

  const prevPhoto = () => { setCarouselAnimate(true); setTrackIndex(i => i - 1); };
  const nextPhoto = () => { setCarouselAnimate(true); setTrackIndex(i => i + 1); };

  const handleTransitionEnd = (e) => {
    if (e.propertyName !== 'transform') return;
    if (trackIndex === 0)          { setCarouselAnimate(false); setTrackIndex(N); }
    else if (trackIndex === N + 1) { setCarouselAnimate(false); setTrackIndex(1); }
  };

  useEffect(() => {
    if (!carouselAnimate) {
      const raf = requestAnimationFrame(() =>
        requestAnimationFrame(() => setCarouselAnimate(true))
      );
      return () => cancelAnimationFrame(raf);
    }
  }, [carouselAnimate]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    resetAutoRotate();
  };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? nextPhoto() : prevPhoto();
    touchStartX.current = null;
  };

  const saveToLibrary = async (url, filename) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      if (navigator.share && navigator.canShare) {
        const ext = blob.type.includes('video') ? 'mp4' : 'jpg';
        const file = new File([blob], filename || `media.${ext}`, { type: blob.type });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file] });
          return;
        }
      }
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = filename || 'photo.jpg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      if (err?.name !== 'AbortError') window.open(url, '_blank');
    }
  };

  const saveAllPhotos = async () => {
    if (photos.length === 0) return;
    setSaving(true);
    try {
      if (navigator.share && navigator.canShare) {
        const files = await Promise.all(
          photos.map(async (url, i) => {
            const res = await fetch(url);
            const blob = await res.blob();
            return new File([blob], `photo-${i + 1}.jpg`, { type: blob.type });
          })
        );
        if (navigator.canShare({ files })) {
          await navigator.share({ files });
          return;
        }
      }
      for (let i = 0; i < photos.length; i++) {
        await saveToLibrary(photos[i], `photo-${i + 1}.jpg`);
      }
    } catch (err) {
      if (err?.name !== 'AbortError') console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  // Scroll-driven card position (translateY: 0 → -300px = card emerges from envelope)
  const cardY = -(scrollProg * 300);
  // Front mask fades out as card fully covers the envelope
  const maskOpacity = Math.max(0, 1 - Math.max(0, scrollProg - 0.6) / 0.4);
  const scrollHintOpacity = Math.max(0, 1 - scrollProg * 8);

  return (
    <div className="env-page">

      {/* ── Section 1: Intro text (sticky, 150vh) ── */}
      <div className="env-intro-section">
        <div className="env-intro-sticky">
          <div className="env-intro-text">
            <span className="env-intro-surprise">✦ Для вас особый сюрприз</span>
            <h1 className="env-intro-name">{card.sender_name}</h1>
            <p className="env-intro-tagline">подготовил(а) для вас что-то особенное</p>
          </div>
          <div className="env-scroll-hint" aria-hidden="true">↓</div>
        </div>
      </div>

      {/* ── Section 2: Envelope + single flying card (200vh) ── */}
      <div className="env-scroll-section" ref={sectionRef}>
        <div className="env-sticky">

          <div className="env-scene">

            {/* SVG envelope body */}
            <svg className="env-svg" viewBox="0 0 488 362" fill="none" preserveAspectRatio="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 361.319H487.923L273.123 174.97C273.123 174.97 267.524 171.361 260.321 168.206C254.502 165.658 247.636 163.405 241.828 163.589C236.718 163.752 230.781 165.853 225.656 168.206C218.787 171.361 213.377 174.97 213.377 174.97L0 361.319Z" fill="#88CCFF"/>
              <path d="M0 0V361.319L213.377 174.97C213.377 174.97 218.787 171.361 225.656 168.206L0 0Z" fill="#9FD6FF"/>
              <path d="M487.923 361.319V0L260.321 168.206C267.524 171.361 273.123 174.97 273.123 174.97L487.923 361.319Z" fill="#9FD6FF"/>
            </svg>

            {/* Open flap */}
            <svg className="env-flap" viewBox="0 0 488 377" fill="none" preserveAspectRatio="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
              <path d="M487.923 202.01H0L225.656 377C225.656 377 230.781 374.862 236.718 372.761C241.828 372.599C247.636 372.415 254.502 374.667 260.321 377L487.923 202.01Z" fill="#BBE2FF"/>
              <path d="M0 202.01H487.923L273.123 14.2375C273.123 14.2375 255.244 -0.484578 241.828 0.0123003C229.414 0.472058 213.377 14.2375 213.377 14.2375L0 202.01Z" fill="#BBE2FF"/>
            </svg>

            {/* Single flying card — full envelope width, emerges and covers */}
            <div
              className="env-card env-card-main"
              style={{ transform: `translateY(${cardY}px)`, willChange: 'transform' }}
            />

            {/* Front mask — fades as card fully covers the envelope */}
            <div className="env-front-mask" style={{ opacity: maskOpacity }} />

          </div>

          <div
            className="env-scroll-hint"
            style={{ opacity: scrollHintOpacity }}
            aria-hidden="true"
          >↓</div>

        </div>
      </div>

      {/* ── Section 3: Card content (text → photos → video) ── */}
      <div className="env-content">
        <div className="env-content-card">

          {card.message && (
            <div className="env-content-message">
              <div className="env-card-1-bar" />
              <p className="env-card-1-text">{card.message}</p>
              <p className="env-card-1-from">— {card.sender_name}</p>
            </div>
          )}

          {photos.length > 0 && (
            <div className="env-content-photos">
              <div
                className="carousel-wrapper"
                onMouseMove={resetAutoRotate}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                {photos.length === 1 ? (
                  <img src={photos[0]} alt="Фото" className="carousel-slide env-content-single-photo" loading="eager" />
                ) : (
                  <>
                    <div className="carousel-track-container">
                      <div
                        className="carousel-track"
                        style={{
                          transform: `translateX(-${trackIndex * 100}%)`,
                          transition: carouselAnimate ? undefined : 'none',
                        }}
                        onTransitionEnd={handleTransitionEnd}
                      >
                        <img key="clone-last" src={photos[N - 1]} alt="" className="carousel-slide" aria-hidden="true" loading="lazy" />
                        {photos.map((url, i) => (
                          <img key={i} src={url} alt={`Фото ${i + 1}`} className="carousel-slide" loading={i === 0 ? 'eager' : 'lazy'} />
                        ))}
                        <img key="clone-first" src={photos[0]} alt="" className="carousel-slide" aria-hidden="true" loading="lazy" />
                      </div>
                    </div>
                    <div className="carousel-controls">
                      <button className="carousel-btn" onClick={prevPhoto} aria-label="Предыдущее фото">‹</button>
                      <div className="carousel-dots">
                        {photos.map((_, i) => (
                          <span
                            key={i}
                            className={`carousel-dot ${i === realPhoto ? 'active' : ''}`}
                            onClick={() => { setCarouselAnimate(true); setTrackIndex(i + 1); }}
                            aria-label={`Фото ${i + 1}`}
                          />
                        ))}
                      </div>
                      <button className="carousel-btn" onClick={nextPhoto} aria-label="Следующее фото">›</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {card.video_url && (
            <div className="env-content-video">
              <video ref={videoRef} controls playsInline muted className="env-content-video-player">
                <source src={card.video_url} type="video/mp4" />
              </video>
            </div>
          )}

        </div>
      </div>

      {/* Floating save button */}
      {photos.length > 0 && (
        <button
          className={`save-all-btn${saving ? ' save-all-btn--loading' : ''}`}
          onClick={saveAllPhotos}
          disabled={saving}
          aria-label="Сохранить все фото в галерею"
        >
          {saving ? (
            <>
              <span className="save-all-spinner" />
              Сохраняем…
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Сохранить фото
            </>
          )}
        </button>
      )}
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
      // Attempt presigned URL upload flow
      let usedPresigned = false;
      try {
        const urlRes = await fetch(`${API_URL}/api/cards/${cardId}/upload-url`);
        if (urlRes.ok) {
          const urlData = await urlRes.json();
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

            // Upload each photo directly to S3
            const finalPhotoUrls = [];
            for (let i = 0; i < photoFiles.length; i++) {
              const photo = photoFiles[i];
              const photoRes = await fetch(urlData.photoUploadUrls[i], {
                method: 'PUT',
                body: photo,
                headers: { 'Content-Type': photo.type || 'image/jpeg' }
              });
              if (!photoRes.ok) throw new Error(`Photo ${i} upload to S3 failed`);
              finalPhotoUrls.push(urlData.photoUploadUrls[i].split('?')[0]);
            }

            // Confirm upload
            const confirmRes = await fetch(`${API_URL}/api/cards/${cardId}/confirm-upload`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                senderName,
                message,
                videoUrl: finalVideoUrl,
                photoUrls: finalPhotoUrls
              })
            });
            const confirmData = await confirmRes.json();
            if (confirmData.success) {
              onComplete();
              return;
            }
            throw new Error(confirmData.error || 'Confirm upload failed');
          }
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
    const timer = setTimeout(() => controller.abort(), 9000);
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
