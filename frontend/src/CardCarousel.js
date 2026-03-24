import { useState, useEffect, useCallback } from 'react';

export default function CardCarousel({ images, onCardClick }) {
  const [currentIndex, setCurrentIndex] = useState(Math.floor(images.length / 2));

  const handleNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    const timer = setInterval(handleNext, 4000);
    return () => clearInterval(timer);
  }, [handleNext]);

  return (
    <div className="card-carousel">
      <div className="card-carousel__track" style={{ perspective: '1000px' }}>
        {images.map((image, index) => {
          const total = images.length;
          let pos = ((index - currentIndex) + total) % total;
          if (pos > Math.floor(total / 2)) pos -= total;

          const isCenter = pos === 0;
          const isAdjacent = Math.abs(pos) === 1;
          const isHidden = Math.abs(pos) > 1;

          return (
            <div
              key={index}
              className="card-carousel__item"
              style={{
                transform: `translateX(${pos * 45}%) scale(${isCenter ? 1 : isAdjacent ? 0.85 : 0.7}) rotateY(${pos * -10}deg)`,
                zIndex: isCenter ? 10 : isAdjacent ? 5 : 1,
                opacity: isCenter ? 1 : isAdjacent ? 0.4 : 0,
                filter: isCenter ? 'none' : 'blur(4px)',
                visibility: isHidden ? 'hidden' : 'visible',
                cursor: 'pointer',
              }}
              onClick={() => onCardClick && onCardClick(index)}
            >
              <img src={image.src} alt={image.alt} className="card-carousel__img" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
