import React from 'react';
import CardSwap, { Card } from '../components/CardSwap/CardSwap';
import AIRoadmap from '../components/AIRoadmap';
import BentoGrid from '../components/BentoGrid';
import TechStackMarquee from '../components/TechStackMarquee';
import AdaptiveParallax from '../components/AdaptiveParallax';
import editorImg from '../assets/herocards/editor.png';
import quizImg from '../assets/herocards/quiz.png';
import planImg from '../assets/herocards/plan.png';

const Home = () => {
  return (
    <div className="home-page min-h-screen text-white overflow-hidden font-sans">
      
      {/* Background glow effects */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full mix-blend-screen filter blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 w-full" style={{ paddingTop: '7rem', paddingBottom: '4rem' }}>
        {/* ✨ New Hero Section featuring CardSwap */}
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '4rem', marginBottom: '8rem' }}>
          
          {/* Left text content */}
          <div style={{ flex: '1 1 45%', minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '1.5rem', zIndex: 10 }}>
            <div style={{ display: 'inline-flex', alignSelf: 'flex-start', padding: '0.4rem 1rem', borderRadius: '9999px', border: '1px solid rgba(99, 102, 241, 0.3)', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#a5b4fc', fontSize: '0.875rem', fontWeight: 600, letterSpacing: '0.025em' }}>
              <span>✨ Premium Learning Experience</span>
            </div>
            
            <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 800, lineHeight: 1.1, margin: 0, fontFamily: 'Syne, sans-serif', color: '#fff' }}>
              Learn <span className="brand-gradient">differently.</span>
            </h1>
            
            <p style={{ fontSize: '1.125rem', color: 'var(--lp-text)', lineHeight: 1.6, maxWidth: '500px', margin: 0 }}>
              Stop following generic tutorials. Immerse yourself in a dynamic, AI-driven curriculum that adapts to your unique goals and learning style.
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button className="btn-primary" style={{ padding: '0.8rem 1.75rem', fontSize: '1rem', borderRadius: '9999px' }}>
                Get Started Now
              </button>
              <button className="btn-secondary" style={{ padding: '0.8rem 1.75rem', fontSize: '1rem', borderRadius: '9999px' }}>
                View Paths
              </button>
            </div>
          </div>

          {/* Right side Card Swap component */}
          <div style={{ flex: '1 1 45%', minWidth: '320px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', position: 'relative' }}>
            <CardSwap
              cardDistance={35}
              verticalDistance={45}
              delay={6000}
              pauseOnHover={true}
              width={600}
              height={338}
              duration={2.5}
            >
              {/* 1st Card: Code Editor Video */}
              <Card style={{ backgroundColor: '#11111b', border: '1px solid #2a2a35', borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                {/* Window Title Bar */}
                <div style={{ width: '100%', height: '36px', borderBottom: '1px solid #2a2a35', backgroundColor: '#12121c', display: 'flex', alignItems: 'center', padding: '0 1rem', gap: '0.4rem' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ff5f56' }}></div>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ffbd2e' }}></div>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#27c93f' }}></div>
                  <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, marginLeft: '0.5rem' }}>Skills Assessment</span>
                </div>
                {/* Video Content Area */}
                <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                  <video src="/video/assessment-preview.mp4" autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              </Card>

              {/* 2nd Card: Quiz Video */}
              <Card style={{ backgroundColor: '#11111b', border: '1px solid #2a2a35', borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                {/* Window Title Bar */}
                <div style={{ width: '100%', height: '36px', borderBottom: '1px solid #2a2a35', backgroundColor: '#12121c', display: 'flex', alignItems: 'center', padding: '0 1rem', gap: '0.4rem' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ff5f56' }}></div>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ffbd2e' }}></div>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#27c93f' }}></div>
                  <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, marginLeft: '0.5rem' }}>Interactive Quiz</span>
                </div>
                <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                  <video src="/video/quiz-interaction.mp4" autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              </Card>

              {/* 3rd Card: Learning Plan Video */}
              <Card style={{ backgroundColor: '#11111b', border: '1px solid #2a2a35', borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                {/* Window Title Bar */}
                <div style={{ width: '100%', height: '36px', borderBottom: '1px solid #2a2a35', backgroundColor: '#12121c', display: 'flex', alignItems: 'center', padding: '0 1rem', gap: '0.4rem' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ff5f56' }}></div>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ffbd2e' }}></div>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#27c93f' }}></div>
                  <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, marginLeft: '0.5rem' }}>Personalized Plans</span>
                </div>
                <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                  <video src="/video/learning-path.mp4" autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              </Card>
            </CardSwap>
          </div>
        </div>

        {/* 🔄 Interactive Roadmap Section */}
        <div className="pb-16 pt-8">
          <AIRoadmap />
        </div>

        {/* 🍱 AI Engine Bento Grid Section */}
        <BentoGrid />

        {/* ♾️ Infinite Tech Stack Marquee Section */}
        <TechStackMarquee />

        {/* 🔮 Adaptive Assessment Parallax Section */}
        <AdaptiveParallax />
      </div>
    </div>
  );
};

export default Home;
