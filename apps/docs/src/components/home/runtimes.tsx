"use client";

import {
  BunIcon,
  CloudflareIcon,
  DenoIcon,
  NextJsIcon,
  NodeIcon,
  VercelIcon,
} from "@/components/shared/icons";
import Link from "next/link";

const RUNTIMES = [
  { name: "Bun", icon: <BunIcon /> },
  { name: "Node.js", icon: <NodeIcon /> },
  { name: "Deno", icon: <DenoIcon /> },
  { name: "Workers", icon: <CloudflareIcon /> },
  {
    name: "Next.js",
    icon: (
      <NextJsIcon className="w-10 h-10 invert opacity-40 group-hover:opacity-100" />
    ),
  },
  {
    name: "Vercel",
    icon: (
      <VercelIcon className="w-10 h-10 opacity-40 group-hover:opacity-100" />
    ),
  },
];

export function Runtimes() {
  return (
    <section className="py-24 bg-black border-b border-white/5 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end gap-12 mb-20 border-b border-white/5 pb-10">
          <div className="max-w-xl flex flex-col items-end lg:items-start">
            <span className="text-[10px] font-mono tracking-widest text-white/20 uppercase block mb-4">
              // Runtime & Framework Interop
            </span>
            <h2 className="text-4xl font-bold tracking-tighter">
              Agnostic
              <br />
              <span className="text-white/20">Protocols.</span>
            </h2>
          </div>
          <p className="text-white/30 text-sm leading-relaxed max-w-sm text-right">
            The Axeom core follows the{" "}
            <Link
              href="https://winterTC.org"
              target="_blank"
              className="text-white underline decoration-white/20 underline-offset-4 hover:decoration-white transition-all"
            >
              winterTC
            </Link>{" "}
            specification, ensuring seamless integration across top-tier engines
            and frameworks.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 border border-white/5 bg-white/[0.01]">
          {RUNTIMES.map((r, i) => (
            <div
              key={i}
              className="group relative h-40 flex flex-col items-center justify-center border-r border-b lg:border-b-0 border-white/5 last:border-r-0 hover:bg-white/[0.02] transition-colors cursor-default overflow-hidden"
            >
              <div className="transition-all duration-500 transform group-hover:-translate-y-2">
                {r.icon}
              </div>

              <div className="absolute bottom-6 opacity-0 group-hover:opacity-40 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-white">
                  {r.name}
                </span>
              </div>

              {/* Technical corner markers for that blueprint feel */}
              <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-1.5 h-1.5 border-t border-r border-white/20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
