import { useEffect, useRef, useCallback, useState } from 'react';

function CardView({ card }) {
  const videoRef = useRef(null);
  const sectionRef = useRef(null);
  const [scrollProg, setScrollProg] = useState(0);
  const [trackIndex, setTrackIndex] = useState(1);
  const [carouselAnimate, setCarouselAnimate] = useState(true);
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

  const prevPhoto = useCallback(() => { setCarouselAnimate(true); setTrackIndex(i => i - 1); }, []);
  const nextPhoto = useCallback(() => { setCarouselAnimate(true); setTrackIndex(i => i + 1); }, []);

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

  // Single lid: rotateX 0° (closed) → -180° (open, stays visible), scroll 0 → 0.65
  const lidProg = Math.min(1, scrollProg / 0.65);
  const lidRotateX = -(lidProg * 180);
  // Intro text fades as animation starts
  const introOpacity = Math.max(0, 1 - scrollProg * 5);
  const scrollHintOpacity = Math.max(0, 1 - scrollProg * 8);

  return (
    <div className="env-page">

      {/* ── Envelope + intro + card (scroll-driven, 380vh) ── */}
      <div className="env-scroll-section" ref={sectionRef}>
        <div className="env-sticky">

          {/* Intro text — fades as animation begins */}
          <div className="env-sticky-intro" style={{ opacity: introOpacity }} aria-hidden={introOpacity === 0}>
            <span className="env-intro-surprise">✦ Для вас особый сюрприз</span>
            <h1 className="env-intro-name">{card.sender_name}</h1>
            <p className="env-intro-tagline">подготовил(а) для вас что-то особенное</p>
          </div>

          <div className="env-scene">

            {/* CSS envelope body */}
            <div className="env-wrapper" aria-hidden="true">
              {/* Single lid: rotateX 0° (closed) → -180° (open, stays visible) */}
              <div className="env-lid" style={{ transform: `rotateX(${lidRotateX}deg)` }} />
              {/* Side fold triangles */}
              <div className="env-body-folds" />
              {/* Bottom V-fold */}
              <div className="env-body-bottom" />
            </div>

            {/* Permanent mask — always opaque */}
            <div className="env-front-mask" />

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

    </div>
  );
}

export default CardView;
