import React from 'react';
import './Pages.css';

export default function PrivacyPolicy() {
  return (
    <div className="page-container">
      <h1 className="page-title">Privacy Policy</h1>
      <p className="page-subtitle">How LearnPath AI handles your data.</p>

      <section className="about-section" style={{ marginTop: '1.5rem' }}>
        <h3>Information We Collect</h3>
        <p>We collect account information, learning activity, assessment submissions, and profile preferences needed to personalize your learning experience.</p>

        <h3>How We Use Data</h3>
        <p>Your data is used to generate adaptive learning plans, progress insights, and AI guidance inside the platform.</p>

        <h3>Data Security</h3>
        <p>We use standard safeguards to protect your information. Never share sensitive credentials in chat inputs or code submissions.</p>

        <h3>Your Choices</h3>
        <p>You can update profile details from your account and control how much optional context you provide to the assistant.</p>
      </section>
    </div>
  );
}
