import React from "react";
import { Shield, CheckCircle } from "lucide-react";
import { useLang } from "../contexts/LanguageContext";
import type { UserProfile, DigitalIdCard as DigitalIdCardType } from "../backend.d";

interface DigitalIdCardProps {
  profile: UserProfile;
  idCard: DigitalIdCardType;
}

function formatDate(ns: bigint): string {
  const ms = Number(ns) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function DigitalIdCard({ profile, idCard }: DigitalIdCardProps) {
  const { lang, bi } = useLang();

  const displayName = lang === "en" ? profile.name : profile.nameHindi;
  const initials = profile.name
    .split(" ")
    .map((w) => w[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");

  const roleMap: Record<string, string> = {
    employee:   lang === "en" ? "Employee"   : "कर्मचारी",
    supervisor: lang === "en" ? "Supervisor" : "पर्यवेक्षक",
    management: lang === "en" ? "Management" : "प्रबंधन",
  };
  const designation = roleMap[profile.role] ?? profile.role;

  return (
    <div
      className="w-full max-w-sm mx-auto rounded-2xl overflow-hidden shadow-2xl"
      style={{
        background: "linear-gradient(160deg, #0f2547 0%, #1a3a6e 40%, #243f6e 70%, #1a2d52 100%)",
        fontFamily: "'Source Serif 4', serif",
      }}
    >
      {/* Header band */}
      <div className="relative px-5 pt-5 pb-3"
        style={{ background: "linear-gradient(90deg, #0a1d3f 0%, #14305e 100%)" }}>
        {/* Gold shimmer line */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5"
          style={{ background: "linear-gradient(90deg, transparent, #c9a84c, #e8c96e, #c9a84c, transparent)" }} />

        <div className="flex items-center justify-between">
          {/* Company name */}
          <div>
            <p className="text-xs font-bold tracking-widest uppercase"
              style={{ color: "#e8c96e", letterSpacing: "0.12em" }}>
              GFF&amp;B Pvt LTD
            </p>
            <p className="text-[10px] mt-0.5" style={{ color: "rgba(232,201,110,0.7)" }}>
              Golden Fun Foods &amp; Beverages
            </p>
          </div>
          {/* ID badge icon */}
          <div className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "rgba(232,201,110,0.15)", border: "1px solid rgba(232,201,110,0.3)" }}>
            <Shield className="h-5 w-5" style={{ color: "#e8c96e" }} />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="shrink-0">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold"
              style={{
                background: "linear-gradient(135deg, #c9a84c, #e8c96e)",
                color: "#0f2547",
                fontFamily: "'Playfair Display', serif",
                boxShadow: "0 4px 15px rgba(201,168,76,0.3)",
              }}>
              {initials}
            </div>
            {/* Active dot */}
            <div className="flex items-center gap-1 mt-1.5 justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] text-green-400 font-medium">
                {bi("digitalIdActive").primary}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-1.5">
            <div>
              <p className="text-base font-bold leading-tight text-white truncate"
                style={{ fontFamily: "'Playfair Display', serif" }}>
                {displayName}
              </p>
              <p className="text-[11px] mt-0.5 truncate" style={{ color: "rgba(255,255,255,0.55)" }}>
                {lang === "en" ? profile.nameHindi : profile.name}
              </p>
            </div>
            <div className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold"
              style={{ background: "rgba(232,201,110,0.15)", color: "#e8c96e", border: "1px solid rgba(232,201,110,0.25)" }}>
              {designation}
            </div>
          </div>
        </div>

        {/* Detail grid */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          {[
            { label: lang === "en" ? "Employee ID" : "कर्मचारी आईडी", value: profile.employeeId },
            { label: lang === "en" ? "Department" : "विभाग", value: profile.department },
            { label: lang === "en" ? "Branch" : "शाखा", value: profile.branch },
            { label: bi("validUntil").primary, value: formatDate(idCard.validUntil) },
          ].map((item) => (
            <div key={item.label} className="rounded-lg px-3 py-2"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: "rgba(232,201,110,0.6)" }}>
                {item.label}
              </p>
              <p className="text-xs font-semibold text-white mt-0.5 truncate">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 pb-4">
        {/* Gold divider */}
        <div className="h-px mb-3"
          style={{ background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent)" }} />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5 text-green-400" />
            <span className="text-xs font-medium text-green-400">
              {bi("digitalIdActive").primary}
            </span>
            <span className="text-[10px] font-hindi" style={{ color: "rgba(255,255,255,0.4)" }}>
              · {bi("digitalIdActive").secondary}
            </span>
          </div>
          <div className="text-[10px]" style={{ color: "rgba(232,201,110,0.5)" }}>
            {lang === "en" ? "Official ID" : "आधिकारिक आईडी"}
          </div>
        </div>

        {/* View-only notice */}
        <div className="mt-3 flex items-center justify-center gap-1.5 py-2 rounded-lg"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
            🔒 {bi("viewOnly").primary}
          </span>
        </div>
      </div>
    </div>
  );
}
