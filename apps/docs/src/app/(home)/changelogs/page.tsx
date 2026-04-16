import { Bug, Sparkles, Wrench } from "lucide-react";

const releases = [
  {
    version: "0.2.0",
    date: "March 15, 2024",
    changes: [
      { type: "feat", text: "Added MongoDB adapter support" },
      { type: "feat", text: "Introduced multi-factor authentication (MFA)" },
      {
        type: "fix",
        text: "Resolved session expiration edge case in JWT strategy",
      },
    ],
  },
  {
    version: "0.1.1",
    date: "February 28, 2024",
    changes: [
      { type: "fix", text: "Fixed type definition for AuthConfig" },
      { type: "chore", text: "Updated peer dependencies for React 18" },
    ],
  },
  {
    version: "0.1.0",
    date: "February 10, 2024",
    changes: [
      { type: "feat", text: "Initial release of Keylio" },
      { type: "feat", text: "Prisma adapter integration" },
      { type: "feat", text: "Next.js App Router support" },
    ],
  },
];

export default function ChangelogsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-200 selection:bg-cyan-100 dark:selection:bg-cyan-900 transition-colors duration-300 relative overflow-hidden">
      {/* Blueprint Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:96px_96px]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent" />
      </div>

      <main className="relative z-10 max-w-4xl mx-auto px-6 pt-32 pb-20">
        <div className="text-center mb-20">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
            Changelog
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
            Track the evolution of Keylio. New features, bug fixes, and
            improvements.
          </p>
        </div>

        <div className="relative pl-4 md:pl-0">
          {/* Timeline Line */}
          <div className="absolute left-4 top-2 bottom-0 w-px bg-slate-200 dark:bg-slate-800 md:left-[8.5rem]" />

          <div className="space-y-12">
            {releases.map((release) => (
              <div key={release.version} className="relative group">
                {/* Timeline Dot */}
                <div className="absolute left-[13px] top-2.5 w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 ring-4 ring-white dark:ring-slate-950 group-hover:bg-cyan-500 transition-colors duration-300 md:left-[8.5rem] md:-ml-[4px]" />

                <div className="md:flex gap-12 pl-12 md:pl-0">
                  {/* Meta */}
                  <div className="mb-4 md:mb-0 md:w-32 md:text-right md:pt-1 flex-shrink-0">
                    <div className="font-mono text-lg font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                      v{release.version}
                    </div>
                    <div className="text-xs text-slate-500 mt-1 font-medium">
                      {release.date}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:border-cyan-500/30 transition-colors duration-300">
                      <ul className="space-y-4">
                        {release.changes.map((change, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <div
                              className={`mt-1 p-1.5 rounded-md flex-shrink-0 ${
                                change.type === "feat"
                                  ? "bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                  : change.type === "fix"
                                  ? "bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400"
                                  : "bg-slate-200 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400"
                              }`}
                            >
                              {change.type === "feat" && (
                                <Sparkles className="w-3.5 h-3.5" />
                              )}
                              {change.type === "fix" && (
                                <Bug className="w-3.5 h-3.5" />
                              )}
                              {change.type === "chore" && (
                                <Wrench className="w-3.5 h-3.5" />
                              )}
                            </div>
                            <span className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                              {change.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
