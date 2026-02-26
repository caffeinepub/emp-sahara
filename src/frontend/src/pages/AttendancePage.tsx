import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, LogIn, LogOut, Calendar, Users, Filter } from "lucide-react";
import { useLang } from "../contexts/LanguageContext";
import { StatusBadge } from "../components/StatusBadge";
import { ErrorState, EmptyState } from "../components/LoadingState";
import {
  useCheckIn, useCheckOut, useAttendanceHistory,
  useLeaderboard, useGetBranches, Role,
} from "../hooks/useQueries";
import type { UserProfile, AttendanceRecord, LeaderboardEntry } from "../backend.d";
import type { Principal } from "@icp-sdk/core/principal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AttendancePageProps {
  profile: UserProfile;
  principal: Principal;
}

function formatTime(ns: bigint | undefined): string {
  if (!ns) return "--:--";
  const ms = Number(ns) / 1_000_000;
  const date = new Date(ms);
  return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function RecordRow({ record }: { record: AttendanceRecord }) {
  const statusKey = record.status as "present" | "late" | "absent" | "onLeave";
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{record.date}</p>
          <div className="flex gap-2 mt-0.5 text-xs text-muted-foreground">
            <span>{formatTime(record.checkIn)} – {formatTime(record.checkOut)}</span>
          </div>
        </div>
      </div>
      <StatusBadge status={statusKey} />
    </div>
  );
}

// ---- All Employees Attendance (Management view) ----

function EmployeeAttendanceRow({ entry }: { entry: LeaderboardEntry }) {
  const { lang } = useLang();
  const displayName = lang === "en" ? entry.name : entry.nameHindi;
  const initials = entry.name.split(" ").map((w) => w[0]?.toUpperCase() ?? "").slice(0, 2).join("");

  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-0">
      {/* Avatar */}
      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-xs font-bold text-primary">
        {initials}
      </div>
      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
        <p className="text-xs text-muted-foreground">{entry.branch}</p>
      </div>
      {/* No real-time per-employee attendance available — show placeholder */}
      <Badge className="text-xs bg-muted text-muted-foreground border border-border shrink-0">
        --
      </Badge>
    </div>
  );
}

function AllEmployeesAttendance() {
  const { bi, tx } = useLang();
  const { data: leaderboard, isLoading, isError, refetch } = useLeaderboard();
  const { data: branches } = useGetBranches();
  const [selectedBranch, setSelectedBranch] = useState<string>("all");

  const filtered = selectedBranch === "all"
    ? (leaderboard ?? [])
    : (leaderboard ?? []).filter((e) => e.branch === selectedBranch);

  return (
    <div className="space-y-4">
      {/* Branch filter */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
        <Select value={selectedBranch} onValueChange={setSelectedBranch}>
          <SelectTrigger className="h-9 text-sm flex-1">
            <SelectValue placeholder={bi("filterBranch").primary} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {bi("allBranches").primary} · {bi("allBranches").secondary}
            </SelectItem>
            {branches?.map((b) => (
              <SelectItem key={b.id.toString()} value={b.name}>{b.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Note about data */}
      <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
        <p className="text-xs text-amber-700 leading-relaxed">
          {tx("allEmployees")}: {filtered.length} {tx("allStaff")}
        </p>
        <p className="text-[10px] text-amber-600 font-hindi mt-0.5">
          {bi("noDataYet").secondary} — {bi("attendanceHistory").secondary}
        </p>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Header */}
        <div className="px-4 py-2 bg-muted/50 border-b border-border grid grid-cols-3 gap-2">
          <span className="text-xs font-medium text-muted-foreground">{bi("name").primary}</span>
          <span className="text-xs font-medium text-muted-foreground">{bi("branch").primary}</span>
          <span className="text-xs font-medium text-muted-foreground text-right">{bi("todayAttendance").primary}</span>
        </div>

        {isLoading && (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4].map((k) => <Skeleton key={k} className="h-12 rounded-lg" />)}
          </div>
        )}
        {isError && <ErrorState onRetry={() => refetch()} />}
        {!isLoading && !isError && filtered.length === 0 && (
          <EmptyState icon="👥" message={tx("noAttendance")} />
        )}
        {!isLoading && !isError && filtered.length > 0 && (
          <div className="divide-y divide-border">
            {filtered.map((entry) => (
              <EmployeeAttendanceRow key={entry.principal.toString()} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Main ----

export default function AttendancePage({ profile, principal }: AttendancePageProps) {
  const { bi, tx } = useLang();
  const attendance = useAttendanceHistory(principal);
  const checkIn  = useCheckIn();
  const checkOut = useCheckOut();
  const isManagement = profile.role === Role.management;

  const todayRecord = attendance.data?.[0];
  const isCheckedIn = !!todayRecord?.checkIn && !todayRecord?.checkOut;
  const isCheckedOut = !!todayRecord?.checkIn && !!todayRecord?.checkOut;

  const handleCheckIn = () => {
    checkIn.mutate(undefined, {
      onSuccess: () => toast.success(bi("checkedIn").primary),
      onError: (e) => toast.error(e.message),
    });
  };

  const handleCheckOut = () => {
    checkOut.mutate(undefined, {
      onSuccess: () => toast.success(bi("checkOut").primary),
      onError: (e) => toast.error(e.message),
    });
  };

  // My attendance section (shared between management and staff)
  const MyAttendanceSection = (
    <>
      {/* Big check-in/out card */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden animate-slide-up">
        <div className="wine-gradient wine-texture px-5 pt-5 pb-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-5 w-5 text-gold-light" />
            <div>
              <p className="text-white font-semibold text-sm">{bi("todayAttendance").primary}</p>
              <p className="text-white/60 text-xs font-hindi">{bi("todayAttendance").secondary}</p>
            </div>
          </div>

          {attendance.isLoading ? (
            <Skeleton className="h-8 w-32 bg-white/20" />
          ) : (
            <div className="flex items-center gap-3">
              {todayRecord ? (
                <StatusBadge status={todayRecord.status as "present" | "late" | "absent" | "onLeave"} />
              ) : (
                <span className="text-white/50 text-sm font-hindi">{tx("notCheckedIn")}</span>
              )}
              {todayRecord?.checkIn && (
                <span className="text-white/70 text-xs">
                  In: {formatTime(todayRecord.checkIn)}
                  {todayRecord.checkOut && ` · Out: ${formatTime(todayRecord.checkOut)}`}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="p-5">
          {!isCheckedIn && !isCheckedOut && (
            <Button
              onClick={handleCheckIn}
              disabled={checkIn.isPending || attendance.isLoading}
              className="w-full h-14 text-base font-semibold rounded-xl wine-gradient text-white shadow-wine tap-target"
            >
              <LogIn className="mr-2 h-5 w-5" />
              <span>{bi("checkIn").primary}</span>
              <span className="ml-2 text-sm opacity-80 font-hindi">{bi("checkIn").secondary}</span>
            </Button>
          )}

          {isCheckedIn && (
            <Button
              onClick={handleCheckOut}
              disabled={checkOut.isPending}
              variant="outline"
              className="w-full h-14 text-base font-semibold rounded-xl border-2 border-primary text-primary tap-target"
            >
              <LogOut className="mr-2 h-5 w-5" />
              <span>{bi("checkOut").primary}</span>
              <span className="ml-2 text-sm opacity-70 font-hindi">{bi("checkOut").secondary}</span>
            </Button>
          )}

          {isCheckedOut && (
            <div className="flex items-center justify-center gap-2 h-14 rounded-xl bg-green-50 border border-green-200">
              <span className="text-green-700 font-semibold text-sm">✓ {bi("checkOut").primary}</span>
              <span className="text-green-600 text-xs font-hindi">{bi("checkOut").secondary}</span>
            </div>
          )}
        </div>
      </div>

      {/* History */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            {bi("attendanceHistory").primary}
            <span className="text-xs text-muted-foreground font-hindi ml-2">
              {bi("attendanceHistory").secondary}
            </span>
          </h3>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {attendance.isLoading && (
            <div className="p-4 space-y-3">
              {["a","b","c","d"].map((k) => <Skeleton key={k} className="h-14 rounded-lg" />)}
            </div>
          )}

          {attendance.isError && (
            <ErrorState onRetry={() => attendance.refetch()} />
          )}

          {!attendance.isLoading && !attendance.isError && (
            attendance.data && attendance.data.length > 0 ? (
              <div className="px-4 divide-y divide-border">
                {attendance.data.map((record) => (
                  <RecordRow key={record.date} record={record} />
                ))}
              </div>
            ) : (
              <EmptyState icon="📅" message={tx("noAttendance")} />
            )
          )}
        </div>
      </div>
    </>
  );

  // Management view: tabs
  if (isManagement) {
    return (
      <main className="pb-nav px-4 pt-4 space-y-5">
        <Tabs defaultValue="all">
          <TabsList className="w-full h-10 mb-2">
            <TabsTrigger value="all" className="flex-1 text-xs">
              <Users className={cn("h-3.5 w-3.5 mr-1")} />
              {bi("allEmployees").primary}
              <span className="ml-1 font-hindi text-[10px] opacity-70">{bi("allEmployees").secondary}</span>
            </TabsTrigger>
            <TabsTrigger value="mine" className="flex-1 text-xs">
              <Clock className="h-3.5 w-3.5 mr-1" />
              {bi("myAttendance").primary}
              <span className="ml-1 font-hindi text-[10px] opacity-70">{bi("myAttendance").secondary}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-0">
            <AllEmployeesAttendance />
          </TabsContent>

          <TabsContent value="mine" className="space-y-5 mt-0">
            {MyAttendanceSection}
          </TabsContent>
        </Tabs>
      </main>
    );
  }

  // Regular employee view
  return (
    <main className="pb-nav px-4 pt-4 space-y-5">
      {MyAttendanceSection}
    </main>
  );
}
