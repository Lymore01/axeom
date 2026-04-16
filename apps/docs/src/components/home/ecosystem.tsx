"use client";

import {
  Box,
  FileCode,
  Globe,
  HardDrive,
  Lock,
  Plus,
  Zap,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";

interface PluginProps {
  name: string;
  description: string;
  icon: React.ReactNode;
  size: string;
  path: string;
}

function PluginCard({ name, description, icon, size, path }: PluginProps) {
  return (
    <Link
      href={path}
      className="group relative p-6 border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-500 rounded-sm overflow-hidden"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="p-2 border border-white/10 rounded-sm text-white/40 group-hover:text-white group-hover:border-white/20 transition-all duration-500">
          {icon}
        </div>
        <span className="text-[9px] font-mono text-white/20 tracking-tighter uppercase">
          {size}
        </span>
      </div>

      <h4 className="text-sm font-bold text-white mb-2 tracking-tight group-hover:translate-x-1 transition-transform">
        {name}
      </h4>
      <p className="text-[11px] text-white/30 leading-relaxed font-mono tracking-tight">
        {description}
      </p>

      {/* Connectivity Detail */}
      <div className="absolute top-0 right-0 w-4 h-px bg-white/10 group-hover:w-full transition-all duration-700" />
      <div className="absolute top-0 right-0 h-4 w-px bg-white/10 group-hover:h-full transition-all duration-700" />
    </Link>
  );
}

export function Ecosystem() {
  const plugins: PluginProps[] = [
    {
      name: "@axeom/swagger",
      description: "Auto-generated OpenAPI 3.0 & Scalar UI.",
      icon: <FileCode className="w-4 h-4" />,
      size: "1.8kb",
      path: "/docs/plugins/swagger",
    },
    {
      name: "@axeom/auth",
      description: "Secure JWT identity powered by Jose.",
      icon: <Lock className="w-4 h-4" />,
      size: "28.3kb",
      path: "/docs/plugins/auth",
    },
    {
      name: "@axeom/rate-limit",
      description: "Traffic control and brute-force protection.",
      icon: <ShieldAlert className="w-4 h-4" />,
      size: "0.9kb",
      path: "/docs/plugins/rate-limit",
    },
    {
      name: "@axeom/ws",
      description: "Cross-runtime WebSocket abstractions.",
      icon: <Zap className="w-4 h-4" />,
      size: "0.2kb",
      path: "/docs/plugins/websockets",
    },
    {
      name: "@axeom/upload",
      description: "Streaming file uploads for S3 & Local.",
      icon: <HardDrive className="w-4 h-4" />,
      size: "0.8kb",
      path: "/docs/plugins/upload",
    },
    {
      name: "@axeom/static",
      description: "Optimized asset delivery for the edge.",
      icon: <Box className="w-4 h-4" />,
      size: "1.1kb",
      path: "/docs/plugins/static",
    },
  ];

  return (
    <section className="py-24 border-b border-white/5 relative bg-black overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-8">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-white/20 uppercase block mb-4">
                // Ecosystem
              </span>
              <h2 className="text-4xl font-bold tracking-tighter mb-6">
                Extend the runtime.
                <br />
                Maintain the speed.
              </h2>
              <p className="text-white/30 text-sm leading-relaxed max-w-sm">
                Axeom follows a "Zero-Bundle" philosophy. Core stays tiny, while
                the plugins provide industry-standard features only when you
                need them.
              </p>
            </div>

            <Link
              href="/docs/plugins"
              className="inline-flex items-center gap-3 px-6 py-3 border border-white/10 hover:border-white/20 transition-all text-[10px] font-mono tracking-widest uppercase text-white/40 hover:text-white"
            >
              <Plus className="w-3 h-3" />
              Browse All Plugins
            </Link>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 border border-white/5 p-px">
            {plugins.map((plugin, i) => (
              <PluginCard key={i} {...plugin} />
            ))}

            <div className="p-6 bg-black flex flex-col justify-center items-center opacity-20 border border-white/5">
              <div className="w-8 h-8 rounded-full border border-dashed border-white/20 flex items-center justify-center mb-4">
                <Plus className="w-3 h-3" />
              </div>
              <span className="text-[8px] font-mono uppercase tracking-[0.2em]">
                Build One
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
