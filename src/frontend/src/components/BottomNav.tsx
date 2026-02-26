import React from "react";
import { Home, Clock, CheckSquare, Trophy, User } from "lucide-react";
import { useLang } from "../contexts/LanguageContext";
import { cn } from "@/lib/utils";
import type { TKey } from "../lib/i18n";

export type TabId = "home" | "attendance" | "tasks" | "rewards" | "profile";

interface Tab {
  id: TabId;
  tKey: TKey;
  icon: React.ElementType;
}

const TABS: Tab[] = [
  { id: "home",       tKey: "home",       icon: Home },
  { id: "attendance", tKey: "attendance", icon: Clock },
  { id: "tasks",      tKey: "tasks",      icon: CheckSquare },
  { id: "rewards",    tKey: "rewards",    icon: Trophy },
  { id: "profile",    tKey: "profile",    icon: User },
];

interface BottomNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const { bi } = useLang();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border bottom-nav shadow-lg">
      <div className="flex items-stretch">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const { primary, secondary } = bi(tab.tKey);
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-all tap-target",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-label={`${primary} / ${secondary}`}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-transform",
                  isActive && "scale-110",
                )}
              />
              <span
                className={cn(
                  "text-[9px] leading-tight font-medium",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
              >
                {primary}
              </span>
              <span className="text-[8px] leading-tight text-muted-foreground font-hindi opacity-70">
                {secondary}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
