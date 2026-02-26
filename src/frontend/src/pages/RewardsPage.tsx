import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trophy, Star, Medal, Info } from "lucide-react";
import { useLang } from "../contexts/LanguageContext";
import { ErrorState, EmptyState } from "../components/LoadingState";
import { useLeaderboard, useOwnPointsAndRank } from "../hooks/useQueries";
import type { UserProfile, LeaderboardEntry } from "../backend.d";
import { cn } from "@/lib/utils";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface RewardsPageProps {
  profile: UserProfile;
}

const RANK_MEDALS = ["🥇", "🥈", "🥉"];

export default function RewardsPage({ profile }: RewardsPageProps) {
  const { lang, bi, tx } = useLang();
  const { identity } = useInternetIdentity();
  const leaderboard = useLeaderboard();
  const pointsRank  = useOwnPointsAndRank();

  const myPrincipal = identity?.getPrincipal().toString();

  return (
    <main className="pb-nav px-4 pt-4 space-y-5">
      {/* Hero: My Points + Rank */}
      <div className="rounded-2xl wine-gradient wine-texture p-5 shadow-wine animate-slide-up">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="h-5 w-5 text-gold-light" />
          <div>
            <p className="text-white font-semibold text-sm">{bi("rewards").primary}</p>
            <p className="text-white/60 text-xs font-hindi">{bi("rewards").secondary}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="flex justify-center mb-1">
              <Star className="h-5 w-5 text-gold-light" />
            </div>
            {pointsRank.isLoading ? (
              <Skeleton className="h-8 w-16 mx-auto bg-white/20" />
            ) : (
              <p className="text-3xl font-display font-bold text-white">
                {Number(pointsRank.data?.points ?? 0)}
              </p>
            )}
            <p className="text-xs text-white/70 mt-0.5">
              {bi("yourPoints").primary}
            </p>
            <p className="text-[10px] text-white/50 font-hindi">{bi("yourPoints").secondary}</p>
          </div>

          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="flex justify-center mb-1">
              <Medal className="h-5 w-5 text-gold-light" />
            </div>
            {pointsRank.isLoading ? (
              <Skeleton className="h-8 w-16 mx-auto bg-white/20" />
            ) : (
              <p className="text-3xl font-display font-bold text-white">
                #{Number(pointsRank.data?.rank ?? 0)}
              </p>
            )}
            <p className="text-xs text-white/70 mt-0.5">
              {bi("yourRank").primary}
            </p>
            <p className="text-[10px] text-white/50 font-hindi">{bi("yourRank").secondary}</p>
          </div>
        </div>
      </div>

      {/* Points Guide */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3 animate-fade-in">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">
            {bi("pointsGuide").primary}
            <span className="text-xs text-muted-foreground font-hindi ml-2">{bi("pointsGuide").secondary}</span>
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: bi("routineTask"), pts: "10" },
            { label: bi("urgentTask"), pts: "25" },
          ].map((item) => (
            <div key={item.pts} className="bg-muted rounded-lg px-3 py-2 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-foreground leading-tight">{item.label.primary}</p>
                <p className="text-[10px] text-muted-foreground font-hindi leading-tight">{item.label.secondary}</p>
              </div>
              <div className="gold-gradient rounded-full px-2 py-0.5 ml-2 shrink-0">
                <span className="text-xs font-bold text-white">+{item.pts}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="space-y-3 animate-fade-in">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">
            {bi("leaderboard").primary}
            <span className="text-xs text-muted-foreground font-hindi ml-2">{bi("leaderboard").secondary}</span>
          </h3>
        </div>

        {leaderboard.isLoading && (
          <div className="space-y-2">
            {["a","b","c","d","e"].map((k) => <Skeleton key={k} className="h-12 rounded-lg" />)}
          </div>
        )}

        {leaderboard.isError && <ErrorState onRetry={() => leaderboard.refetch()} />}

        {!leaderboard.isLoading && !leaderboard.isError && (
          leaderboard.data && leaderboard.data.length > 0 ? (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-xs w-12 text-center">
                      {bi("rank").primary}
                    </TableHead>
                    <TableHead className="text-xs">
                      {bi("name").primary}
                    </TableHead>
                    <TableHead className="text-xs">
                      {bi("branch").primary}
                    </TableHead>
                    <TableHead className="text-xs text-right">
                      {bi("points").primary}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboard.data.map((entry: LeaderboardEntry) => {
                    const isMe = entry.principal.toString() === myPrincipal;
                    const rankNum = Number(entry.rank);
                    return (
                      <TableRow
                        key={entry.principal.toString()}
                        className={cn(
                          isMe && "bg-primary/5 font-semibold",
                        )}
                      >
                        <TableCell className="text-center text-sm font-medium">
                          {rankNum <= 3 ? RANK_MEDALS[rankNum - 1] : `#${rankNum}`}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium leading-tight">
                              {lang === "en" ? entry.name : entry.nameHindi}
                              {isMe && <span className="ml-1 text-[10px] text-primary">(You)</span>}
                            </p>
                            <p className="text-[10px] text-muted-foreground font-hindi leading-tight">
                              {lang === "en" ? entry.nameHindi : entry.name}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {entry.branch}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-sm font-bold text-primary">
                            {Number(entry.points)}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState icon="🏆" message="No entries yet / अभी कोई प्रविष्टि नहीं" />
          )
        )}
      </div>
    </main>
  );
}
