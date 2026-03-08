import { useState } from 'react';

function ProductCard({ imageUrl, title, stores }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="product-card" onClick={() => setOpen(o => !o)}>
      <div className="product-card__bg" style={{ backgroundImage: `url(${imageUrl})` }} />
      <div className="product-card__gradient" />
      <div className={`product-card__overlay ${open ? 'product-card__overlay--open' : ''}`}>
        <div className="product-card__store-grid">
          {stores.map((s, i) => (
            <a key={s.name} href={s.href || '#'}
               className="product-card__store-logo-link"
               style={{ animationDelay: `${i * 0.08}s` }}
               onClick={e => e.stopPropagation()}>
              <img src={s.logo} alt={s.name} className="product-card__store-logo" />
            </a>
          ))}
        </div>
      </div>
      <div className="product-card__content">
        <h3 className="product-card__title">{title}</h3>
        <button
          className={`product-card__buy-btn ${open ? 'product-card__buy-btn--active' : ''}`}
          onClick={e => { e.stopPropagation(); setOpen(o => !o); }}>
          {open ? 'Закрыть' : 'Купить'}
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
