import { RootProvider } from "fumadocs-ui/provider/next";
import { Command } from "lucide-react";
import { Metadata } from "next";
import { Outfit } from "next/font/google";
import React from "react";
import "./global.css";

const outfit = Outfit({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Axeom | The Weightless Web Engine",
  description:
    "A high-performance, type-safe, and runtime-agnostic web framework for the modern edge.",
  icons: {
    icon: [
      {
        media: "(prefers-color-scheme: light)",
        url: "/images/icon-light.png",
        href: "/images/icon-light.png",
      },
      {
        media: "(prefers-color-scheme: dark)",
        url: "/images/icon-dark.png",
        href: "/images/icon-dark.png",
      },
    ],
  },
};

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
                    <span className="text-[10px] font-mono translate-y-[0.5px]">
                      K
                    </span>
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
