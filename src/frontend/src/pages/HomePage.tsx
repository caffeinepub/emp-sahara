import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bell, Star, CheckSquare, Calendar, ChevronRight, Megaphone,
} from "lucide-react";
import { useLang } from "../contexts/LanguageContext";
import { StatusBadge } from "../components/StatusBadge";
import { EmptyState, ErrorState } from "../components/LoadingState";
import {
  useAttendanceHistory,
  useOwnPointsAndRank,
  useLeaveBalance,
  useAnnouncements,
  useMarkAnnouncementRead,
} from "../hooks/useQueries";
import type { UserProfile, Announcement } from "../backend.d";
import { AttendanceStatus } from "../backend.d";
import type { Principal } from "@icp-sdk/core/principal";
import { cn } from "@/lib/utils";

interface HomePageProps {
  profile: UserProfile;
  principal: Principal;
}

function getGreeting(lang: "en" | "hi"): string {
  const hour = new Date().getHours();
  if (hour < 12) return lang === "en" ? "Good Morning" : "सुप्रभात";
  if (hour < 17) return lang === "en" ? "Good Afternoon" : "नमस्कार";
  return lang === "en" ? "Good Evening" : "शुभ संध्या";
}

function AnnouncementCard({ ann, lang }: { ann: Announcement; lang: "en" | "hi" }) {
  const { markRead } = { markRead: useMarkAnnouncementRead().mutate };
  const title = lang === "en" ? ann.title : ann.titleHindi;
  const body  = lang === "en" ? ann.body  : ann.bodyHindi;

  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/60 border border-border animate-fade-in">
      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
        <Megaphone className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground leading-tight truncate">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 font-hindi">{body}</p>
      </div>
      <button
        type="button"
        onClick={() => markRead(ann.id)}
        className="p-1 rounded hover:bg-background/60 shrink-0"
      >
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </button>
    </div>
  );
}

export default function HomePage({ profile, principal }: HomePageProps) {
  const { lang, tx, bi } = useLang();

  const attendance  = useAttendanceHistory(principal);
  const pointsRank  = useOwnPointsAndRank();
  const leaveBalance = useLeaveBalance();
  const announcements = useAnnouncements();

  const todayRecord = attendance.data?.[0];
  const todayStatus = todayRecord?.status ?? null;

  const totalLeave = leaveBalance.data
    ? Number(leaveBalance.data.sick) + Number(leaveBalance.data.casual) + Number(leaveBalance.data.earned) + Number(leaveBalance.data.emergency)
    : 0;

  const pendingTasks = 0; // Will come from tasks page

  const greeting = getGreeting(lang);
  const displayName = lang === "en" ? profile.name : profile.nameHindi;

  return (
    <main className="pb-nav px-4 pt-4 space-y-5">
      {/* Greeting */}
      <div className="animate-slide-up">
        <div className="rounded-2xl wine-gradient wine-texture p-5 shadow-wine">
          <p className="text-white/70 text-sm font-hindi">{greeting}</p>
          <h2 className="text-2xl font-display font-bold text-white mt-0.5">{displayName}</h2>
          <p className="text-white/60 text-xs mt-0.5">
            {profile.department} · {profile.branch}
          </p>

          {/* Today status */}
          <div className="mt-4 flex items-center gap-2">
            <span className="text-white/70 text-xs">{bi("todayStatus").primary}:</span>
            {todayStatus ? (
              <StatusBadge status={todayStatus as "present" | "late" | "absent" | "onLeave"} />
            ) : (
              <span className="text-xs text-white/50 font-hindi">--</span>
            )}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 stagger">
        {/* Points */}
        <Card className="animate-fade-in shadow-xs overflow-hidden">
          <CardContent className="p-3 flex flex-col items-center text-center gap-1">
            <div className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center">
              <Star className="h-4 w-4 text-white" />
            </div>
            {pointsRank.isLoading ? (
              <Skeleton className="h-5 w-10 mt-1" />
            ) : (
              <p className="text-xl font-display font-bold text-foreground">
                {Number(pointsRank.data?.points ?? 0)}
              </p>
            )}
            <p className="text-[10px] text-muted-foreground font-hindi leading-tight">
              {bi("pointsMonth").primary}
            </p>
          </CardContent>
        </Card>

        {/* Leave */}
        <Card className="animate-fade-in shadow-xs overflow-hidden">
          <CardContent className="p-3 flex flex-col items-center text-center gap-1">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
            {leaveBalance.isLoading ? (
              <Skeleton className="h-5 w-10 mt-1" />
            ) : (
              <p className="text-xl font-display font-bold text-foreground">
                {totalLeave}
              </p>
            )}
            <p className="text-[10px] text-muted-foreground font-hindi leading-tight">
              {bi("leaveBalance").primary}
            </p>
          </CardContent>
        </Card>

        {/* Rank */}
        <Card className="animate-fade-in shadow-xs overflow-hidden">
          <CardContent className="p-3 flex flex-col items-center text-center gap-1">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
              <CheckSquare className="h-4 w-4 text-amber-600" />
            </div>
            {pointsRank.isLoading ? (
              <Skeleton className="h-5 w-10 mt-1" />
            ) : (
              <p className="text-xl font-display font-bold text-foreground">
                #{Number(pointsRank.data?.rank ?? 0)}
              </p>
            )}
            <p className="text-[10px] text-muted-foreground font-hindi leading-tight">
              {bi("yourRank").primary}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Announcements */}
      <div className="space-y-3 animate-fade-in">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            {bi("announcements").primary}
            <span className="text-xs text-muted-foreground font-hindi ml-2">{bi("announcements").secondary}</span>
          </h3>
        </div>

        {announcements.isLoading && (
          <div className="space-y-2">
            {["a","b"].map((k) => (
              <Skeleton key={k} className="h-16 rounded-xl" />
            ))}
          </div>
        )}

        {announcements.isError && (
          <ErrorState onRetry={() => announcements.refetch()} />
        )}

        {!announcements.isLoading && !announcements.isError && (
          announcements.data && announcements.data.length > 0 ? (
            <div className="space-y-2">
              {announcements.data.slice(0, 5).map((ann) => (
                <AnnouncementCard key={ann.id.toString()} ann={ann} lang={lang} />
              ))}
            </div>
          ) : (
            <EmptyState icon="📢" message={tx("noAnnouncements")} />
          )
        )}
      </div>
    </main>
  );
}
