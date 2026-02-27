import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, UserCheck, Clock, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { useLang } from "../contexts/LanguageContext";
import {
  useSubmitRegistrationRequest,
  useGetMyRegistrationStatus,
  useGetBranches,
  Role,
  Variant_pending_approved_rejected,
} from "../hooks/useQueries";
import { toast } from "sonner";
import type { Language } from "../lib/i18n";
import { useQueryClient } from "@tanstack/react-query";

const DEPARTMENTS = [
  "Production",
  "Cellar",
  "Tasting Room",
  "Sales",
  "Maintenance",
  "Quality Control",
  "Administration",
];

// Pending / Approval status screen
function RegistrationStatusScreen() {
  const { lang, setLang, tx, bi } = useLang();
  const { data: status, isLoading, refetch, isFetching } = useGetMyRegistrationStatus();
  const qc = useQueryClient();

  const isPending  = status?.status === Variant_pending_approved_rejected.pending;
  const isApproved = status?.status === Variant_pending_approved_rejected.approved;
  const isRejected = status?.status === Variant_pending_approved_rejected.rejected;

  const handleRefresh = async () => {
    await refetch();
    if (isApproved) {
      // Invalidate profile so app re-fetches and shows main app
      void qc.invalidateQueries({ queryKey: ["currentUserProfile"] });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-6">
      {/* Background */}
      <div className="absolute inset-0 wine-gradient" aria-hidden="true" />
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, #e8c96e 0%, transparent 70%)" }} aria-hidden="true" />

      {/* Lang toggle */}
      <div className="absolute top-6 right-6 z-10 flex items-center gap-1 bg-white/10 rounded-full px-1 py-1 backdrop-blur-sm">
        {(["en", "hi"] as Language[]).map((l) => (
          <button key={l} type="button" onClick={() => setLang(l)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
              lang === l ? "bg-white text-wine-mid shadow-sm" : "text-white/80 hover:text-white"
            }`}>
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {isLoading ? (
          <div className="flex flex-col items-center gap-4 text-white">
            <Loader2 className="h-10 w-10 animate-spin opacity-70" />
            <p className="text-sm opacity-70 font-hindi">{tx("loading")}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 text-center animate-fade-in">
            {/* Icon */}
            {isPending && (
              <div className="w-20 h-20 rounded-full bg-yellow-400/20 border-2 border-yellow-300/50 flex items-center justify-center">
                <Clock className="h-10 w-10 text-yellow-300" />
              </div>
            )}
            {isApproved && (
              <div className="w-20 h-20 rounded-full bg-green-400/20 border-2 border-green-300/50 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-300" />
              </div>
            )}
            {isRejected && (
              <div className="w-20 h-20 rounded-full bg-red-400/20 border-2 border-red-300/50 flex items-center justify-center">
                <XCircle className="h-10 w-10 text-red-300" />
              </div>
            )}

            {/* Title */}
            <div>
              <h2 className="text-2xl font-display font-bold text-white">
                {isPending && bi("pendingApproval").primary}
                {isApproved && bi("approvedMessage").primary}
                {isRejected && bi("rejectedMessage").primary}
              </h2>
              <p className="text-white/70 font-hindi text-sm mt-1">
                {isPending && bi("pendingApproval").secondary}
                {isApproved && bi("approvedMessage").secondary}
                {isRejected && bi("rejectedMessage").secondary}
              </p>
            </div>

            {/* Message */}
            {isPending && (
              <div className="bg-white/10 rounded-2xl p-5 text-sm space-y-3">
                <p className="text-white leading-relaxed">{bi("pendingMessage").primary}</p>
                <p className="text-white/70 font-hindi leading-relaxed text-xs">{bi("pendingMessage").secondary}</p>
              </div>
            )}

            {/* Rejection reason */}
            {isRejected && status?.rejectedReason && (
              <div className="bg-red-500/20 rounded-2xl p-5 w-full text-sm">
                <p className="text-white/70 text-xs mb-1">{bi("rejectionReason").primary}</p>
                <p className="text-white font-medium">{status.rejectedReason}</p>
              </div>
            )}

            {/* Request details */}
            {status && (
              <div className="bg-white/10 rounded-2xl p-4 w-full text-left space-y-2">
                <p className="text-xs text-white/50 uppercase tracking-wider">
                  {lang === "en" ? "Your Details" : "आपका विवरण"}
                </p>
                <div className="space-y-1.5">
                  {[
                    { label: lang === "en" ? "Name" : "नाम", value: lang === "en" ? status.name : status.nameHindi },
                    { label: lang === "en" ? "Employee ID" : "कर्मचारी आईडी", value: status.employeeId },
                    { label: lang === "en" ? "Branch" : "शाखा", value: status.branch },
                    { label: lang === "en" ? "Department" : "विभाग", value: status.department },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-xs text-white/50">{item.label}</span>
                      <span className="text-xs text-white font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Refresh / continue */}
            <Button
              onClick={handleRefresh}
              disabled={isFetching}
              className="w-full h-12 bg-white text-wine-mid hover:bg-gold-light font-semibold rounded-xl tap-target"
            >
              {isFetching ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              {lang === "en" ? "Check Status" : "स्थिति जांचें"}
            </Button>
          </div>
        )}
      </div>

      <footer className="absolute bottom-6 left-0 right-0 text-center z-10">
        <p className="text-xs text-white/40">
          © 2026. Built with <span className="text-red-300">♥</span> using{" "}
          <a href="https://caffeine.ai" target="_blank" rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-white/60">caffeine.ai</a>
        </p>
      </footer>
    </div>
  );
}

// Registration form
export default function RegistrationRequestPage() {
  const { lang, setLang, tx, bi } = useLang();
  const { data: regStatus, isLoading: statusLoading } = useGetMyRegistrationStatus();
  const { data: branches, isLoading: branchesLoading } = useGetBranches();
  const { mutate: submitRequest, isPending } = useSubmitRegistrationRequest();

  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    name: "",
    nameHindi: "",
    role: "" as Role | "",
    department: "",
    branch: "",
    employeeId: "",
    phone: "",
  });

  const isValid = form.name && form.nameHindi && form.role && form.department && form.branch && form.employeeId && form.phone;

  // If user already has a registration request, show status screen
  const hasExistingRequest = !statusLoading && regStatus !== null;

  useEffect(() => {
    if (regStatus !== null && !statusLoading) {
      setSubmitted(true);
    }
  }, [regStatus, statusLoading]);

  if (statusLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center wine-gradient">
        <Loader2 className="h-10 w-10 animate-spin text-white" />
      </div>
    );
  }

  if (hasExistingRequest || submitted) {
    return <RegistrationStatusScreen />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.role) return;

    submitRequest(
      {
        name: form.name,
        nameHindi: form.nameHindi,
        role: form.role as Role,
        department: form.department,
        branch: form.branch,
        phone: form.phone,
        employeeId: form.employeeId,
      },
      {
        onSuccess: () => {
          toast.success(bi("requestSubmitted").primary);
          setSubmitted(true);
        },
        onError: (e) => toast.error(e.message),
      },
    );
  };

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value })),
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-background">
      {/* Subtle background */}
      <div className="absolute inset-0 opacity-5 wine-gradient" aria-hidden="true" />

      {/* Lang toggle */}
      <div className="absolute top-6 right-6 z-10 flex items-center gap-1 bg-muted rounded-full px-1 py-1">
        {(["en", "hi"] as Language[]).map((l) => (
          <button key={l} type="button" onClick={() => setLang(l)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
              lang === l ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}>
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md px-4 py-8">
        {/* Header */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="w-16 h-16 rounded-full wine-gradient flex items-center justify-center shadow-wine">
            <UserCheck className="h-8 w-8 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-display font-bold text-foreground">
              {bi("registrationTitle").primary}
            </h1>
            <p className="text-sm text-muted-foreground font-hindi mt-0.5">
              {bi("registrationTitle").secondary}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {bi("registrationSub").primary}
            </p>
            <p className="text-xs text-muted-foreground font-hindi">
              {bi("registrationSub").secondary}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              {bi("name").primary}
              <span className="text-xs text-muted-foreground font-hindi ml-1.5">{bi("name").secondary}</span>
            </Label>
            <Input id="name" placeholder="e.g. Ramesh Kumar" {...field("name")} className="h-12 tap-target" />
          </div>

          {/* Name Hindi */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              {bi("nameHindi").primary}
              <span className="text-xs text-muted-foreground font-hindi ml-1.5">{bi("nameHindi").secondary}</span>
            </Label>
            <Input id="nameHindi" placeholder="जैसे: रमेश कुमार" className="h-12 font-hindi tap-target" {...field("nameHindi")} />
          </div>

          {/* Role — employee or supervisor only */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              {bi("role").primary}
              <span className="text-xs text-muted-foreground font-hindi ml-1.5">{bi("role").secondary}</span>
            </Label>
            <Select value={form.role} onValueChange={(v) => setForm((prev) => ({ ...prev, role: v as Role }))}>
              <SelectTrigger className="h-12 tap-target">
                <SelectValue placeholder={`${bi("role").primary} / ${bi("role").secondary}`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Role.employee}>{bi("employee").primary} · {bi("employee").secondary}</SelectItem>
                <SelectItem value={Role.supervisor}>{bi("supervisor").primary} · {bi("supervisor").secondary}</SelectItem>
                <SelectItem value={Role.management}>{bi("management").primary} · {bi("management").secondary}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Department */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              {bi("department").primary}
              <span className="text-xs text-muted-foreground font-hindi ml-1.5">{bi("department").secondary}</span>
            </Label>
            <Select value={form.department} onValueChange={(v) => setForm((prev) => ({ ...prev, department: v }))}>
              <SelectTrigger className="h-12 tap-target">
                <SelectValue placeholder={`${bi("department").primary} / ${bi("department").secondary}`} />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Branch */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              {bi("branch").primary}
              <span className="text-xs text-muted-foreground font-hindi ml-1.5">{bi("branch").secondary}</span>
            </Label>
            {branches && branches.length > 0 ? (
              <Select value={form.branch} onValueChange={(v) => setForm((prev) => ({ ...prev, branch: v }))}>
                <SelectTrigger className="h-12 tap-target" disabled={branchesLoading}>
                  <SelectValue placeholder={`${bi("branch").primary} / ${bi("branch").secondary}`} />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((b) => <SelectItem key={b.id.toString()} value={b.name}>{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
            ) : (
              <Input
                placeholder="Enter branch name / शाखा का नाम"
                value={form.branch}
                onChange={(e) => setForm((prev) => ({ ...prev, branch: e.target.value }))}
                className="h-12 tap-target"
              />
            )}
          </div>

          {/* Employee ID */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              {bi("employeeId").primary}
              <span className="text-xs text-muted-foreground font-hindi ml-1.5">{bi("employeeId").secondary}</span>
            </Label>
            <Input id="empId" placeholder="e.g. EMP-001" {...field("employeeId")} className="h-12 tap-target" />
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              {bi("phone").primary}
              <span className="text-xs text-muted-foreground font-hindi ml-1.5">{bi("phone").secondary}</span>
            </Label>
            <Input id="phone" type="tel" placeholder="e.g. 9876543210" {...field("phone")} className="h-12 tap-target" />
          </div>

          <Button
            type="submit"
            disabled={!isValid || isPending}
            className="w-full h-14 text-base font-semibold rounded-xl wine-gradient text-white shadow-wine tap-target mt-2"
          >
            {isPending ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" />{tx("submitting")}</>
            ) : (
              <>{bi("submit").primary} · {bi("submit").secondary}</>
            )}
          </Button>
        </form>
      </div>

      <footer className="relative z-10 text-center pb-6">
        <p className="text-xs text-muted-foreground">
          © 2026. Built with <span className="text-red-400">♥</span> using{" "}
          <a href="https://caffeine.ai" target="_blank" rel="noopener noreferrer" className="underline">caffeine.ai</a>
        </p>
      </footer>
    </div>
  );
}
