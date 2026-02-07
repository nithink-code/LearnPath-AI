import React from 'react';
import './Pages.css';

const Progress = () => {
  return (
    <div className="page-container">
      <h1 className="page-title">Growth Analytics</h1>
      <div className="page-content">
        <p>Track your skill acquisition velocity and milestones.</p>
        <div style={{ marginTop: '2rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
           <div style={{ flex: 1, minWidth: '300px', height: '200px', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #555', borderRadius: '8px' }}>
              Chart Placeholder
           </div>
           <div style={{ flex: 1, minWidth: '300px', height: '200px', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #555', borderRadius: '8px' }}>
              Stats Placeholder
           </div>
        </div>
      </div>
    </div>
  );
};

export default Progress;
