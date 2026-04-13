import React from "react";

export function SideBySide({ 
  children, 
  leftLabel, 
  rightLabel 
}: { 
  children: React.ReactNode; 
  leftLabel?: string; 
  rightLabel?: string; 
}) {
  const [left, right] = React.Children.toArray(children);

  return (
    <div className="side-by-side-container my-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-white/10 border border-white/10 overflow-hidden">
        {/* Left Side */}
        <div className="flex flex-col bg-black">
          {leftLabel && (
            <div className="px-4 py-2 border-bottom border-white/5 bg-white/[0.02] text-[10px] font-mono uppercase tracking-widest text-white/40">
              {leftLabel}
            </div>
          )}
          <div className="p-0 flex-1 h-full prose-no-margin">
            {left}
          </div>
        </div>

        {/* Right Side */}
        <div className="flex flex-col bg-black">
          {rightLabel && (
            <div className="px-4 py-2 border-bottom border-white/5 bg-white/[0.02] text-[10px] font-mono uppercase tracking-widest text-white/40">
              {rightLabel}
            </div>
          )}
          <div className="p-0 flex-1 h-full prose-no-margin">
            {right}
          </div>
        </div>
      </div>
    </div>
  );
}
