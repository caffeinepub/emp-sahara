import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  User, Phone, Building2, MapPin, BadgeCheck, Star,
  Calendar, Users, Loader2, AlertTriangle,
  Pencil, Trash2, Check, X, Plus, GitBranch, IdCard,
} from "lucide-react";
import { useLang } from "../contexts/LanguageContext";
import { ErrorState } from "../components/LoadingState";
import { DigitalIdCard } from "../components/DigitalIdCard";
import ManagementPanel from "../components/ManagementPanel";
import AnnouncementsPanel from "../components/AnnouncementsPanel";
import {
  useLeaveBalance,
  useOwnPointsAndRank,
  useUpdateLeaveBalance,
  useDeactivateUser,
  useGetBranches,
  useAddBranch,
  useUpdateBranch,
  useDeleteBranch,
  useGetMyDigitalId,
  useSubmitDigitalIdRequest,
  Role,
} from "../hooks/useQueries";
import type { UserProfile } from "../backend.d";
import { toast } from "sonner";
import { Principal } from "@dfinity/principal";
import { cn } from "@/lib/utils";

interface ProfilePageProps {
  profile: UserProfile;
}

// ---------- Leave Balance Card ----------

function LeaveBalanceCard() {
  const { bi } = useLang();
  const { data, isLoading, isError, refetch } = useLeaveBalance();

  const items = [
    { tKey: "sick" as const, value: data?.sick, color: "bg-blue-100 text-blue-700" },
    { tKey: "casual" as const, value: data?.casual, color: "bg-green-100 text-green-700" },
    { tKey: "earned" as const, value: data?.earned, color: "bg-amber-100 text-amber-700" },
    { tKey: "emergency" as const, value: data?.emergency, color: "bg-red-100 text-red-700" },
  ] as const;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <span>{bi("leaveBalanceTitle").primary}</span>
          <span className="text-xs text-muted-foreground font-hindi ml-1">{bi("leaveBalanceTitle").secondary}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {isLoading && <Skeleton className="h-20 w-full" />}
        {isError && <ErrorState onRetry={() => refetch()} />}
        {!isLoading && !isError && (
          <div className="grid grid-cols-2 gap-2">
            {items.map((item) => (
              <div key={item.tKey} className={cn("rounded-lg p-3 flex flex-col", item.color)}>
                <span className="text-xs font-medium">{bi(item.tKey).primary}</span>
                <span className="text-xs opacity-70 font-hindi">{bi(item.tKey).secondary}</span>
                <span className="text-2xl font-display font-bold mt-1">
                  {Number(item.value ?? 0)}
                </span>
                <span className="text-xs opacity-70">{bi("days").primary}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------- Branch Management Card ----------

function BranchManagementCard() {
  const { bi, tx } = useLang();
  const { data: branches, isLoading, isError, refetch } = useGetBranches();
  const { mutate: addBranch, isPending: isAdding } = useAddBranch();
  const { mutate: updateBranch, isPending: isUpdating } = useUpdateBranch();
  const { mutate: deleteBranch, isPending: isDeleting } = useDeleteBranch();

  const [newBranchName, setNewBranchName] = useState("");
  const [editingId, setEditingId] = useState<bigint | null>(null);
  const [editingName, setEditingName] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<bigint | null>(null);

  const handleAdd = () => {
    const name = newBranchName.trim();
    if (!name) return;
    addBranch(name, {
      onSuccess: () => {
        toast.success(bi("branchAdded").primary);
        setNewBranchName("");
      },
      onError: (e) => toast.error(e.message),
    });
  };

  const handleEditStart = (id: bigint, name: string) => {
    setEditingId(id);
    setEditingName(name);
    setConfirmDeleteId(null);
  };

  const handleEditSave = (id: bigint) => {
    const name = editingName.trim();
    if (!name) return;
    updateBranch(
      { id, name },
      {
        onSuccess: () => {
          toast.success(bi("branchUpdated").primary);
          setEditingId(null);
        },
        onError: (e) => toast.error(e.message),
      },
    );
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleDeleteConfirm = (id: bigint) => {
    deleteBranch(id, {
      onSuccess: () => {
        toast.success(bi("branchDeleted").primary);
        setConfirmDeleteId(null);
      },
      onError: (e) => toast.error(e.message),
    });
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-primary" />
          <span>{bi("manageBranches").primary}</span>
          <span className="text-xs text-muted-foreground font-hindi ml-1">{bi("manageBranches").secondary}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {isLoading && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        )}
        {isError && <ErrorState onRetry={() => refetch()} />}
        {!isLoading && !isError && (
          <div className="space-y-2">
            {/* Empty state */}
            {(!branches || branches.length === 0) && (
              <div className="flex flex-col items-center py-4 gap-1 text-muted-foreground">
                <GitBranch className="h-8 w-8 opacity-30" />
                <p className="text-xs">{bi("noBranches").primary}</p>
                <p className="text-xs font-hindi opacity-70">{bi("noBranches").secondary}</p>
              </div>
            )}

            {/* Branch list */}
            {branches?.map((branch) => (
              <div
                key={branch.id.toString()}
                className="rounded-lg border border-border bg-muted/30 overflow-hidden"
              >
                {editingId === branch.id ? (
                  /* Inline edit row */
                  <div className="flex items-center gap-2 px-3 py-2">
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="h-8 text-sm flex-1"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleEditSave(branch.id);
                        if (e.key === "Escape") handleEditCancel();
                      }}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-green-600 hover:bg-green-50 shrink-0"
                      onClick={() => handleEditSave(branch.id)}
                      disabled={isUpdating}
                    >
                      {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:bg-muted shrink-0"
                      onClick={handleEditCancel}
                      disabled={isUpdating}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : confirmDeleteId === branch.id ? (
                  /* Inline delete confirm row */
                  <div className="flex items-center gap-2 px-3 py-2">
                    <span className="text-xs text-destructive flex-1">
                      {tx("confirm")}?
                    </span>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-7 px-3 text-xs"
                      onClick={() => handleDeleteConfirm(branch.id)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : tx("confirm")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-3 text-xs"
                      onClick={() => setConfirmDeleteId(null)}
                      disabled={isDeleting}
                    >
                      {tx("cancel")}
                    </Button>
                  </div>
                ) : (
                  /* Normal row */
                  <div className="flex items-center gap-2 px-3 py-2">
                    <span className="text-sm font-medium flex-1 truncate">{branch.name}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 shrink-0"
                      onClick={() => handleEditStart(branch.id, branch.name)}
                      title={bi("editBranch").primary}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                      onClick={() => { setConfirmDeleteId(branch.id); setEditingId(null); }}
                      title={bi("deleteBranch").primary}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            ))}

            {/* Add branch row */}
            <div className="flex items-center gap-2 pt-1">
              <Input
                value={newBranchName}
                onChange={(e) => setNewBranchName(e.target.value)}
                placeholder={`${bi("branchName").primary} / ${bi("branchName").secondary}`}
                className="h-9 text-sm flex-1"
                onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
              />
              <Button
                size="icon"
                className="h-9 w-9 wine-gradient text-white shrink-0"
                onClick={handleAdd}
                disabled={isAdding || !newBranchName.trim()}
                title={bi("addBranch").primary}
              >
                {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------- Update Leave Dialog (management) ----------

function UpdateLeaveDialog() {
  const { bi, tx } = useLang();
  const { mutate: updateLeave, isPending } = useUpdateLeaveBalance();
  const [open, setOpen] = useState(false);
  const [principalStr, setPrincipalStr] = useState("");
  const [sick, setSick] = useState("12");
  const [casual, setCasual] = useState("12");
  const [earned, setEarned] = useState("15");
  const [emergency, setEmergency] = useState("5");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let p: Principal;
    try { p = Principal.fromText(principalStr); } catch {
      toast.error("Invalid principal"); return;
    }
    updateLeave(
      { employeeId: p, sick: BigInt(sick), casual: BigInt(casual), earned: BigInt(earned), emergency: BigInt(emergency) },
      { onSuccess: () => { toast.success("Leave updated"); setOpen(false); }, onError: (e) => toast.error(e.message) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="w-full h-10 tap-target">
          <Calendar className="h-3.5 w-3.5 mr-2" />
          {bi("updateLeave").primary} · {bi("updateLeave").secondary}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{bi("updateLeave").primary}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Employee Principal</Label>
            <Input
              value={principalStr}
              onChange={(e) => setPrincipalStr(e.target.value)}
              placeholder="aaaaa-aa..."
              className="h-9 text-sm font-mono"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: bi("sick").primary, val: sick, set: setSick },
              { label: bi("casual").primary, val: casual, set: setCasual },
              { label: bi("earned").primary, val: earned, set: setEarned },
              { label: bi("emergency").primary, val: emergency, set: setEmergency },
            ].map((item) => (
              <div key={item.label} className="space-y-1">
                <Label className="text-xs">{item.label}</Label>
                <Input
                  type="number"
                  min="0"
                  value={item.val}
                  onChange={(e) => item.set(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
            ))}
          </div>
          <Button type="submit" disabled={isPending} className="w-full h-10 wine-gradient text-white tap-target">
            {isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
            {tx("submit")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Deactivate Dialog ----------

function DeactivateDialog() {
  const { bi, tx } = useLang();
  const { mutate: deactivate, isPending } = useDeactivateUser();
  const [open, setOpen] = useState(false);
  const [principalStr, setPrincipalStr] = useState("");

  const handleDeactivate = () => {
    let p: Principal;
    try { p = Principal.fromText(principalStr); } catch {
      toast.error("Invalid principal"); return;
    }
    deactivate(p, {
      onSuccess: () => { toast.success("User deactivated"); setOpen(false); },
      onError: (e) => toast.error(e.message),
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="w-full h-10 border-destructive text-destructive tap-target">
          <AlertTriangle className="h-3.5 w-3.5 mr-2" />
          {bi("deactivate").primary} · {bi("deactivate").secondary}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{bi("deactivate").primary}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            value={principalStr}
            onChange={(e) => setPrincipalStr(e.target.value)}
            placeholder="Employee Principal ID"
            className="font-mono text-sm"
          />
          <Button
            type="button"
            onClick={handleDeactivate}
            disabled={isPending || !principalStr}
            className="w-full bg-destructive text-white tap-target"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
            {bi("confirm").primary} {bi("deactivate").primary}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Digital ID Section ----------

function DigitalIdSection({ profile }: { profile: UserProfile }) {
  const { bi } = useLang();
  const { data: idCard, isLoading, isError, refetch } = useGetMyDigitalId();
  const { mutate: submitRequest, isPending: isSubmitting } = useSubmitDigitalIdRequest();

  const handleRequest = () => {
    submitRequest(undefined, {
      onSuccess: () => toast.success(bi("idRequested").primary),
      onError: (e) => toast.error(e.message),
    });
  };

  return (
    <Card className="overflow-hidden animate-fade-in">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <IdCard className="h-4 w-4 text-primary" />
          <span>{bi("digitalId").primary}</span>
          <span className="text-xs text-muted-foreground font-hindi ml-1">{bi("digitalId").secondary}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {isLoading && <Skeleton className="h-20 w-full rounded-xl" />}
        {isError && <ErrorState onRetry={() => refetch()} />}

        {!isLoading && !isError && (idCard === null || idCard === undefined) && (
          /* No request yet */
          <div className="flex flex-col items-center py-4 gap-3 text-center">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
              <IdCard className="h-7 w-7 text-muted-foreground opacity-50" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{bi("requestDigitalId").primary}</p>
              <p className="text-xs text-muted-foreground font-hindi mt-0.5">{bi("requestDigitalId").secondary}</p>
            </div>
            <Button
              onClick={handleRequest}
              disabled={isSubmitting}
              className="w-full h-11 wine-gradient text-white tap-target"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <IdCard className="mr-2 h-4 w-4" />
              )}
              {bi("requestDigitalId").primary}
              <span className="ml-1.5 text-xs opacity-80 font-hindi">{bi("requestDigitalId").secondary}</span>
            </Button>
          </div>
        )}

        {!isLoading && !isError && idCard != null && !idCard.isActive && !idCard.approvedAt && (
          /* Pending — approvedAt is 0/falsy for pending */
          <div className="flex flex-col items-center py-4 gap-3 text-center">
            <div className="w-14 h-14 rounded-full bg-yellow-100 flex items-center justify-center">
              <IdCard className="h-7 w-7 text-yellow-600" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                ⏳ {bi("digitalIdPending").primary}
                <span className="font-hindi ml-1 opacity-70">{bi("digitalIdPending").secondary}</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-hindi">
              {bi("pendingMessage").secondary}
            </p>
          </div>
        )}

        {!isLoading && !isError && idCard != null && idCard.isActive && (
          /* Approved & Active — show the card */
          <DigitalIdCard profile={profile} idCard={idCard} />
        )}

        {!isLoading && !isError && idCard != null && !idCard.isActive && idCard.approvedAt > BigInt(0) && (
          /* Was rejected (approvedAt set but inactive) */
          <div className="flex flex-col items-center py-4 gap-2 text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
              <IdCard className="h-7 w-7 text-red-500" />
            </div>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
              ✕ {bi("digitalIdInactive").primary}
            </span>
            {idCard.rejectedReason && (
              <p className="text-xs text-muted-foreground mt-1">{idCard.rejectedReason}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------- Main ----------

export default function ProfilePage({ profile }: ProfilePageProps) {
  const { lang, bi } = useLang();
  const { data: pointsData, isLoading: pointsLoading } = useOwnPointsAndRank();

  const displayName = lang === "en" ? profile.name : profile.nameHindi;
  const initials = profile.name
    .split(" ")
    .map((w) => w[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");

  const roleLabel = bi(profile.role as "employee" | "supervisor" | "management");
  const isManagement = profile.role === Role.management;

  return (
    <main className="pb-nav px-4 pt-4 space-y-4">
      {/* Identity Card */}
      <div className="rounded-2xl wine-gradient wine-texture p-5 shadow-wine animate-slide-up">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-2xl font-display font-bold text-white shrink-0 shadow-lg">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-display font-bold text-white leading-tight truncate">
              {displayName}
            </h2>
            <p className="text-white/70 text-xs font-hindi mt-0.5">
              {lang === "en" ? profile.nameHindi : profile.name}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-xs font-medium">
                {roleLabel.primary}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-gold-mid/30 text-gold-light text-xs font-hindi">
                {roleLabel.secondary}
              </span>
            </div>
          </div>
        </div>

        {/* Info grid */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          {[
            { icon: BadgeCheck, label: "ID", value: profile.employeeId },
            { icon: Phone, label: bi("phone").primary, value: profile.phone },
            { icon: Building2, label: bi("department").primary, value: profile.department },
            { icon: MapPin, label: bi("branch").primary, value: profile.branch },
          ].map((item) => (
            <div key={item.label} className="bg-white/10 rounded-xl p-2.5 flex items-start gap-2">
              <item.icon className="h-3.5 w-3.5 text-gold-light shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-[10px] text-white/50">{item.label}</p>
                <p className="text-xs text-white font-medium truncate">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Status */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className={cn(
              "w-2 h-2 rounded-full animate-pulse-dot",
              profile.isActive ? "bg-green-400" : "bg-red-400",
            )} />
            <span className="text-xs text-white/70">
              {profile.isActive ? bi("activeCard").primary : bi("inactiveCard").primary}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 text-gold-light" />
            {pointsLoading ? (
              <Skeleton className="h-4 w-12 bg-white/20" />
            ) : (
              <span className="text-xs text-white font-bold">
                {Number(pointsData?.points ?? 0)} {bi("pts").primary}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Leave Balance */}
      <LeaveBalanceCard />

      {/* Digital ID Card (all users) */}
      <DigitalIdSection profile={profile} />

      {/* Management Tools */}
      {isManagement && (
        <Card className="overflow-hidden animate-fade-in">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span>{bi("manageStaff").primary}</span>
              <span className="text-xs text-muted-foreground font-hindi ml-1">{bi("manageStaff").secondary}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2">
            <UpdateLeaveDialog />
            <DeactivateDialog />
          </CardContent>
        </Card>
      )}

      {/* Management Panels: Registration & Digital ID requests */}
      {isManagement && (
        <div className="animate-fade-in">
          <ManagementPanel />
        </div>
      )}

      {/* Announcements Panel (management only) */}
      {isManagement && (
        <div className="animate-fade-in">
          <AnnouncementsPanel />
        </div>
      )}

      {/* Branch Management (management only) */}
      {isManagement && (
        <div className="animate-fade-in">
          <BranchManagementCard />
        </div>
      )}

      {/* Footer */}
      <footer className="text-center pt-2 pb-4">
        <p className="text-xs text-muted-foreground">
          © 2026. Built with <span className="text-red-400">♥</span> using{" "}
          <a href="https://caffeine.ai" target="_blank" rel="noopener noreferrer" className="underline">
            caffeine.ai
          </a>
        </p>
      </footer>
    </main>
  );
}
