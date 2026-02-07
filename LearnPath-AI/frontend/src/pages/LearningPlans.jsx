import React from 'react';
import './Pages.css';

const LearningPlans = () => {
  return (
    <div className="page-container">
      <h1 className="page-title">Personalized Learning Plans</h1>
      <div className="page-content">
        <p>Curated learning paths tailored to your career goals.</p>
        <div style={{ marginTop: '2rem' }}>
          <div style={{ padding: '1.5rem', borderLeft: '4px solid #8b5cf6', background: 'rgba(139, 92, 246, 0.1)', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, color: '#fff' }}>Full Stack Senior Engineer</h3>
            <p style={{ margin: '0.5rem 0' }}>Progress: 45%</p>
            <div style={{ height: '6px', width: '100%', background: '#333', borderRadius: '3px' }}>
              <div style={{ height: '100%', width: '45%', background: '#8b5cf6', borderRadius: '3px' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningPlans;
