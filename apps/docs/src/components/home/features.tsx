"use client";

import { Database } from "lucide-react";
import Link from "next/link";
import React from "react";
import { 
  BunIcon, 
  NodeIcon, 
  DenoIcon, 
  CloudflareIcon, 
  S3Icon, 
  SSEReactor 
} from "@/components/shared/icons";

export function FeatureCard({
  id,
  category,
  title,
  description,
  visual,
  href,
}: {
  id: string;
  category: string;
  title: string;
  description: string;
  visual?: React.ReactNode;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="p-10 group hover:bg-white/[0.02] transition-all duration-500 relative overflow-hidden border-r border-b border-white/10 last:border-r-0 md:[&:nth-child(2n)]:border-r-0 lg:[&:nth-child(2n)]:border-r lg:[&:nth-child(3n)]:border-r-0 flex flex-col h-full"
    >
      <div className="flex items-center gap-3 mb-8">
        <span className="text-[10px] font-mono font-bold text-white/20 uppercase tracking-widest leading-none">
          {id}
        </span>
        <span className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-widest leading-none">
          {category}
        </span>
      </div>

      <h3 className="text-xl font-bold mb-4 tracking-tight text-white group-hover:translate-x-1 transition-transform">
        {title}
      </h3>

      <div className="flex-grow">
        <p className="text-white/30 text-sm leading-relaxed mb-10 md:min-h-[140px] lg:min-h-[110px]">
          {description}
        </p>
      </div>

      <div className="mt-auto">
        <div className="pt-6 border-t border-white/10 h-24 flex items-center">
          {visual}
        </div>
      </div>

      {/* Blueprint reveal on hover */}
      <div className="absolute bottom-0 right-0 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 duration-500">
        <div className="absolute bottom-2 right-2 w-px h-4 bg-white/20" />
        <div className="absolute bottom-2 right-2 w-4 h-px bg-white/20" />
      </div>
    </Link>
  );
}

export function Features() {
  return (
    <section className="py-24 border-b border-white/5 relative">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20 border-b border-white/5 pb-12">
          <div className="max-w-xl">
            <span className="text-[10px] font-mono tracking-widest text-white/20 uppercase block mb-4">
              // Capabilities
            </span>
            <h2 className="text-5xl font-bold tracking-tighter">
              Everything you need,
              <br />
              <span className="text-white/20">Nothing you don't.</span>
            </h2>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 border-t border-l border-r border-white/10">
          <FeatureCard
            id="01"
            href="/docs/runtimes/overview"
            category="Framework Agnostic"
            title="Native on your stack."
            description="First-class support and native adapters for Bun, Node.js (Express), Deno, and Cloudflare Workers."
            visual={
              <div className="flex gap-6 items-center opacity-40 group-hover:opacity-100 transition-all scale-75 origin-left">
                <BunIcon className="w-8 h-8" />
                <NodeIcon className="w-8 h-8" />
                <DenoIcon className="w-8 h-8" />
                <CloudflareIcon className="w-8 h-8" />
              </div>
            }
          />
          <FeatureCard
            id="02"
            href="/docs/features/validation"
            category="Schema"
            title="Validation your way."
            description="Built-in weightless schema, or plug in Zod, Valibot, and TypeBox for enterprise-grade type safety."
            visual={
              <div className="flex gap-3 items-center opacity-40 group-hover:opacity-100 transition-all">
                <div className="px-2 py-1 border border-blue-500/20 bg-blue-500/5 rounded text-[8px] font-mono font-bold text-blue-400 tracking-widest uppercase leading-none">
                  ZOD
                </div>
                <div className="px-2 py-1 border border-indigo-500/20 bg-indigo-500/5 rounded text-[8px] font-mono font-bold text-indigo-400 tracking-widest uppercase leading-none">
                  VALIBOT
                </div>
                <div className="px-2 py-1 border border-red-500/20 bg-red-500/5 rounded text-[8px] font-mono font-bold text-red-400 tracking-widest uppercase leading-none">
                  TYPEBOX
                </div>
              </div>
            }
          />
          <FeatureCard
            id="03"
            href="/docs/plugins/upload"
            category="Infrastructure"
            title="Storage Abstraction."
            description="Unified API for file uploads that bridges Local Storage, Amazon S3, and Cloudflare R2 seamlessly."
            visual={
              <div className="flex gap-5 items-center opacity-40 group-hover:opacity-100 transition-all">
                <S3Icon className="w-6 h-6" />
                <Database className="w-5 h-5 text-white/20" />
                <span className="text-[9px] font-mono italic tracking-tighter uppercase text-white/20">
                  S3 / R2 / Local
                </span>
              </div>
            }
          />
          <FeatureCard
            id="04"
            href="/docs/features/websockets"
            category="Real-Time"
            title="Event-Driven Core."
            description="Built-in abstractions for WebSockets and Server-Sent Events (SSE) for modern real-time applications."
            visual={<SSEReactor />}
          />
          <FeatureCard
            id="05"
            href="/docs/plugins/swagger"
            category="Tooling"
            title="Documentation First."
            description="Every route is a living document. Instant Scalar UI and complete OpenAPI 3.0 generation out of the box."
            visual={
              <span className="text-[9px] font-mono text-white/30 tracking-tight leading-none">
                GET /axeom/docs
              </span>
            }
          />
          <FeatureCard
            id="06"
            href="/docs/architecture/core-concepts"
            category="Performance"
            title="Byte-Sized Core."
            description="Engineered for the edge. Total runtime footprint stays under 10kb including core plugins."
            visual={
              <div className="text-[9px] font-mono text-white/20 italic italic leading-none h-5 flex items-center">
                "Performance is the baseline."
              </div>
            }
          />
        </div>
      </div>
    </section>
  );
}
