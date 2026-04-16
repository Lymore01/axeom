import Logo from "@/components/logo";
import { baseOptions } from "@/lib/layout.shared";
import { source } from "@/lib/source";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { nav, ...base } = baseOptions();

  return (
    <DocsLayout
      tree={source.pageTree}
      {...base}
      nav={{
        ...nav,
        title: <Logo />,
      }}
      githubUrl="https://github.com/Lymore01/axeom"
    >
      {children}
    </DocsLayout>
  );
}
