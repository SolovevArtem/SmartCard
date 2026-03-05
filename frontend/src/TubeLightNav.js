import { useState } from 'react';
import { motion } from 'motion/react';
import { Home, PlayCircle, ShoppingCart, HelpCircle, Mail } from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Главная',      id: null,       icon: Home },
  { name: 'Как работает', id: 'hsa-dark', icon: PlayCircle },
  { name: 'Купить',       id: 'features', icon: ShoppingCart },
  { name: 'Вопросы',      id: 'faq',      icon: HelpCircle },
  { name: 'Контакты',     id: 'contacts', icon: Mail },
];

export default function TubeLightNav({ visible, onScrollTo }) {
  const [activeTab, setActiveTab] = useState('Главная');

  const handleClick = (item) => {
    setActiveTab(item.name);
    if (item.id) {
      onScrollTo(item.id);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className={`tubelight-nav${visible ? ' tubelight-nav--visible' : ''}`}>
      <div className="tubelight-nav__pill">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.name;
          return (
            <button
              key={item.name}
              className={`tubelight-nav__item${isActive ? ' active' : ''}`}
              onClick={() => handleClick(item)}
            >
              <span className="tubelight-nav__label">{item.name}</span>
              <span className="tubelight-nav__icon"><Icon size={18} /></span>
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="tubelight-nav__lamp"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  <div className="tubelight-nav__lamp-bar">
                    <div className="tubelight-nav__lamp-glow" />
                  </div>
                </motion.div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
