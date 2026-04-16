import { Activity } from "lucide-react";

export function SpeedBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="space-y-3 relative group">
      <div className="flex justify-between text-[10px] font-mono uppercase tracking-[0.2em] text-white/20 group-hover:text-white/40 transition-colors">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-[2px] w-full bg-white/5 overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-1000 ease-out`}
          style={{ width: `${value}%` }}
        />
      </div>
      {/* Blueprint touch: tiny ticks */}
      <div className="absolute -bottom-1 left-0 w-px h-1 bg-white/10" />
      <div className="absolute -bottom-1 right-0 w-px h-1 bg-white/10" />
    </div>
  );
}

export function Performance() {
  return (
    <section className="py-32 border-b border-white/5 bg-white/[0.01] relative group">
      <div className="blueprint-line-v left-[8%] opacity-30" />
      <div className="blueprint-line-v left-[8.5%] opacity-10 w-px" />
      <div className="blueprint-label top-10 left-[9.5%] transform rotate-90 origin-left">
        metrics.v4.live
      </div>
      
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-24 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-8 tracking-tighter italic">
              Speed is a Feature.
            </h2>
            <p className="text-white/40 text-lg mb-12 leading-relaxed max-w-lg">
              We benchmarked Axeom against the giants. The result? 
              <span className="text-white/80"> Minimal cold starts, zero middleware latency, and sub-millisecond routing.</span>
            </p>
            <div className="space-y-10">
              <SpeedBar label="Axeom Core" value={98} color="bg-white" />
              <SpeedBar label="Standard CJS" value={45} color="bg-white/20" />
              <SpeedBar
                label="Legacy Node"
                value={22}
                color="bg-white/10"
              />
            </div>
          </div>
          
          <div className="relative">
             {/* Simple geometric outline */}
             <div className="absolute -inset-4 border border-white/5 rounded-3xl" />
             
             <div className="p-16 border border-white/10 bg-[#0d0d0d] rounded-2xl flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-right from-transparent via-white/10 to-transparent" />
                
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8 border border-white/5">
                  <Activity className="w-10 h-10 text-white/40" />
                </div>
                <h3 className="text-5xl font-bold mb-6 font-mono tracking-tighter">&lt; 1ms</h3>
                <p className="text-white/20 text-xs italic tracking-widest uppercase">
                  Routing Overhead / Native Agent
                </p>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
