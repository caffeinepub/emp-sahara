import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Globe } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useLang } from "../contexts/LanguageContext";
import type { Language } from "../lib/i18n";

export default function LoginPage() {
  const { login, isLoggingIn } = useInternetIdentity();
  const { lang, setLang, tx } = useLang();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 wine-gradient"
        aria-hidden="true"
      />
      {/* Decorative circles */}
      <div
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, #e8c96e 0%, transparent 70%)" }}
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-40 -left-32 w-80 h-80 rounded-full opacity-15"
        style={{ background: "radial-gradient(circle, #c9a84c 0%, transparent 70%)" }}
        aria-hidden="true"
      />

      {/* Lang toggle */}
      <div className="absolute top-6 right-6 z-10 flex items-center gap-1 bg-white/10 rounded-full px-1 py-1 backdrop-blur-sm">
        <Globe className="h-4 w-4 text-white/80 ml-1" />
        {(["en", "hi"] as Language[]).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLang(l)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
              lang === l
                ? "bg-white text-wine-mid shadow-sm"
                : "text-white/80 hover:text-white"
            }`}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Card */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center max-w-sm w-full animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-xl overflow-hidden">
            <img
              src="/assets/generated/winery-logo-transparent.dim_200x200.png"
              alt="WineryConnect Logo"
              className="w-20 h-20 object-contain"
            />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-white leading-tight">
              WineryConnect
            </h1>
            <p className="text-lg font-hindi text-white/80 mt-0.5">वाइनरी कनेक्ट</p>
          </div>
        </div>

        {/* Divider line */}
        <div className="w-16 h-px bg-gold-mid opacity-70" />

        {/* Text */}
        <div className="space-y-1">
          <h2 className="text-xl font-display text-white">
            {tx("loginTitle")}
          </h2>
          <p className="text-sm text-white/70 font-hindi">
            {tx("loginSubtitle")}
          </p>
        </div>

        {/* Login button */}
        <Button
          size="lg"
          onClick={login}
          disabled={isLoggingIn}
          className="w-full h-14 text-base font-semibold rounded-2xl bg-white text-wine-mid hover:bg-gold-light hover:text-wine-dark transition-all shadow-lg tap-target"
        >
          {isLoggingIn ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" />{tx("loggingIn")}</>
          ) : (
            <>{tx("login")}</>
          )}
        </Button>

        <p className="text-xs text-white/50 font-hindi">
          Secured by Internet Identity · Internet Identity द्वारा सुरक्षित
        </p>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-6 left-0 right-0 text-center z-10">
        <p className="text-xs text-white/40">
          © 2026. Built with{" "}
          <span className="text-red-300">♥</span>{" "}
          using{" "}
          <a
            href="https://caffeine.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-white/60"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
