import React from 'react';
import './TechStackMarquee.css';

const TECH_LOGOS = [
  'React', 'Node.js', 'Python', 'AWS', 'Docker', 'Kubernetes', 'PostgreSQL', 'MongoDB', 'Redis', 'TypeScript', 'GraphQL', 'Next.js'
];

const TechStackMarquee = () => {
  return (
    <section className="marquee-section">
      <div className="section-header--small">
        <p>LEARN THE MOST IN-DEMAND STACKS</p>
      </div>
      
      <div className="infinite-marquee">
        <div className="marquee-content-wrapper">
          <div className="marquee-content">
            {TECH_LOGOS.map((tech, index) => (
              <div key={index} className="tech-item">
                <span className="tech-name">{tech}</span>
              </div>
            ))}
            {/* Duplicate logos for seamless infinite scroll */}
            {TECH_LOGOS.map((tech, index) => (
              <div key={`dup-${index}`} className="tech-item">
                <span className="tech-name">{tech}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="marquee-mask"></div>
      </div>
    </section>
  );
};

export default TechStackMarquee;
