import Logo from "@/components/logo";
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export function baseOptions(): BaseLayoutProps {
  return {
    githubUrl: "https://github.com/Lymore01/axeom",
    nav: {
      title: <Logo />,
      transparentMode: "always",
    },
    searchToggle: {
      enabled: true,
    },
    themeSwitch: {
      enabled: false,
    },
    links: [
      {
        type: "custom",
        on: "nav",
        children: (
          <a href="/docs" className="text-sm font-medium text-white">
            Documentations
          </a>
        ),
      },
    ],
  };
}
