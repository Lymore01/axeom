"use client";

import { GitBranch, Github } from "lucide-react";
import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#090909] py-24 relative overflow-hidden border-t border-white/10">
      <div className="container mx-auto px-6 relative z-10">
        <div className="border border-white/5 bg-black/20 p-12 md:p-16 rounded-sm mb-12">
          {/* Simple CTA Section */}
          <div className="flex flex-col items-center text-center mb-16">
            <h3 className="text-2xl font-bold tracking-tight mb-8 text-white/90">
              Build the next generation of web engines.
            </h3>
            <div className="flex items-center gap-6">
              <Link
                href="/docs"
                className="px-8 py-3 bg-white text-black font-bold uppercase text-[10px] tracking-[0.2em] rounded-sm hover:-translate-y-0.5 transition-all shadow-[0_0_20px_rgba(255,255,255,0.05)]"
              >
                Get Started
              </Link>

              {/* Blueprint Hatched Button Concept */}
              <div className="relative group">
                <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(255,255,255,0.08)_4px,rgba(255,255,255,0.08)_5px)]" />
                <Link
                  href="/docs/core-concepts"
                  className="relative px-8 py-3 border border-white/10 text-white/60 font-mono text-[10px] tracking-[0.2em] uppercase block hover:text-white hover:border-white/20 transition-all"
                >
                  Read Design Docs
                </Link>
                {/* Technical Guides */}
                <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-white/20" />
                <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-white/20" />
              </div>
            </div>
          </div>
        </div>

        {/* IDE-Style "Git Blame" Bottom Bar */}
        <div className="flex flex-col md:flex-row items-stretch border border-white/5 bg-black/40 rounded-sm overflow-hidden">
          {/* Gutter: Branch & Status */}
          <div className="bg-white/[0.02] border-r border-white/5 px-4 py-3 flex items-center gap-3">
            <GitBranch className="w-3 h-3 text-white/20" />
            <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">
              main*
            </span>
            <div className="w-1.5 h-1.5 bg-green-500/40 rounded-full animate-pulse" />
          </div>

          {/* Main Bar: The Blame Annotations */}
          <div className="flex-grow flex flex-wrap items-center px-6 py-3 gap-x-8 gap-y-4">
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-[9px] font-mono text-white/10">
                f7a1c92
              </span>
              <span className="text-[9px] font-mono text-white/40 uppercase hover:text-white transition-colors">
                <Link href="/docs">Lymore01: Documentation</Link>
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-[9px] font-mono text-white/10">
                eb92d11
              </span>
              <span className="text-[9px] font-mono text-white/40 uppercase hover:text-white transition-colors">
                <Link href="/roadmap">Lymore01: Roadmap</Link>
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-[9px] font-mono text-white/10">
                af82c12
              </span>
              <span className="text-[9px] font-mono text-white/40 uppercase hover:text-white transition-colors">
                <Link href="/docs/plugins">Lymore01: Ecosystem</Link>
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-[9px] font-mono text-white/10">
                3da9ce1
              </span>
              <span className="text-[9px] font-mono text-white/40 uppercase">
                Lymore01: © {currentYear} AXEOM
              </span>
            </div>
          </div>

          {/* Social Cluster */}
          <div className="bg-white/[0.02] border-l border-white/5 px-6 py-3 flex items-center gap-6">
            <a
              href="https://github.com/Lymore01/axeom"
              className="text-white/20 hover:text-white transition-colors"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
