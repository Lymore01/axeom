"use client";
import { ArrowRight, Github } from "lucide-react";
import Link from "next/link";
import { CodeWindow } from "./code-window";

export function Hero() {
  return (
    <section className="relative pt-40 pb-32 overflow-hidden border-b border-white/5 group">
      {/* Blueprint System - Unified Coordinate System */}
      <div className="blueprint-line-h top-32" />
      <div className="blueprint-line-h bottom-12" />
      <div className="blueprint-line-v left-[15%] hidden xl:block" />
      <div className="blueprint-line-v right-[15%] hidden xl:block" />

      {/* Corner Markers - Absolute Locked */}
      <div className="absolute top-32 left-[15%] w-4 h-4 border-t border-l border-white/40 hidden xl:block" />
      <div className="absolute top-32 right-[15%] w-4 h-4 border-t border-r border-white/40 hidden xl:block" />

      {/* Labels - Absolute Locked */}
      <span className="blueprint-label top-24 left-[16%] hidden xl:block">
        system.engine.v1.0
      </span>
      <span className="blueprint-label top-24 right-[16%] hidden xl:block text-right">
        config.node_bundle.5kb
      </span>

      <div className="container mx-auto px-6 relative z-10 flex flex-col items-center text-center">
        <div className="max-w-4xl pt-12 mb-16">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 leading-[0.9] text-balance">
            The Backend for Frontend Web Framework
          </h1>

          <p className="text-lg md:text-xl text-white/40 mb-10 leading-relaxed max-w-2xl mx-auto text-balance">
            Axeom is the ultra-fast web engine that bridges the gap between
            runtimes.
            <span className="text-white">
              {" "}
              Built for speed, modularity, and absolute type-safety.
            </span>
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-20">
            <Link
              href="/docs"
              className="px-10 py-4 bg-white text-black font-bold rounded-sm hover:-translate-y-1 transition-all flex items-center gap-3 shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)] active:shadow-none"
            >
              Learn Axeom
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="https://github.com/Lymore01/axeom"
              target="_blank"
              rel="noreferrer"
              className="px-10 py-4 bg-transparent text-white border border-white/20 font-bold rounded-sm hover:bg-white/5 transition-all flex items-center gap-3"
            >
              <Github className="w-5 h-5" />
              Explore Source
            </a>
          </div>
        </div>

        <CodeWindow />
      </div>
    </section>
  );
}
