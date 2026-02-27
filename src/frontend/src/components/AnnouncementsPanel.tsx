import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Megaphone, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLang } from "../contexts/LanguageContext";
import { ErrorState } from "./LoadingState";
import {
  useAnnouncements,
  useCreateAnnouncement,
  useGetBranches,
} from "../hooks/useQueries";
import type { Announcement } from "../hooks/useQueries";

// ---- Helpers ----

function nanosToDate(nanos: bigint): Date {
  return new Date(Number(nanos / BigInt(1_000_000)));
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ---- Announcement Item ----

function AnnouncementItem({ item, lang }: { item: Announcement; lang: string }) {
  const title = lang === "en" ? item.title : item.titleHindi;
  const body = lang === "en" ? item.body : item.bodyHindi;
  const isAll = !item.targetBranch || item.targetBranch === "all";
  const date = nanosToDate(item.createdAt);

  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2 animate-fade-in">
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold text-sm text-foreground leading-tight flex-1">{title}</p>
        <Badge
          className={
            isAll
              ? "bg-blue-100 text-blue-700 border border-blue-200 text-[10px] shrink-0"
              : "bg-green-100 text-green-700 border border-green-200 text-[10px] shrink-0"
          }
        >
          {isAll ? "All Branches / सभी शाखाएं" : item.targetBranch}
        </Badge>
      </div>
      {body && (
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
          {body}
        </p>
      )}
      <p className="text-[10px] text-muted-foreground/70 pt-0.5">{formatDate(date)}</p>
    </div>
  );
}

// ---- Announcements Panel ----

export default function AnnouncementsPanel() {
  const { lang, bi, tx } = useLang();

  // Queries
  const { data: announcements, isLoading: announcementsLoading, isError: announcementsError, refetch } = useAnnouncements();
  const { data: branches } = useGetBranches();
  const { mutate: createAnnouncement, isPending: isSending } = useCreateAnnouncement();

  // Form state
  const [title, setTitle] = useState("");
  const [titleHindi, setTitleHindi] = useState("");
  const [body, setBody] = useState("");
  const [bodyHindi, setBodyHindi] = useState("");
  const [targetBranch, setTargetBranch] = useState("all");

  const resetForm = () => {
    setTitle("");
    setTitleHindi("");
    setBody("");
    setBodyHindi("");
    setTargetBranch("all");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !titleHindi.trim()) {
      toast.error(lang === "en" ? "Title is required in both languages" : "दोनों भाषाओं में शीर्षक आवश्यक है");
      return;
    }
    createAnnouncement(
      {
        title: title.trim(),
        titleHindi: titleHindi.trim(),
        body: body.trim(),
        bodyHindi: bodyHindi.trim(),
        targetBranch: targetBranch === "all" ? "all" : targetBranch,
      },
      {
        onSuccess: () => {
          toast.success(bi("announcementSent").primary);
          resetForm();
        },
        onError: (e) => toast.error(e.message),
      },
    );
  };

  // Sort announcements: most recent first
  const sorted = announcements
    ? [...announcements].sort((a, b) => Number(b.createdAt - a.createdAt))
    : [];

  return (
    <Card className="overflow-hidden animate-fade-in">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Megaphone className="h-4 w-4 text-primary" />
          <span>{bi("announcementsPanel").primary}</span>
          <span className="text-xs text-muted-foreground font-hindi ml-1">
            {bi("announcementsPanel").secondary}
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="px-4 pb-4 space-y-4">
        {/* ---- Create Form ---- */}
        <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-border bg-muted/20 p-4">
          <p className="text-xs font-semibold text-foreground uppercase tracking-wider">
            {bi("createAnnouncement").primary} · <span className="font-hindi">{bi("createAnnouncement").secondary}</span>
          </p>

          {/* Title row */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">{bi("titleEn_ann").primary}</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title in English"
                className="h-10 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-hindi">{bi("titleHi_ann").secondary}</Label>
              <Input
                value={titleHindi}
                onChange={(e) => setTitleHindi(e.target.value)}
                placeholder="हिंदी में शीर्षक"
                className="h-10 text-sm font-hindi"
              />
            </div>
          </div>

          {/* Body row */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">{bi("bodyEn_ann").primary}</Label>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Message in English"
                className="min-h-[80px] text-sm resize-none"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-hindi">{bi("bodyHi_ann").secondary}</Label>
              <Textarea
                value={bodyHindi}
                onChange={(e) => setBodyHindi(e.target.value)}
                placeholder="हिंदी में संदेश"
                className="min-h-[80px] text-sm font-hindi resize-none"
              />
            </div>
          </div>

          {/* Target Branch */}
          <div className="space-y-1">
            <Label className="text-xs">
              {bi("targetBranchLabel").primary} / <span className="font-hindi">{bi("targetBranchLabel").secondary}</span>
            </Label>
            <Select value={targetBranch} onValueChange={setTargetBranch}>
              <SelectTrigger className="h-10 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  All Branches / <span className="font-hindi">सभी शाखाएं</span>
                </SelectItem>
                {branches?.map((branch) => (
                  <SelectItem key={branch.id.toString()} value={branch.name}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isSending || !title.trim() || !titleHindi.trim()}
            className="w-full h-11 wine-gradient text-white tap-target"
          >
            {isSending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Megaphone className="mr-2 h-4 w-4" />
            )}
            {bi("sendAnnouncement").primary}
            <span className="ml-1.5 text-xs opacity-80 font-hindi">
              {bi("sendAnnouncement").secondary}
            </span>
          </Button>
        </form>

        {/* ---- Announcements List ---- */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {lang === "en" ? "Recent Announcements" : "हाल की घोषणाएं"}
          </p>

          {/* Loading */}
          {announcementsLoading && (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          )}

          {/* Error */}
          {announcementsError && <ErrorState onRetry={() => refetch()} />}

          {/* Empty state */}
          {!announcementsLoading && !announcementsError && sorted.length === 0 && (
            <div className="flex flex-col items-center py-8 gap-2 text-muted-foreground">
              <Megaphone className="h-10 w-10 opacity-25" />
              <p className="text-sm">{bi("noAnnouncementsYet").primary}</p>
              <p className="text-xs font-hindi opacity-70">{bi("noAnnouncementsYet").secondary}</p>
            </div>
          )}

          {/* List — scrollable if more than 5 */}
          {!announcementsLoading && !announcementsError && sorted.length > 0 && (
            sorted.length > 5 ? (
              <ScrollArea className="h-[420px] pr-1">
                <div className="space-y-2">
                  {sorted.map((item) => (
                    <AnnouncementItem key={item.id.toString()} item={item} lang={lang} />
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="space-y-2">
                {sorted.map((item) => (
                  <AnnouncementItem key={item.id.toString()} item={item} lang={lang} />
                ))}
              </div>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}
