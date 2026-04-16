"use client";
import { useI18n } from "fumadocs-ui/contexts/i18n";
import { useSearchContext } from "fumadocs-ui/contexts/search";
import { Search } from "lucide-react";
import type { ComponentProps } from "react";
import {
  type ButtonProps,
  buttonVariants,
} from "../../../components/ui/button";
import { cn } from "../../../lib/cn";

export interface SearchTriggerProps
  extends Omit<ComponentProps<"button">, "color">, ButtonProps {
  hideIfDisabled?: boolean;
}

export function SearchTrigger({
  hideIfDisabled,
  size = "icon-sm",
  color = "ghost",
  ...props
}: SearchTriggerProps) {
  const { setOpenSearch, enabled } = useSearchContext();
  if (hideIfDisabled && !enabled) return null;

  return (
    <button
      type="button"
      className={cn(
        buttonVariants({
          size,
          color,
        }),
        props.className,
      )}
      data-search=""
      aria-label="Open Search"
      onClick={() => {
        setOpenSearch(true);
      }}
    >
      <Search />
    </button>
  );
}

export interface FullSearchTriggerProps extends ComponentProps<"button"> {
  hideIfDisabled?: boolean;
}

export function FullSearchTrigger({
  hideIfDisabled,
  ...props
}: FullSearchTriggerProps) {
  const { enabled, hotKey, setOpenSearch } = useSearchContext();
  const { text } = useI18n();
  if (hideIfDisabled && !enabled) return null;

  return (
    <button
      type="button"
      data-search-full=""
      {...props}
      className={cn(
        "inline-flex items-center gap-2 rounded-none border border-white/10 bg-black p-2 ps-3 text-xs font-medium text-white/40 transition-all hover:bg-white/5 hover:text-white hover:border-white/20",
        props.className,
      )}
      onClick={() => {
        setOpenSearch(true);
      }}
    >
      <Search className="size-3.5 opacity-60" />
      <span className="font-mono uppercase tracking-[0.1em]">{text.search}</span>
      <div className="ms-auto inline-flex gap-1">
        {hotKey.map((k, i) => (
          <kbd key={i} className="rounded-none border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px] text-white/60">
            {k.display}
          </kbd>
        ))}
      </div>
    </button>
  );
}
