import { useRef } from 'react';
import { useScroll, useTransform, motion } from 'motion/react';
import { Video, Image, MessageCircle, ChevronDown } from 'lucide-react';

export default function HeroScrollAnimation({ onCreateCard }) {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Section 1: scale down + rotate slightly as we scroll
  const scale1 = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const rotate1 = useTransform(scrollYProgress, [0, 0.5], [0, -5]);

  // Section 2: scale up + rotate back as we scroll
  const scale2 = useTransform(scrollYProgress, [0.5, 1], [0.8, 1]);
  const rotate2 = useTransform(scrollYProgress, [0.5, 1], [5, 0]);

  return (
    <div className="hsa-wrapper" ref={containerRef}>
      {/* ── Section 1: Light ── */}
      <div className="hsa-section hsa-section--light">
        <motion.div
          className="hsa-motion-card"
          style={{ scale: scale1, rotate: rotate1 }}
        >
          <div className="hsa-grid" aria-hidden="true" />
          <div className="hsa-content">
            <p className="hsa-eyebrow">Умная открытка</p>
            <h2 className="hsa-title">Живая открытка<br />в ваших руках</h2>
            <p className="hsa-subtitle">
              Создайте открытку, которая оживает — с видео, фото и тёплыми словами прямо внутри.
            </p>
            <button className="hsa-cta" onClick={onCreateCard}>
              Начать бесплатно →
            </button>
          </div>
          <div className="hsa-arrow-down" aria-hidden="true">
            <ChevronDown size={32} />
          </div>
        </motion.div>
      </div>

      {/* ── Section 2: Dark ── */}
      <div className="hsa-section hsa-section--dark" id="hsa-dark">
        <motion.div
          className="hsa-motion-card hsa-motion-card--dark"
          style={{ scale: scale2, rotate: rotate2 }}
        >
          <div className="hsa-grid hsa-grid--dark" aria-hidden="true" />
          <div className="hsa-content hsa-content--dark">
            <p className="hsa-eyebrow hsa-eyebrow--dark">Всё в одной открытке</p>
            <h2 className="hsa-title hsa-title--dark">Три формата.<br />Один подарок.</h2>
            <div className="hsa-features">
              <div className="hsa-feature-card">
                <div className="hsa-feature-icon">
                  <Video size={28} />
                </div>
                <h3>Видео</h3>
                <p>Загрузи личное видеопоздравление — до 60 секунд</p>
              </div>
              <div className="hsa-feature-card">
                <div className="hsa-feature-icon">
                  <Image size={28} />
                </div>
                <h3>Фото</h3>
                <p>Добавь фотогалерею с лучшими воспоминаниями</p>
              </div>
              <div className="hsa-feature-card">
                <div className="hsa-feature-icon">
                  <MessageCircle size={28} />
                </div>
                <h3>Сообщение</h3>
                <p>Напиши тёплые слова, которые останутся навсегда</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
