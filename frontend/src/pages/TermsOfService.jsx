import React from 'react';
import './Pages.css';

export default function TermsOfService() {
  return (
    <div className="page-container">
      <h1 className="page-title">Terms of Service</h1>
      <p className="page-subtitle">Rules for using LearnPath AI.</p>

      <section className="about-section" style={{ marginTop: '1.5rem' }}>
        <h3>Acceptable Use</h3>
        <p>Use the platform for learning, practice, and professional growth. Do not attempt abuse, unauthorized access, or harmful activity.</p>

        <h3>Content and Submissions</h3>
        <p>You retain ownership of your submitted content. By using the service, you allow processing required for feedback, scoring, and progress tracking.</p>

        <h3>Service Availability</h3>
        <p>We may update, improve, or temporarily suspend features for maintenance and reliability improvements.</p>

        <h3>Liability</h3>
        <p>Learning guidance is provided for educational use and should be validated before production use.</p>
      </section>
    </div>
  );
}
