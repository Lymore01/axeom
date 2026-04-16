"use client";

import { Feather, ShieldCheck } from "lucide-react";

export function CreatorNote() {
  return (
    <section className="py-32 relative overflow-hidden bg-black border-b border-white/5">
      {/* Background Architectural Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <span className="text-[15vw] font-bold text-white/[0.02] tracking-tighter leading-none">
          VISION
        </span>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-2xl mx-auto">
          <div className="p-12 md:p-16 border border-white/10 bg-white/[0.01] relative backdrop-blur-sm">
             {/* Technical Decorations */}
             <div className="absolute -top-px -left-px w-8 h-8 border-t border-l border-white/40" />
             <div className="absolute -bottom-px -right-px w-8 h-8 border-b border-r border-white/40" />

             <div className="inline-flex items-center gap-3 px-4 py-1 border border-white/10 rounded-sm mb-12">
                <Feather className="w-3 h-3 text-white/40" />
                <span className="text-[9px] font-mono tracking-widest text-white/40 uppercase">
                   Architect's Briefing
                </span>
             </div>

             <div className="space-y-8">
                <h2 className="text-3xl font-bold tracking-tight text-white">
                   Why Axeom?
                </h2>
                
                <div className="space-y-6 text-white/50 text-base leading-relaxed font-light">
                   <p>
                      The modern web ecosystem has become a labyrinth of heavy abstractions. 
                      We’ve built frameworks that solve complexity by adding more complexity, 
                      forgetting the underlying standards that make the web powerful in the first place.
                   </p>
                   <p>
                      Axeom was born from a simple obsession: **Speed through standards.** 
                      I wanted a framework that felt like pure infrastructure—invisible, 
                      unbelievably fast, and natively compatible with every modern runtime.
                   </p>
                   <p>
                      This isn't just a library; it's a commitment to a weightless future. 
                      Whether you're building at the edge with Bun and Workers, or scaling 
                      on enterprise Node clusters, Axeom stays focused on what matters: 
                      your logic and your users.
                   </p>
                </div>

                <div className="pt-12 mt-12 border-t border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full border border-white/20 bg-white/5 flex items-center justify-center">
                         <span className="text-xs font-mono text-white/40">LY</span>
                      </div>
                      <div>
                         <p className="text-sm font-bold text-white leading-none mb-1">Lymore</p>
                         <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Lead Architect</p>
                      </div>
                   </div>

                   <div className="flex items-center gap-3 px-4 py-2 bg-white/[0.03] border border-white/10 rounded-sm">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                         Authorized Transmission
                      </span>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
