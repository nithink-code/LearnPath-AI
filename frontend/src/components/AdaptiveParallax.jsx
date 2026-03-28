import React, { useEffect, useState, useRef } from 'react';
import './AdaptiveParallax.css';

const ORBIT_FEATURES = [
  { title: 'Skill Badging', icon: '🎖️' },
  { title: 'Job Matching', icon: '💼' },
  { title: 'Live Mentors', icon: '👥' },
  { title: 'Code Insights', icon: '💻' }
];

const AdaptiveParallax = () => {
  const [scrollY, setScrollY] = useState(0);
  const sectionRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
         setScrollY(window.scrollY);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section 
      ref={sectionRef} 
      className="parallax-section"
      style={{ '--scroll': scrollY }}
    >
      <div className="parallax-bg-elements">
        <div className="parallax-item parallax-item--1"></div>
        <div className="parallax-item parallax-item--2"></div>
      </div>
      
      <div className="parallax-visual-container">
        {/* Central Core Area */}
        <div className="solar-core">
          <div className="brain-glow"></div>
          <div className="solar-core__inner">
             <span className="core-badge">ADAPTIVE AI</span>
             <h2>Real-time Assessments</h2>
             <p>Our neural engine maps your progress in a dynamic 3D graph.</p>
          </div>
        </div>

        {/* The Solar System Engine */}
        <div className="solar-system-wrap">
          <div className="orbit-line ring--main"></div>

          {/* Explicitly Center-Anchored Orbiters */}
          <div className="orbit-system-hub">
            {ORBIT_FEATURES.map((feat, i) => (
              <div 
                key={i} 
                className={`planet-slot slot--${i}`}
                style={{ '--index': i }}
              >
                <div className="planet-card-premium">
                  <span className="planet-icon">{feat.icon}</span>
                  <span className="planet-text">{feat.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdaptiveParallax;
