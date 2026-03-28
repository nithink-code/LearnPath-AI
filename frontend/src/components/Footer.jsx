import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <span className="footer-logo">LearnPath AI</span>
            <p>Empowering the next generation of engineers with personalized, scroll-driven learning.</p>
          </div>
          
          <div className="footer-links">
            <div className="footer-column">
              <h4>Product</h4>
              <a href="/">Features</a>
              <a href="/">Integrations</a>
              <a href="/">Reviews</a>
            </div>
            
            <div className="footer-column">
              <h4>Company</h4>
              <a href="/">About Us</a>
              <a href="/">Careers</a>
              <a href="/">Policy</a>
            </div>
            
            <div className="footer-column">
              <h4>Social</h4>
              <a href="https://twitter.com">Twitter</a>
              <a href="https://github.com">GitHub</a>
              <a href="https://linkedin.com">LinkedIn</a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="footer-copyright">
            © 2026 LearnPath AI. All rights reserved. Built with ❤️ for future engineers.
          </div>
          <div className="footer-social-meta">
             <div className="solar-system">
               <div className="central-dot"></div>
               <div className="orbit orbit--1"><div className="orbiting-dot"></div></div>
               <div className="orbit orbit--2"><div className="orbiting-dot"></div></div>
             </div>
             <span className="status">Status: All Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
