import React from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import './BentoGrid.css';

const BENTO_ITEMS = [
  {
    title: 'Self-Evolving Logic',
    description: 'Our proprietary LLM logic re-factors your path in real-time, responding to every quiz and code submit.',
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
    size: 'large',
    accent: 'purple',
  },
  {
    title: 'Neural Gap Mapping',
    description: 'Scan 1,000+ data points to pinpoint exactly why you struggle with certain concepts.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" />
      </svg>
    ),
    size: 'small',
    accent: 'blue',
  },
  {
    title: 'Synthetic Mocks',
    description: 'Experience voice-activated mock interviews with adaptive difficulty levels.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
      </svg>
    ),
    size: 'small',
    accent: 'purple',
  },
  {
    title: 'Architect-Level Insights',
    description: 'Get deep feedback on your code architecture, not just syntax. Master clean code.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    size: 'medium',
    accent: 'blue',
  },
];

const BentoGrid = () => {
  const [bentoRef, bentoVisible] = useScrollReveal(0.15);

  return (
    <section 
      ref={bentoRef} 
      className={`bento-section ${bentoVisible ? 'is-revealed' : ''}`}
    >
      <div className="section-header">
        <h2>High-Velocity Learning</h2>
      </div>

      <div className="bento-grid-premium">
        {BENTO_ITEMS.map((item, index) => (
          <div 
            key={index} 
            className={`bento-card-premium bento-card--${item.size} accent-${item.accent}`}
            style={{ '--index': index }}
          >
            <div className="bento-card__glass"></div>
            <div className="bento-card__content">
              <div className="bento-card__icon-wrapper">
                 {item.icon}
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
            
            {/* Ambient Background Glow */}
            <div className="bento-card__glow-static"></div>
            
            {/* Dynamic Rotating Gradient Border */}
            <div className="bento-card__animated-border"></div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BentoGrid;
