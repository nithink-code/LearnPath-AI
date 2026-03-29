import React from 'react';
import Hero from '../components/Hero';
import AIRoadmap from '../components/AIRoadmap';
import BentoGrid from '../components/BentoGrid';
import TechStackMarquee from '../components/TechStackMarquee';
import AdaptiveParallax from '../components/AdaptiveParallax';
import Footer from '../components/Footer';

const Home = () => {
  return (
    <div className="home-page">
      {/* 🚀 Hero Section */}
      <Hero />
      
      {/* 🔄 Interactive Roadmap Section */}
      <div style={{ margin: '1.25rem 0 4rem' }}>
        <AIRoadmap />
      </div>

      {/* 🍱 AI Engine Bento Grid Section */}
      <BentoGrid />

      {/* ♾️ Infinite Tech Stack Marquee Section */}
      <TechStackMarquee />

      {/* 🔮 Adaptive Assessment Parallax Section */}
      <AdaptiveParallax />

      {/* 🏁 Footer Section */}
      <Footer />
    </div>
  );
};

export default Home;
