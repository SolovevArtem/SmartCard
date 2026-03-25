import { useEffect, useRef, useCallback, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function CardView({ card }) {
  const containerRef = useRef(null);
  const [trackIndex, setTrackIndex] = useState(1);
  const [carouselAnimate, setCarouselAnimate] = useState(true);
  const autoTimer = useRef(null);
  const touchStartX = useRef(null);
  const videoRef = useRef(null);

  const photos = card.photos_urls || [];
  const N = photos.length;
  const realPhoto = trackIndex <= 0 ? N - 1 : trackIndex >= N + 1 ? 0 : trackIndex - 1;

  // Carousel
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

  useEffect(() => {
    if (!carouselAnimate) {
      const raf = requestAnimationFrame(() =>
        requestAnimationFrame(() => setCarouselAnimate(true))
      );
      return () => cancelAnimationFrame(raf);
    }
  }, [carouselAnimate]);

  const prevPhoto = useCallback(() => { setCarouselAnimate(true); setTrackIndex(i => i - 1); }, []);
  const nextPhoto = useCallback(() => { setCarouselAnimate(true); setTrackIndex(i => i + 1); }, []);

  const handleTransitionEnd = (e) => {
    if (e.propertyName !== 'transform') return;
    if (trackIndex === 0)         { setCarouselAnimate(false); setTrackIndex(N); }
    else if (trackIndex === N + 1) { setCarouselAnimate(false); setTrackIndex(1); }
  };

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; resetAutoRotate(); };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? nextPhoto() : prevPhoto();
    touchStartX.current = null;
  };

  // GSAP scroll-driven cinematic timeline
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial states
      gsap.set('.cv-hero-inner',  { autoAlpha: 0, y: 50 });
      gsap.set('.cv-card',        { y: window.innerHeight + 150, borderRadius: '32px' });
      gsap.set('.cv-card-bar',    { scaleX: 0, transformOrigin: 'left center' });
      gsap.set('.cv-msg',         { autoAlpha: 0, y: 40 });
      gsap.set('.cv-photos',      { autoAlpha: 0, x: -50 });
      gsap.set('.cv-video',       { autoAlpha: 0, scale: 0.93 });
      gsap.set('.cv-cta',         { autoAlpha: 0 });
      gsap.set('.cv-cta-title',   { autoAlpha: 0, y: 30 });
      gsap.set('.cv-cta-sub',     { autoAlpha: 0, y: 20 });
      gsap.set('.cv-cta-btns',    { autoAlpha: 0, y: 20 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=5500',
          pin: true,
          scrub: 1.2,
          anticipatePin: 1,
        },
      });

      // ── Фаза 1: Hero появляется ──────────────────────────────
      tl.to('.cv-hero-inner', { autoAlpha: 1, y: 0, duration: 2, ease: 'power3.out' })
        .to({}, { duration: 3 }) // пауза

      // ── Фаза 2: Hero уходит, карточка влетает снизу ──────────
        .to('.cv-hero-inner', { autoAlpha: 0, y: -40, duration: 1.5, ease: 'power2.in' })
        .to('.cv-card', {
          y: 0,
          duration: 2.5,
          ease: 'power3.inOut',
        }, '<+0.3')
        .to('.cv-card', {
          width: '100%',
          height: '100vh',
          borderRadius: '0px',
          duration: 1.8,
          ease: 'power3.inOut',
        })
        .to('.cv-card-bar', { scaleX: 1, duration: 1, ease: 'power2.inOut' })

      // Контент последовательно
        .to('.cv-msg',    { autoAlpha: 1, y: 0,    duration: 1.5, ease: 'power3.out' })
        .to('.cv-photos', { autoAlpha: 1, x: 0,    duration: 1.5, ease: 'power3.out' }, '+=0.8')
        .to('.cv-video',  { autoAlpha: 1, scale: 1, duration: 1.5, ease: 'power3.out' }, '+=0.8')
        .to({}, { duration: 3 }) // пауза — пользователь смотрит

      // ── Фаза 3: карточка уходит, CTA ─────────────────────────
        .to('.cv-card', {
          y: -(window.innerHeight + 200),
          duration: 2,
          ease: 'power3.in',
        })
        .to('.cv-cta',       { autoAlpha: 1, duration: 0.1 }, '<+0.5')
        .to('.cv-cta-title', { autoAlpha: 1, y: 0, duration: 1.5, ease: 'expo.out' }, '<')
        .to('.cv-cta-sub',   { autoAlpha: 1, y: 0, duration: 1.5, ease: 'expo.out' }, '<+0.3')
        .to('.cv-cta-btns',  { autoAlpha: 1, y: 0, duration: 1.5, ease: 'back.out(1.5)' }, '<+0.3');

    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Autoplay video once it's visible
  useEffect(() => {
    if (!card.video_url || !videoRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoRef.current.muted = true;
          videoRef.current.play().catch(() => {});
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, [card.video_url]);

  return (
    <div className="cv-page">
      <div className="cv-container" ref={containerRef}>
        <div className="cv-sticky">

          {/* Фон */}
          <div className="cv-bg" />

          {/* ── Фаза 1: Hero ─────────────────────────────── */}
          <div className="cv-hero">
            <div className="cv-hero-inner">
              <span className="cv-hero-eyebrow">✦ Для вас особый сюрприз</span>
              <h1 className="cv-hero-name">{card.sender_name}</h1>
              <p className="cv-hero-tagline">подготовил(а) для вас что‑то особенное</p>
              <div className="cv-hero-hint">↓ прокрутите</div>
            </div>
          </div>

          {/* ── Фаза 2: Карточка с контентом ─────────────── */}
          <div className="cv-card">
            <div className="cv-card-bar" />
            <div className="cv-card-inner">

              {card.message && (
                <div className="cv-msg">
                  <p className="cv-msg-text">«&thinsp;{card.message}&thinsp;»</p>
                  <p className="cv-msg-from">— {card.sender_name}</p>
                </div>
              )}

              {photos.length > 0 && (
                <div className="cv-photos">
                  {photos.length === 1 ? (
                    <img src={photos[0]} alt="Фото" className="cv-single-photo" loading="eager" />
                  ) : (
                    <div
                      className="cv-carousel"
                      onMouseMove={resetAutoRotate}
                      onTouchStart={handleTouchStart}
                      onTouchEnd={handleTouchEnd}
                    >
                      <div className="cv-carousel-track-wrap">
                        <div
                          className="cv-carousel-track"
                          style={{
                            transform: `translateX(-${trackIndex * 100}%)`,
                            transition: carouselAnimate ? undefined : 'none',
                          }}
                          onTransitionEnd={handleTransitionEnd}
                        >
                          <img key="clone-last" src={photos[N - 1]} alt="" className="cv-carousel-slide" aria-hidden="true" loading="lazy" />
                          {photos.map((url, i) => (
                            <img key={i} src={url} alt={`Фото ${i + 1}`} className="cv-carousel-slide" loading={i === 0 ? 'eager' : 'lazy'} />
                          ))}
                          <img key="clone-first" src={photos[0]} alt="" className="cv-carousel-slide" aria-hidden="true" loading="lazy" />
                        </div>
                      </div>
                      <div className="cv-carousel-controls">
                        <button className="cv-carousel-btn" onClick={prevPhoto} aria-label="Предыдущее">‹</button>
                        <div className="cv-carousel-dots">
                          {photos.map((_, i) => (
                            <span
                              key={i}
                              className={`cv-carousel-dot${i === realPhoto ? ' active' : ''}`}
                              onClick={() => { setCarouselAnimate(true); setTrackIndex(i + 1); }}
                            />
                          ))}
                        </div>
                        <button className="cv-carousel-btn" onClick={nextPhoto} aria-label="Следующее">›</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {card.video_url && (
                <div className="cv-video">
                  <video ref={videoRef} controls playsInline muted className="cv-video-player">
                    <source src={card.video_url} type="video/mp4" />
                  </video>
                </div>
              )}

            </div>
          </div>

          {/* ── Фаза 3: CTA ──────────────────────────────── */}
          <div className="cv-cta">
            <h2 className="cv-cta-title">Момент создан.<br />Останется навсегда.</h2>
            <p className="cv-cta-sub">
              Умная открытка — это живое воспоминание,<br />
              которое можно пересмотреть в любой момент.<br />
              Подарите близким что‑то большее.
            </p>
            <div className="cv-cta-btns">
              <button
                className="cv-cta-btn cv-cta-btn--secondary"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                ↺ Посмотреть ещё раз
              </button>
              <button
                className="cv-cta-btn cv-cta-btn--primary"
                onClick={() => { window.location.href = '/'; }}
              >
                Купить открытку
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default CardView;
