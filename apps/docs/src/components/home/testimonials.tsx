"use client";

import { useState, useEffect } from "react";
import { Activity, ShieldCheck, Quote } from "lucide-react";

interface Transmission {
  author: string;
  role: string;
  content: string;
  handle: string;
  strength: string;
  avatar: string;
}

const TRANSMISSIONS: Transmission[] = [
  {
    author: "Alex Rivers",
    handle: "@arivers_dev",
    role: "Lead Engineer",
    content: "Finally, a framework that doesn't try to hide the Web APIs. It's pure power and zero abstraction bloat. The runtime flexibility is unlike anything else in the ecosystem.",
    strength: "Signal: High",
    avatar: "https://i.pravatar.cc/150?u=alex",
  },
  {
    author: "Sarah Chen",
    handle: "@schen_codes",
    role: "Fullstack Architect",
    content: "The type-safety here is illegal. I haven't seen a runtime error desde we migrated our core services. It's transformed how our team handles complex payloads.",
    strength: "Signal: Stable",
    avatar: "https://i.pravatar.cc/150?u=sarah",
  },
  {
    author: "Marcus Thorne",
    handle: "@mthorne_io",
    role: "Backend Specialist",
    content: "Axeom + Bun is basically a cheat code for edge latency. This is the future of serverless infrastructure. Lightweight, modular, and incredibly fast.",
    strength: "Signal: Peak",
    avatar: "https://i.pravatar.cc/150?u=marcus",
  },
  {
    author: "Elena Vance",
    handle: "@ev_cloud",
    role: "DevOps Lead",
    content: "Deployment flexibility was our main driver. Running the same code on Node, Bun, and Workers without re-writes is a masterclass in standard adherence.",
    strength: "Signal: Solid",
    avatar: "https://i.pravatar.cc/150?u=elena",
  },
];

export function Testimonials() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % TRANSMISSIONS.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isPaused]);

  const active = TRANSMISSIONS[activeIdx];

  return (
    <section className="py-24 border-b border-white/5 relative bg-black overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: The Source Grid */}
          <div className="lg:col-span-4 lg:pr-12 border-r border-white/5 order-2 lg:order-1">
            <div className="mb-12">
               <span className="text-[10px] font-mono tracking-widest text-white/20 uppercase block mb-4">
                 // Source Selection
              </span>
              <h2 className="text-3xl font-bold tracking-tighter">
                 Transmission
                 <br />
                 <span className="text-white/20">Nodes</span>
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
               {TRANSMISSIONS.map((t, idx) => (
                 <button
                   key={idx}
                   onMouseEnter={() => setIsPaused(true)}
                   onMouseLeave={() => setIsPaused(false)}
                   onClick={() => setActiveIdx(idx)}
                   className={`p-4 border transition-all duration-500 rounded-sm text-left group relative overflow-hidden ${
                     activeIdx === idx 
                      ? "border-white/20 bg-white/[0.03] shadow-[0_0_20px_rgba(255,255,255,0.02)]" 
                      : "border-white/5 hover:border-white/10"
                   }`}
                 >
                   <div className="flex items-center gap-3">
                     <div className={`w-10 h-10 rounded-full border transition-all duration-500 overflow-hidden ${
                       activeIdx === idx ? "border-white/40 opacity-100" : "border-white/10 opacity-40 grayscale"
                     }`}>
                        <img src={t.avatar} alt={t.author} className="w-full h-full object-cover" />
                     </div>
                     <div className="overflow-hidden">
                        <p className={`text-[10px] font-bold truncate transition-colors ${
                          activeIdx === idx ? "text-white" : "text-white/20"
                        }`}>
                          {t.author}
                        </p>
                        <p className="text-[8px] font-mono text-white/10 truncate">
                          {t.handle}
                        </p>
                     </div>
                   </div>
                   
                   {activeIdx === idx && (
                     <div className="h-px bg-white/20 mt-4 animate-in slide-in-from-left duration-1000" />
                   )}
                 </button>
               ))}
            </div>
          </div>

          {/* Right Column: The Output Display */}
          <div className="lg:col-span-8 order-1 lg:order-2">
             <div className="relative group">
                <div className="p-12 md:p-16 border border-white/5 bg-white/[0.01] rounded-sm relative overflow-hidden">
                   {/* Background Elements */}
                   <Quote className="absolute -top-6 -left-6 w-32 h-32 text-white/[0.02]" />
                   
                   <div className="relative z-10 min-h-[220px] flex flex-col">
                      <div className="flex justify-between items-center mb-12">
                         <div className="flex items-center gap-3">
                            <Activity className="w-4 h-4 text-green-500/40 animate-pulse" />
                            <span className="text-[10px] font-mono text-white/20 uppercase tracking-[0.3em]">
                               Live Transmission
                            </span>
                         </div>
                         <div className="text-[10px] font-mono text-white/10 uppercase">
                            {active.strength}
                         </div>
                      </div>

                      <p className="text-xl md:text-2xl font-medium leading-relaxed italic text-white/60 mb-12 animate-in fade-in slide-in-from-right-4 duration-700">
                         "{active.content}"
                      </p>

                      <div className="mt-auto flex items-center justify-between">
                         <div className="flex flex-col">
                            <span className="text-sm font-bold text-white mb-1 tracking-tight">
                               {active.author}
                            </span>
                            <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">
                               {active.role}
                            </span>
                         </div>
                         <ShieldCheck className="w-6 h-6 text-white/5 opacity-40" />
                      </div>
                   </div>

                   {/* Progress bar for autoplay */}
                   {!isPaused && (
                     <div className="absolute bottom-0 left-0 h-0.5 bg-white/10 animate-[progress_5s_linear_infinite]" />
                   )}
                </div>

                {/* Technical corner markers */}
                <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-white/20" />
                <div className="absolute -top-1 -right-1 w-2 h-2 border-t border-r border-white/20" />
                <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b border-l border-white/20" />
                <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-white/20" />
             </div>
          </div>
          
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          from { width: 0; }
          to { width: 100%; }
        }
      `}</style>
    </section>
  );
}
