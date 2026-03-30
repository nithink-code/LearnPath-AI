import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-brand">
          <img src="/logo.png" alt="LearnPath AI" />
          <div>
            <h4>LearnPath AI</h4>
            <p>Adaptive roadmaps for focused developer growth. Crafting the next generation of engineers with AI-driven, highly personalized, and brutalist-flavored learning journeys.</p>
          </div>
        </div>

        <div className="footer-links-group">
          <div className="footer-column">
            <h5>Navigation</h5>
            <Link to="/">Home</Link>
            <Link to="/assessments">Assessments</Link>
            <Link to="/learning-plans">Learning Plans</Link>
            <Link to="/progress">Progress</Link>
            <Link to="/ai-assistant">AI Assistant</Link>
            <Link to="/about">About Us</Link>
          </div>

          <div className="footer-column">
            <h5>Legal</h5>
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms-of-service">Terms of Service</Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="footer-copy">© {new Date().getFullYear()} LearnPath AI. All rights reserved.</p>
      </div>
    </footer>
  );
}
