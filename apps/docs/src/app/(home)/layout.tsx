import { baseOptions } from "@/lib/layout.shared";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Axeom",
  description: "The weightless framework for heavy performance.",
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
  return <HomeLayout {...baseOptions()}>{children}</HomeLayout>;
}
