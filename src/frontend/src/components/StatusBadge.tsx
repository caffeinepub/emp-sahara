import React from "react";
import { Badge } from "@/components/ui/badge";
import { useLang } from "../contexts/LanguageContext";
import type { TKey } from "../lib/i18n";
import { cn } from "@/lib/utils";

type StatusType = "present" | "late" | "absent" | "onLeave" | "pending" | "inProgress" | "completed" | "blocked" | "routine" | "urgent";

const statusConfig: Record<StatusType, { tKey: TKey; classes: string }> = {
  present:    { tKey: "present",    classes: "bg-green-100 text-green-800 border border-green-200" },
  late:       { tKey: "late",       classes: "bg-yellow-100 text-yellow-800 border border-yellow-200" },
  absent:     { tKey: "absent",     classes: "bg-red-100 text-red-800 border border-red-200" },
  onLeave:    { tKey: "onLeave",    classes: "bg-blue-100 text-blue-800 border border-blue-200" },
  pending:    { tKey: "pending",    classes: "bg-yellow-100 text-yellow-800 border border-yellow-200" },
  inProgress: { tKey: "inProgress", classes: "bg-blue-100 text-blue-800 border border-blue-200" },
  completed:  { tKey: "completed",  classes: "bg-green-100 text-green-800 border border-green-200" },
  blocked:    { tKey: "blocked",    classes: "bg-red-100 text-red-800 border border-red-200" },
  routine:    { tKey: "routine",    classes: "bg-gray-100 text-gray-700 border border-gray-200" },
  urgent:     { tKey: "urgent",     classes: "bg-red-100 text-red-700 border border-red-300 font-semibold" },
};

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { bi } = useLang();
  const config = statusConfig[status];
  const { primary, secondary } = bi(config.tKey);

  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
        config.classes,
        className,
      )}
    >
      {primary}
      <span className="text-[10px] opacity-70 font-hindi">({secondary})</span>
    </span>
  );
}
