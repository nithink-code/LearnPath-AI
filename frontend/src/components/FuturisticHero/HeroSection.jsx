import React from 'react';
import CodeBlock from './CodeBlock';
import FloatingCard from './FloatingCard';

const HeroSection = () => {
  return (
    <section className="relative w-full min-h-screen bg-gradient-to-br from-[#020617] to-[#0f172a] overflow-hidden flex items-center justify-center">
      
      {/* Center Radial Spotlight glow using the exact requested parameters */}
      <div 
        className="absolute inset-0 select-none pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle at center, rgba(255,140,0,0.15), transparent 60%)'
        }}
      ></div>

      {/* Subtle Blurred Background Blobs (Depth layer) using the exact requested blur filter */}
      <div 
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/30 rounded-full mix-blend-screen z-0 opacity-30"
        style={{ filter: 'blur(100px)' }}
      ></div>
      <div 
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-600/30 rounded-full mix-blend-screen z-0 opacity-30"
        style={{ filter: 'blur(100px)' }}
      ></div>

      {/* Main Content Container wrapper for precise positioning */}
      <div className="relative z-10 w-full max-w-5xl flex items-center justify-center px-4 h-full min-h-[600px] mt-16">
        
        {/* Floating Profile Cards */}
        {/* Top Left */}
        <FloatingCard 
          name="Rohit Sharma" 
          joinedText="Joined Amazon" 
          duration={4} 
          delay={0}
          positionClass="top-0 left-4 md:-top-16 md:left-8 lg:left-12"
          glowColorClass="shadow-[0_0_20px_rgba(249,115,22,0.15)]"
        />

        {/* Top Right */}
        <FloatingCard 
          name="Sarah Chen" 
          joinedText="Joined Microsoft" 
          duration={6} 
          delay={1}
          positionClass="-top-10 right-2 md:-top-4 md:-right-8 lg:-right-12"
          glowColorClass="shadow-[0_0_20px_rgba(59,130,246,0.15)]"
        />

        {/* Bottom Left */}
        <FloatingCard 
          name="David Okafor" 
          joinedText="Joined LinkedIn" 
          duration={8} 
          delay={2}
          positionClass="-bottom-16 left-2 md:-bottom-8 md:-left-4 lg:-left-2"
          glowColorClass="shadow-[0_0_20px_rgba(59,130,246,0.15)]"
        />

        {/* Bottom Right */}
        <FloatingCard 
          name="Priya Patel" 
          joinedText="Joined Deloitte" 
          duration={10} 
          delay={0.5}
          positionClass="-bottom-8 right-4 md:-bottom-20 md:right-8 lg:right-16"
          glowColorClass="shadow-[0_0_20px_rgba(249,115,22,0.15)]"
        />

        {/* Center Code Block */}
        <CodeBlock />
      </div>

    </section>
  );
};

export default HeroSection;
