import React from 'react';
import './Pages.css';

const AiAssistant = () => {
  return (
    <div className="page-container">
      <h1 className="page-title">Lumina AI Mentor</h1>
      <div className="page-content" style={{ display: 'flex', flexDirection: 'column', height: '600px' }}>
        <div style={{ flex: 1, borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>
           AI Chat Interface
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input 
            type="text" 
            placeholder="Ask for career advice..." 
            style={{ 
              flex: 1, 
              padding: '1rem', 
              borderRadius: '8px', 
              border: 'none', 
              background: 'rgba(255,255,255,0.1)', 
              color: 'white' 
            }} 
          />
          <button className="btn-signup">Send</button>
        </div>
      </div>
    </div>
  );
};

export default AiAssistant;
