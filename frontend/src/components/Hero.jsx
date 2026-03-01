import React from 'react';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-content">
        <div className="badge">
          <span className="dot"></span> NEXT-GEN CAREER ENGINE
        </div>
        <h1 className="headline">
          Master Your <br />
          Career with <span className="highlight">AI-</span><br />
          <span className="highlight">Driven Mastery</span>
        </h1>
        <p className="subheadline">
          Experience a premium educational journey powered by neural intelligence.
          Lumina AI reconstructs your professional roadmap through continuous assessment and real-time adaptation.
        </p>
        
        <div className="hero-actions">
          <button className="btn-primary">Start Assessment</button>
          <button className="btn-secondary">View Demo</button>
        </div>

        <div className="trusted-by">
          <div className="avatars">
            <div className="avatar"></div>
            <div className="avatar"></div>
            <div className="avatar"></div>
          </div>
          <span>Trusted by 10,000+ top-tier professionals</span>
        </div>
      </div>

      <div className="hero-visual">
        <div className="visual-card">
          <div className="brain-loader">
             <div className="brain-icon">🧠</div>
          </div>
          <div className="processing-text">NEURAL_PROCESSING_ACTIVE</div>
          <div className="loading-bar">
             <div className="bar-fill"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
