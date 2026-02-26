import React from "react";
import { useLang } from "../contexts/LanguageContext";
import type { TKey } from "../lib/i18n";
import { cn } from "@/lib/utils";

interface BiLabelProps {
  tKey: TKey;
  className?: string;
  primaryClass?: string;
  secondaryClass?: string;
  inline?: boolean;
}

/**
 * Renders a bilingual label: primary language large, secondary smaller below/beside.
 */
export function BiLabel({
  tKey,
  className,
  primaryClass,
  secondaryClass,
  inline = false,
}: BiLabelProps) {
  const { bi } = useLang();
  const { primary, secondary } = bi(tKey);

  if (inline) {
    return (
      <span className={cn("inline-flex items-baseline gap-1.5", className)}>
        <span className={cn("font-medium", primaryClass)}>{primary}</span>
        <span className={cn("text-xs opacity-60 font-hindi", secondaryClass)}>{secondary}</span>
      </span>
    );
  }

  return (
    <span className={cn("flex flex-col leading-tight", className)}>
      <span className={cn("font-medium", primaryClass)}>{primary}</span>
      <span className={cn("text-xs opacity-60 font-hindi mt-0.5", secondaryClass)}>{secondary}</span>
    </span>
  );
}

/** Quick inline text in selected language only */
export function T({ tKey, className }: { tKey: TKey; className?: string }) {
  const { tx } = useLang();
  return <span className={className}>{tx(tKey)}</span>;
}
