"use client";

import { Github, Twitter, Globe, Crown } from "lucide-react";

export function Architect() {
  return (
    <section className="py-32 relative overflow-hidden bg-black border-b border-white/5">
      {/* Background Architectural Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <span className="text-[20vw] font-bold text-white/[0.02] tracking-tighter leading-none">
          ARCHITECT
        </span>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-2xl mx-auto flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full border border-white/10 p-1 mb-8 relative group">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center overflow-hidden">
               {/* Replace with your image eventually */}
               <Crown className="w-8 h-8 text-white/20 group-hover:text-white/60 transition-colors" />
            </div>
            {/* Status Indicator */}
            <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-4 border-black animate-pulse" />
          </div>

          <span className="text-[10px] font-mono tracking-widest text-white/20 uppercase block mb-4">
             // Sole Contributor
          </span>
          
          <h2 className="text-3xl font-bold tracking-tight mb-4">
             Lymore
          </h2>
          
          <p className="text-white/40 text-sm leading-relaxed max-w-sm mb-10 text-balance">
             Building the next generation of web infrastructure. Axeom was born 
             from a obsession with speed, modularity, and the beauty of type-safe systems.
          </p>

          <div className="flex gap-4">
            <a 
              href="https://github.com/Lymore01" 
              target="_blank" 
              rel="noreferrer"
              className="p-3 border border-white/10 hover:border-white/20 bg-white/[0.02] transition-all text-white/40 hover:text-white"
            >
              <Github className="w-5 h-5" />
            </a>
            <a 
              href="https://twitter.com/Lymore01" 
              target="_blank" 
              rel="noreferrer"
              className="p-3 border border-white/10 hover:border-white/20 bg-white/[0.02] transition-all text-white/40 hover:text-white"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a 
              href="https://lymore.dev" 
              target="_blank" 
              rel="noreferrer"
              className="p-3 border border-white/10 hover:border-white/20 bg-white/[0.02] transition-all text-white/40 hover:text-white"
            >
              <Globe className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
