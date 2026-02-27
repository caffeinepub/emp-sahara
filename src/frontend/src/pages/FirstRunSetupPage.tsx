import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldCheck, AlertTriangle } from "lucide-react";
import { useLang } from "../contexts/LanguageContext";
import { useClaimFirstRunAdmin } from "../hooks/useQueries";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { toast } from "sonner";
import type { Language } from "../lib/i18n";

export default function FirstRunSetupPage() {
  const { lang, setLang } = useLang();
  const { identity } = useInternetIdentity();
  const { mutate: claimAdmin, isPending } = useClaimFirstRunAdmin();

  const [form, setForm] = useState({
    name: "",
    nameHindi: "",
    employeeId: "",
    phone: "",
    branch: "",
  });

  const isValid =
    form.name.trim() &&
    form.nameHindi.trim() &&
    form.employeeId.trim() &&
    form.phone.trim() &&
    form.branch.trim();

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value })),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    claimAdmin(
      {
        name: form.name.trim(),
        nameHindi: form.nameHindi.trim(),
        employeeId: form.employeeId.trim(),
        phone: form.phone.trim(),
        branch: form.branch.trim(),
      },
      {
        onSuccess: () => {
          toast.success(
            lang === "en"
              ? "Admin account created! Welcome to EMP Sahara."
              : "एडमिन खाता बना दिया गया! ईएमपी सहारा में आपका स्वागत है।",
          );
          // Profile query invalidation in the hook handles re-routing automatically
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : (lang === "en" ? "Setup failed" : "सेटअप विफल रहा"));
        },
      },
    );
  };

  const principal = identity?.getPrincipal().toString();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-background">
      {/* Subtle background wash */}
      <div className="absolute inset-0 opacity-5 wine-gradient" aria-hidden="true" />
      <div
        className="absolute -top-40 -left-40 w-80 h-80 rounded-full opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, oklch(0.55 0.18 28) 0%, transparent 70%)" }}
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, oklch(0.7 0.16 80) 0%, transparent 70%)" }}
        aria-hidden="true"
      />

      {/* Language toggle */}
      <div className="absolute top-6 right-6 z-10 flex items-center gap-1 bg-muted rounded-full px-1 py-1">
        {(["en", "hi"] as Language[]).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLang(l)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
              lang === l
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md px-4 py-10">
        {/* Header */}
        <div className="flex flex-col items-center mb-6 gap-3">
          <div className="w-16 h-16 rounded-full wine-gradient flex items-center justify-center shadow-wine">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-display font-bold text-foreground">
              {lang === "en" ? "First-Time Admin Setup" : "पहली बार एडमिन सेटअप"}
            </h1>
            <p className="text-sm text-muted-foreground font-hindi mt-0.5">
              {lang === "en"
                ? "पहली बार एडमिन सेटअप"
                : "First-Time Admin Setup"}
            </p>
          </div>
        </div>

        {/* Info banner */}
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800/40 dark:bg-amber-900/20 p-4 flex gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300 leading-snug">
              {lang === "en"
                ? "No users exist yet. You are setting up the first Admin/Management account for EMP Sahara."
                : "अभी कोई उपयोगकर्ता नहीं है। आप ईएमपी सहारा के लिए पहला एडमिन/प्रबंधन खाता बना रहे हैं।"}
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 font-hindi leading-snug">
              {lang === "en"
                ? "अभी कोई उपयोगकर्ता नहीं है। आप ईएमपी सहारा के लिए पहला एडमिन/प्रबंधन खाता बना रहे हैं।"
                : "No users exist yet. You are setting up the first Admin/Management account for EMP Sahara."}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name (English) */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              {lang === "en" ? "Full Name (English)" : "पूरा नाम (अंग्रेज़ी)"}
              <span className="text-xs text-muted-foreground font-hindi ml-1.5">
                {lang === "en" ? "· पूरा नाम" : "· Full Name"}
              </span>
            </Label>
            <Input
              id="name"
              placeholder="e.g. Rajesh Sharma"
              className="h-12 tap-target"
              autoComplete="name"
              {...field("name")}
            />
          </div>

          {/* Full Name (Hindi) */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              {lang === "en" ? "Full Name (Hindi)" : "पूरा नाम (हिंदी)"}
              <span className="text-xs text-muted-foreground ml-1.5">
                {lang === "en" ? "· Name in Hindi" : "· हिंदी में नाम"}
              </span>
            </Label>
            <Input
              id="nameHindi"
              placeholder="जैसे: राजेश शर्मा"
              className="h-12 font-hindi tap-target"
              {...field("nameHindi")}
            />
          </div>

          {/* Employee ID */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              {lang === "en" ? "Employee ID" : "कर्मचारी आईडी"}
              <span className="text-xs text-muted-foreground font-hindi ml-1.5">
                {lang === "en" ? "· कर्मचारी आईडी" : "· Employee ID"}
              </span>
            </Label>
            <Input
              id="employeeId"
              placeholder="e.g. EMP-001"
              className="h-12 tap-target"
              {...field("employeeId")}
            />
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              {lang === "en" ? "Phone Number" : "फोन नंबर"}
              <span className="text-xs text-muted-foreground font-hindi ml-1.5">
                {lang === "en" ? "· फोन नंबर" : "· Phone Number"}
              </span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="e.g. 9876543210"
              className="h-12 tap-target"
              {...field("phone")}
            />
          </div>

          {/* Branch/Office Name */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              {lang === "en" ? "Branch / Office Name" : "शाखा / कार्यालय का नाम"}
              <span className="text-xs text-muted-foreground font-hindi ml-1.5">
                {lang === "en" ? "· शाखा का नाम" : "· Branch Name"}
              </span>
            </Label>
            <Input
              id="branch"
              placeholder="e.g. Main Campus"
              className="h-12 tap-target"
              {...field("branch")}
            />
          </div>

          {/* Principal display */}
          {principal && (
            <div className="rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground break-all">
              <span className="font-medium">
                {lang === "en" ? "Your Identity: " : "आपकी पहचान: "}
              </span>
              {principal}
            </div>
          )}

          <Button
            type="submit"
            disabled={!isValid || isPending}
            className="w-full h-14 text-base font-semibold rounded-xl wine-gradient text-white shadow-wine tap-target mt-2"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {lang === "en" ? "Setting up…" : "सेट हो रहा है…"}
              </>
            ) : (
              <>
                <ShieldCheck className="mr-2 h-5 w-5" />
                {lang === "en"
                  ? "Create Admin Account · एडमिन खाता बनाएं"
                  : "एडमिन खाता बनाएं · Create Admin Account"}
              </>
            )}
          </Button>
        </form>
      </div>

      <footer className="relative z-10 text-center pb-6">
        <p className="text-xs text-muted-foreground">
          © 2026. Built with <span className="text-red-400">♥</span> using{" "}
          <a
            href="https://caffeine.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
