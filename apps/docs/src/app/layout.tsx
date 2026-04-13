import { RootProvider } from "fumadocs-ui/provider/next";
import { Command } from "lucide-react";
import { Outfit } from "next/font/google";
import React from "react";
import "./global.css";

const outfit = Outfit({
  subsets: ["latin"],
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${outfit.className} axeom-scroll`}
      suppressHydrationWarning
    >
      <body className="flex flex-col min-h-screen">
        <RootProvider
          search={{
            hotKey: [
              {
                display: (
                  <div className="flex items-center gap-0.5 opacity-60">
                    <Command className="size-3" />
                    <span className="text-[10px] font-mono translate-y-[0.5px]">K</span>
                  </div>
                ),
                key: "k",
              },
            ],
          }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
