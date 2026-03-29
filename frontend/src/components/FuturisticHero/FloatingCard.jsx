import React from 'react';
import { motion } from 'framer-motion';

const FloatingCard = ({ name, joinedText, duration, delay, positionClass, glowColorClass }) => {
  return (
    <motion.div
      className={`absolute z-30 ${positionClass}`}
      animate={{ 
        y: [0, -20, 0], 
        x: [0, 10, 0],
        scale: [1, 1.02, 1],
        opacity: [0.9, 1, 0.9]
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay: delay
      }}
    >
      <div className={`flex items-center gap-3 p-3 pr-5 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-xl ${glowColorClass}`}>
        <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center overflow-hidden">
          <svg className="w-6 h-6 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-slate-100">{name}</span>
          <span className="text-xs text-slate-400">{joinedText}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default FloatingCard;
