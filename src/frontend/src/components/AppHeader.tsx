import React from "react";
import { Globe, LogOut } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useQueryClient } from "@tanstack/react-query";
import { useLang } from "../contexts/LanguageContext";
import type { Language } from "../lib/i18n";
import type { UserProfile } from "../backend.d";

interface AppHeaderProps {
  profile?: UserProfile | null;
}

export default function AppHeader({ profile }: AppHeaderProps) {
  const { clear } = useInternetIdentity();
  const qc = useQueryClient();
  const { lang, setLang, tx } = useLang();

  const handleLogout = async () => {
    await clear();
    qc.clear();
  };

  return (
    <header className="sticky top-0 z-40 wine-gradient shadow-wine wine-texture">
      <div className="flex items-center justify-between px-4 h-14">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img
            src="/assets/generated/winery-logo-transparent.dim_200x200.png"
            alt="Logo"
            className="h-8 w-8 object-contain shrink-0"
          />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-display font-semibold text-white leading-tight">
              WineryConnect
            </span>
            <span className="text-[10px] text-white/60 font-hindi leading-tight">
              वाइनरी कनेक्ट
            </span>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <div className="flex items-center bg-white/10 rounded-full p-0.5">
            {(["en", "hi"] as Language[]).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-all ${
                  lang === l ? "bg-white text-wine-mid shadow" : "text-white/80"
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            title={tx("logout")}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors tap-target"
          >
            <LogOut className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>

      {/* Profile strip */}
      {profile && (
        <div className="px-4 pb-2 flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-white shrink-0">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex items-baseline gap-1.5 min-w-0">
            <span className="text-sm text-white font-medium truncate">{profile.name}</span>
            <span className="text-xs text-white/60 font-hindi truncate">{profile.nameHindi}</span>
          </div>
        </div>
      )}
    </header>
  );
}
