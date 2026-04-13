"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

const SERVER_CODE = `import Axeom, { s } from "axeom"
import { swagger } from "@axeom/swagger"

const axeom = new Axeom()
  .use(swagger())
  .derive(async () => ({
    user: { id: "lymore", role: "architect" }
  }))
  .get("/", () => ({
    status: "weightless"
  }))
  .post("/projects", ({ body, user }) => ({
    id: "proj_123",
    owner: user.id,
    ...body
  }), {
    body: s.object({
      name: s.string().min(3)
    })
  })

export type App = typeof axeom;`;

const CLIENT_CODE = `import { createClient } from "axeom/client"
import type { App } from "./server"

const client = createClient<App>({
  baseUrl: "https://api.axeom.dev"
})

// End-to-End Type Safety
const res = await client.projects.post({
  name: "Axeom Core"
})

console.log(res.owner) // "lymore"`;

type PkgMgr = "npm" | "pnpm" | "bun";

export function CodeWindow() {
  const [tab, setTab] = useState<"server" | "client">("server");
  const [copied, setCopied] = useState(false);
  const [pkgMgr, setPkgMgr] = useState<PkgMgr>("pnpm");
  const [pkgCopied, setPkgCopied] = useState(false);

  const getInstallCmd = () => {
    switch (pkgMgr) {
      case "pnpm":
        return "pnpm add axeom";
      case "bun":
        return "bun add axeom";
      default:
        return "npm install axeom";
    }
  };

  const onCopy = () => {
    const code = tab === "server" ? SERVER_CODE : CLIENT_CODE;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const onCopyPkg = () => {
    navigator.clipboard.writeText(getInstallCmd());
    setPkgCopied(true);
    setTimeout(() => setPkgCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl relative group">
      {/* Creative Install Badge with Manager Toggle */}
      <div className="flex justify-center mb-10">
        <div className="flex items-center gap-6 px-1.5 py-1.5 border border-white/10 bg-white/[0.02] rounded-full backdrop-blur-md transition-all">
          <div className="flex bg-white/[0.03] rounded-full p-1 border border-white/5">
            {(["pnpm", "npm", "bun"] as const).map((mgr) => (
              <button
                key={mgr}
                onClick={() => setPkgMgr(mgr)}
                className={`px-4 py-1.5 rounded-full text-[10px] font-mono tracking-widest uppercase transition-all ${pkgMgr === mgr ? "bg-white/10 text-white shadow-lg" : "text-white/20 hover:text-white/40"}`}
              >
                {mgr}
              </button>
            ))}
          </div>

          <div
            onClick={onCopyPkg}
            className="flex items-center gap-3 pr-4 group/install cursor-pointer"
          >
            <code className="text-[10px] font-mono text-white/60 tracking-widest uppercase min-w-[140px]">
              {getInstallCmd()}
            </code>
            <div className="w-4 h-4 transition-colors">
              {pkgCopied ? (
                <Check className="w-full h-full text-green-500" />
              ) : (
                <Copy className="w-full h-full text-white/10 group-hover/install:text-white/40" />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="relative border border-white/10 bg-[#0d0d0d] rounded-sm shadow-3xl text-left overflow-hidden">
        {/* Tabs */}
        <div className="flex items-center border-b border-white/5 bg-white/[0.02]">
          <button
            onClick={() => setTab("server")}
            className={`px-8 py-4 text-[10px] font-mono tracking-widest uppercase transition-all border-r border-white/5 ${tab === "server" ? "text-white bg-white/[0.05]" : "text-white/20 hover:text-white/40"}`}
          >
            server.ts
          </button>
          <button
            onClick={() => setTab("client")}
            className={`px-8 py-4 text-[10px] font-mono tracking-widest uppercase transition-all border-r border-white/5 ${tab === "client" ? "text-white bg-white/[0.05]" : "text-white/20 hover:text-white/40"}`}
          >
            client.ts
          </button>

          <button
            onClick={onCopy}
            className="ml-auto px-6 h-full flex items-center gap-2 group/copy border-l border-white/5 hover:bg-white/[0.02] transition-colors"
          >
            {copied ? (
              <Check className="w-3 h-3 text-green-500" />
            ) : (
              <Copy className="w-3 h-3 text-white/20 group-hover/copy:text-white/60 transition-colors" />
            )}
            <span
              className={`text-[9px] font-mono uppercase tracking-widest ${copied ? "text-green-500" : "text-white/20 group-hover/copy:text-white/40"}`}
            >
              {copied ? "Copied" : "Copy"}
            </span>
          </button>
        </div>

        <div className="min-h-[420px] h-[450px] overflow-x-hidden overflow-y-auto axeom-scroll relative p-8 md:p-10">
          <div className="space-y-4 font-mono text-xs md:text-sm leading-relaxed relative z-10 pr-12">
            {(tab === "server" ? SERVER_CODE : CLIENT_CODE)
              .split("\n")
              .map((line, i) => (
                <div key={i} className="relative">
                  <div
                    className={`flex gap-6 ${line.includes("const res = ") || line.includes('.post("/projects"') ? "bg-white/[0.02] py-1 -mx-4 px-4 pr-10" : ""}`}
                  >
                    <span className="text-white/5 w-6 select-none leading-relaxed">
                      {(i + 1).toString().padStart(2, "0")}
                    </span>
                    <pre className="text-white/30 whitespace-pre lp-pre">
                      {line
                        .split(
                          /(\.use|\.derive|\.get|\.post|import|export|type|const|await|new Axeom|createClient|s\.object|s\.string|console\.log)/,
                        )
                        .map((part, j) => {
                          if (
                            [
                              ".use",
                              ".derive",
                              ".get",
                              ".post",
                              "new Axeom",
                              "createClient",
                            ].includes(part)
                          )
                            return (
                              <span key={j} className="text-white font-medium">
                                {part}
                              </span>
                            );
                          if (
                            [
                              "import",
                              "export",
                              "type",
                              "const",
                              "await",
                            ].includes(part)
                          )
                            return (
                              <span key={j} className="text-white/50">
                                {part}
                              </span>
                            );
                          if (part.startsWith("s."))
                            return (
                              <span key={j} className="text-white/60 italic">
                                {part}
                              </span>
                            );
                          return <span key={j}>{part}</span>;
                        })}
                    </pre>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
