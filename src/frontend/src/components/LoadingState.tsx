import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useLang } from "../contexts/LanguageContext";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <Loader2 className={cn("h-6 w-6 animate-spin text-primary", className)} />
  );
}

export function PageLoader() {
  const { tx } = useLang();
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
      <LoadingSpinner className="h-8 w-8" />
      <p className="text-sm text-muted-foreground font-hindi">{tx("loading")}</p>
    </div>
  );
}

const SKELETON_IDS = ["a", "b", "c", "d", "e"] as const;

export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {SKELETON_IDS.slice(0, count).map((id) => (
        <div key={`skel-${id}`} className="rounded-xl border bg-card p-4 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}

export function ErrorState({ onRetry, message }: { onRetry?: () => void; message?: string }) {
  const { tx } = useLang();
  return (
    <div className="flex flex-col items-center justify-center min-h-[20vh] gap-3 text-center p-4">
      <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
        <span className="text-2xl">⚠️</span>
      </div>
      <p className="text-sm text-muted-foreground">{message ?? tx("error")}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="text-sm font-medium text-primary underline underline-offset-2"
        >
          {tx("retry")}
        </button>
      )}
    </div>
  );
}

export function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-3 text-center px-4">
      <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-2xl">
        {icon}
      </div>
      <p className="text-sm text-muted-foreground font-hindi">{message}</p>
    </div>
  );
}
