import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  UserCheck, IdCard, Loader2, CheckCircle2, XCircle,
  User, Building2, Phone, BadgeCheck, MapPin, ShieldCheck,
  ShieldOff,
} from "lucide-react";
import { useLang } from "../contexts/LanguageContext";
import { ErrorState } from "./LoadingState";
import {
  useGetPendingRegistrationRequests,
  useApproveRegistrationRequest,
  useRejectRegistrationRequest,
  useGetPendingDigitalIdRequests,
  useApproveDigitalIdRequest,
  useGetAllDigitalIds,
  useGetUserProfile,
  Variant_pending_approved_rejected,
} from "../hooks/useQueries";
import type { RegistrationRequest } from "../hooks/useQueries";
import type { Principal } from "@icp-sdk/core/principal";
import { toast } from "sonner";

// ---- Registration Requests Tab ----

function RegistrationRequestItem({ request }: { request: RegistrationRequest }) {
  const { lang, bi, tx } = useLang();
  const { mutate: approve, isPending: isApproving } = useApproveRegistrationRequest();
  const { mutate: reject, isPending: isRejecting } = useRejectRegistrationRequest();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");

  const displayName = lang === "en" ? request.name : request.nameHindi;
  const roleLabel = lang === "en"
    ? (request.role === "employee" ? "Employee" : request.role === "supervisor" ? "Supervisor" : "Management")
    : (request.role === "employee" ? "कर्मचारी" : request.role === "supervisor" ? "पर्यवेक्षक" : "प्रबंधन");

  const handleApprove = () => {
    approve(request.requester, {
      onSuccess: () => toast.success(bi("approvedSuccess").primary),
      onError: (e) => toast.error(e.message),
    });
  };

  const handleReject = () => {
    if (!reason.trim()) { toast.error(bi("enterReason").primary); return; }
    reject(
      { requester: request.requester, reason: reason.trim() },
      {
        onSuccess: () => { toast.success(bi("rejectedSuccess").primary); setRejectOpen(false); setReason(""); },
        onError: (e) => toast.error(e.message),
      },
    );
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3 animate-fade-in">
      {/* Name & role */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-sm text-foreground">{displayName}</p>
          <p className="text-xs text-muted-foreground font-hindi">
            {lang === "en" ? request.nameHindi : request.name}
          </p>
        </div>
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary shrink-0">
          {roleLabel}
        </span>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-1.5">
        {[
          { icon: BadgeCheck, value: request.employeeId, id: "empId" },
          { icon: Phone, value: request.phone, id: "phone" },
          { icon: Building2, value: request.department, id: "dept" },
          { icon: MapPin, value: request.branch, id: "branch" },
        ].map((item) => (
          <div key={item.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <item.icon className="h-3 w-3 shrink-0" />
            <span className="truncate">{item.value}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <Button
          size="sm"
          className="flex-1 h-9 bg-green-600 hover:bg-green-700 text-white tap-target"
          onClick={handleApprove}
          disabled={isApproving || isRejecting}
        >
          {isApproving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5 mr-1" />}
          {bi("approve").primary}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 h-9 border-red-200 text-red-600 hover:bg-red-50 tap-target"
          onClick={() => setRejectOpen(true)}
          disabled={isApproving || isRejecting}
        >
          <XCircle className="h-3.5 w-3.5 mr-1" />
          {bi("reject").primary}
        </Button>
      </div>

      {/* Reject dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{bi("rejectWithReason").primary}</DialogTitle>
          </DialogHeader>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={bi("enterReason").primary}
            className="min-h-[80px] font-hindi text-sm"
          />
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRejectOpen(false)}>{tx("cancel")}</Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isRejecting || !reason.trim()}
            >
              {isRejecting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              {bi("reject").primary}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RegistrationRequestsTab() {
  const { bi } = useLang();
  const { data: requests, isLoading, isError, refetch } = useGetPendingRegistrationRequests();

  return (
    <div className="space-y-3">
      {isLoading && (
        <div className="space-y-3">
          {[1, 2].map((i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
        </div>
      )}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && (!requests || requests.length === 0) && (
        <div className="flex flex-col items-center py-8 gap-2 text-muted-foreground">
          <UserCheck className="h-10 w-10 opacity-30" />
          <p className="text-sm">{bi("noRequests").primary}</p>
          <p className="text-xs font-hindi opacity-70">{bi("noRequests").secondary}</p>
        </div>
      )}
      {!isLoading && !isError && requests?.map((req) => (
        <RegistrationRequestItem
          key={req.requester.toString()}
          request={req}
        />
      ))}
    </div>
  );
}

// ---- Digital ID Requests Tab ----

function DigitalIdRequestItem({ principal }: { principal: Principal }) {
  const { lang, bi, tx } = useLang();
  const { data: profile, isLoading } = useGetUserProfile(principal.toString());
  const { mutate: approveId, isPending: isApproving } = useApproveDigitalIdRequest();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");

  const displayName = profile ? (lang === "en" ? profile.name : profile.nameHindi) : principal.toString().slice(0, 16) + "...";

  const handleApprove = () => {
    approveId(
      { employeeId: principal, approved: true, reason: null },
      {
        onSuccess: () => toast.success(bi("approvedSuccess").primary),
        onError: (e) => toast.error(e.message),
      },
    );
  };

  const handleReject = () => {
    if (!reason.trim()) { toast.error(bi("enterReason").primary); return; }
    approveId(
      { employeeId: principal, approved: false, reason: reason.trim() },
      {
        onSuccess: () => { toast.success(bi("rejectedSuccess").primary); setRejectOpen(false); setReason(""); },
        onError: (e) => toast.error(e.message),
      },
    );
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3 animate-fade-in">
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      ) : (
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-foreground">{displayName}</p>
            {profile && (
              <>
                <p className="text-xs text-muted-foreground">{profile.employeeId} · {profile.department}</p>
                <p className="text-xs text-muted-foreground">{profile.branch}</p>
              </>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          size="sm"
          className="flex-1 h-9 bg-green-600 hover:bg-green-700 text-white tap-target"
          onClick={handleApprove}
          disabled={isApproving}
        >
          {isApproving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5 mr-1" />}
          {bi("approve").primary}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 h-9 border-red-200 text-red-600 hover:bg-red-50 tap-target"
          onClick={() => setRejectOpen(true)}
          disabled={isApproving}
        >
          <ShieldOff className="h-3.5 w-3.5 mr-1" />
          {bi("reject").primary}
        </Button>
      </div>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{bi("rejectWithReason").primary}</DialogTitle>
          </DialogHeader>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={bi("enterReason").primary}
            className="min-h-[80px] text-sm"
          />
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRejectOpen(false)}>{tx("cancel")}</Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isApproving || !reason.trim()}
            >
              {isApproving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              {bi("reject").primary}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AllIssuedIdsTab() {
  const { lang, bi } = useLang();
  const { data: allIds, isLoading, isError, refetch } = useGetAllDigitalIds();

  return (
    <div className="space-y-3">
      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      )}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && (!allIds || allIds.length === 0) && (
        <div className="flex flex-col items-center py-8 gap-2 text-muted-foreground">
          <IdCard className="h-10 w-10 opacity-30" />
          <p className="text-sm">{bi("noRequests").primary}</p>
        </div>
      )}
      {!isLoading && !isError && allIds?.map((idCard) => {
        const principalStr = idCard.employeeId.toString();
        const validUntilMs = Number(idCard.validUntil) / 1_000_000;
        const validUntilDate = new Date(validUntilMs).toLocaleDateString("en-IN", {
          day: "2-digit", month: "short", year: "numeric",
        });

        return (
          <div key={principalStr} className="rounded-xl border border-border bg-card p-3 flex items-center gap-3 animate-fade-in">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              idCard.isActive ? "bg-green-100" : "bg-red-100"
            }`}>
              {idCard.isActive
                ? <ShieldCheck className="h-5 w-5 text-green-600" />
                : <ShieldOff className="h-5 w-5 text-red-500" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-mono text-muted-foreground truncate">{principalStr.slice(0, 20)}…</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {bi("validUntil").primary}: {validUntilDate}
              </p>
            </div>
            <Badge className={idCard.isActive
              ? "bg-green-100 text-green-700 border border-green-200 text-xs"
              : "bg-red-100 text-red-700 border border-red-200 text-xs"
            }>
              {idCard.isActive
                ? (lang === "en" ? "Active" : "सक्रिय")
                : (lang === "en" ? "Inactive" : "निष्क्रिय")
              }
            </Badge>
          </div>
        );
      })}
    </div>
  );
}

function DigitalIdRequestsTab() {
  const { bi } = useLang();
  const { data: pendingPrincipals, isLoading, isError, refetch } = useGetPendingDigitalIdRequests();

  return (
    <div className="space-y-4">
      {/* Pending requests */}
      <div>
        <p className="text-xs text-muted-foreground font-medium mb-2 uppercase tracking-wider">
          {bi("digitalIdPending").primary}
        </p>
        {isLoading && (
          <div className="space-y-3">
            {[1, 2].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
        )}
        {isError && <ErrorState onRetry={() => refetch()} />}
        {!isLoading && !isError && (!pendingPrincipals || pendingPrincipals.length === 0) && (
          <div className="flex flex-col items-center py-6 gap-2 text-muted-foreground">
            <IdCard className="h-8 w-8 opacity-30" />
            <p className="text-sm">{bi("noRequests").primary}</p>
          </div>
        )}
        {!isLoading && !isError && pendingPrincipals?.map((p) => (
          <DigitalIdRequestItem key={p.toString()} principal={p} />
        ))}
      </div>

      {/* All issued IDs */}
      <div>
        <p className="text-xs text-muted-foreground font-medium mb-2 uppercase tracking-wider">
          {bi("issuedIds").primary}
        </p>
        <AllIssuedIdsTab />
      </div>
    </div>
  );
}

// ---- Main Management Panel ----

export default function ManagementPanel() {
  const { bi } = useLang();

  return (
    <Card className="overflow-hidden animate-fade-in">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <UserCheck className="h-4 w-4 text-primary" />
          <span>{bi("employeeRequests").primary}</span>
          <span className="text-xs text-muted-foreground font-hindi ml-1">{bi("employeeRequests").secondary}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <Tabs defaultValue="registrations">
          <TabsList className="w-full mb-4 h-10">
            <TabsTrigger value="registrations" className="flex-1 text-xs">
              <UserCheck className="h-3.5 w-3.5 mr-1" />
              {bi("employeeRequests").primary}
            </TabsTrigger>
            <TabsTrigger value="digitalIds" className="flex-1 text-xs">
              <IdCard className="h-3.5 w-3.5 mr-1" />
              {bi("digitalIdRequests").primary}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="registrations">
            <RegistrationRequestsTab />
          </TabsContent>
          <TabsContent value="digitalIds">
            <DigitalIdRequestsTab />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
