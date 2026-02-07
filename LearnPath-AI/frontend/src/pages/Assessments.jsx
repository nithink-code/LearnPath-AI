import React from 'react';
import './Pages.css';

const Assessments = () => {
  return (
    <div className="page-container">
      <h1 className="page-title">Skill Assessments</h1>
      <div className="page-content">
        <p>Your AI-driven skill evaluation dashboard.</p>
        {/* Placeholder for assessment tools */}
        <div style={{ marginTop: '2rem', display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          {['Python Mastery', 'React Architecture', 'System Design'].map((item) => (
             <div key={item} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                <h3 style={{ color: 'white', marginTop: 0 }}>{item}</h3>
                <p>Status: <span style={{ color: '#fbbf24' }}>Pending</span></p>
                <button className="btn-primary" style={{ marginTop: '1rem', fontSize: '0.9rem', padding: '0.5rem 1rem' }}>Start</button>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Assessments;
