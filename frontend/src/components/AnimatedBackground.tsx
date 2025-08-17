import React from 'react';

const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Enhanced animated gradient background */}
      <div className="absolute inset-0 bg-gradient-background"></div>
      
      {/* More 3D visual elements */}
      <div className="absolute top-10 left-10 w-4 h-4 bg-primary/40 rounded-full animate-neon-glow"></div>
      <div className="absolute top-20 right-20 w-3 h-3 bg-accent/50 rounded-full animate-bounce delay-500"></div>
      <div className="absolute bottom-40 left-20 w-5 h-5 bg-primary/30 rounded-full animate-ping delay-1000"></div>
      <div className="absolute bottom-20 right-20 w-4 h-4 bg-accent/40 rounded-full animate-pulse delay-300"></div>
      <div className="absolute top-60 left-1/3 w-3 h-3 bg-primary/35 rounded-full animate-neon-glow delay-700"></div>
      <div className="absolute bottom-80 right-1/3 w-4 h-4 bg-accent/45 rounded-full animate-bounce delay-1200"></div>
      
      {/* 3D holographic cubes */}
      <div className="absolute top-1/4 right-1/4 w-12 h-12 bg-gradient-primary/20 rotate-45 animate-hologram rounded-lg"></div>
      <div className="absolute bottom-1/3 left-1/3 w-8 h-8 bg-gradient-secondary/25 rotate-12 animate-hologram delay-1000 rounded-lg"></div>
      <div className="absolute top-2/3 right-1/2 w-10 h-10 bg-gradient-primary/15 -rotate-45 animate-hologram delay-500 rounded-lg"></div>
      
      {/* Large floating orbs with enhanced effects */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary/8 rounded-full blur-3xl animate-glow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/6 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-gradient-primary opacity-8 rounded-full blur-3xl animate-neon-glow"></div>
      
      {/* Matrix rain effect */}
      <div className="absolute top-0 left-1/4 text-primary/10 text-xs font-mono animate-matrix-rain">01010101</div>
      <div className="absolute top-0 left-1/2 text-accent/10 text-xs font-mono animate-matrix-rain delay-500">11001100</div>
      <div className="absolute top-0 left-3/4 text-primary/10 text-xs font-mono animate-matrix-rain delay-1000">10101010</div>
      
      {/* Enhanced neural network with more dynamic paths */}
      <svg className="absolute inset-0 w-full h-full opacity-15" viewBox="0 0 1000 1000">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="50%" stopColor="hsl(var(--accent))" />
            <stop offset="100%" stopColor="hsl(var(--primary))" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Enhanced connecting lines with glow */}
        <path 
          d="M100,200 Q300,100 500,200 T900,150" 
          stroke="url(#lineGradient)" 
          strokeWidth="3" 
          fill="none"
          filter="url(#glow)"
          className="animate-pulse delay-200"
        />
        <path 
          d="M200,400 Q400,300 600,400 T1000,350" 
          stroke="url(#lineGradient)" 
          strokeWidth="2.5" 
          fill="none"
          filter="url(#glow)"
          className="animate-pulse delay-700"
        />
        <path 
          d="M0,600 Q200,500 400,600 T800,550" 
          stroke="url(#lineGradient)" 
          strokeWidth="2" 
          fill="none"
          filter="url(#glow)"
          className="animate-pulse delay-1000"
        />
        <path 
          d="M150,150 Q350,250 550,150 T850,200" 
          stroke="url(#lineGradient)" 
          strokeWidth="1.5" 
          fill="none"
          filter="url(#glow)"
          className="animate-pulse delay-500"
        />
        
        {/* Enhanced neural nodes with glow */}
        <circle cx="100" cy="200" r="6" fill="hsl(var(--primary))" className="animate-neon-glow" />
        <circle cx="500" cy="200" r="8" fill="hsl(var(--accent))" className="animate-neon-glow delay-300" />
        <circle cx="900" cy="150" r="5" fill="hsl(var(--primary))" className="animate-neon-glow delay-600" />
        <circle cx="200" cy="400" r="7" fill="hsl(var(--accent))" className="animate-neon-glow delay-200" />
        <circle cx="600" cy="400" r="6" fill="hsl(var(--primary))" className="animate-neon-glow delay-800" />
        <circle cx="400" cy="600" r="8" fill="hsl(var(--accent))" className="animate-neon-glow delay-500" />
      </svg>
      
      {/* Enhanced floating code snippets */}
      <div className="absolute top-40 right-40 bg-card/10 backdrop-blur-md rounded-xl p-4 animate-float-up border border-primary/20">
        <code className="text-primary/40 text-sm font-mono">AI.predict()</code>
      </div>
      <div className="absolute bottom-60 left-60 bg-card/10 backdrop-blur-md rounded-xl p-4 animate-float-down border border-accent/20">
        <code className="text-accent/40 text-sm font-mono">model.train()</code>
      </div>
      <div className="absolute top-80 left-40 bg-card/10 backdrop-blur-md rounded-xl p-4 animate-float-up delay-1000 border border-primary/20">
        <code className="text-primary/40 text-sm font-mono">neural.network()</code>
      </div>
    </div>
  );
};

export default AnimatedBackground;