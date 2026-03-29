import React from 'react';

const CodeBlock = () => {
  return (
    <div className="w-[600px] max-w-full rounded-[20px] overflow-hidden backdrop-blur-xl bg-white/5 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-20 relative">
      {/* Header bar */}
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-black/20">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
        </div>
        <div className="text-xs text-slate-400 font-mono tracking-wide">neural-routing.js</div>
        <button className="px-4 py-1.5 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-md transition-colors shadow-[0_0_15px_rgba(249,115,22,0.4)]">
          Run
        </button>
      </div>
      
      {/* Code Area */}
      <div className="p-8 text-sm md:text-base font-mono leading-relaxed overflow-x-auto">
        <pre className="text-slate-300">
          <code>
<span className="text-purple-400">import</span> {'{'} optimizePath {'}'} <span className="text-purple-400">from</span> <span className="text-green-300">'@lumina/core'</span>;
{'\n\n'}
<span className="text-blue-400">const</span> generateRoadmap = <span className="text-purple-400">async</span> (user) <span className="text-blue-400">{'=>'}</span> {'{'}
{'\n'}  <span className="text-blue-400">const</span> metrics = <span className="text-purple-400">await</span> ai.analyze(user.skills);
{'\n'}  <span className="text-blue-400">const</span> targets = fetchGoals(user.desired_role);
{'\n\n'}  <span className="text-slate-500">{'// Synthesize dynamic learning path'}</span>
{'\n'}  <span className="text-purple-400">return</span> optimizePath(metrics, targets, {'{'}
{'\n'}    adaptiveRouting: <span className="text-orange-400">true</span>,
{'\n'}    intensity: <span className="text-green-300">'maximum'</span>
{'\n'}  {'}'});
{'\n'}{'}'};
          </code>
        </pre>
      </div>
    </div>
  );
};

export default CodeBlock;
