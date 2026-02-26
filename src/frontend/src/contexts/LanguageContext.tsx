import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { type Language, getStoredLang, storeLang, t, type TKey } from "../lib/i18n";

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  tx: (key: TKey) => string;
  /** Returns { primary, secondary } label pair */
  bi: (key: TKey) => { primary: string; secondary: string };
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(getStoredLang);

  const setLang = useCallback((l: Language) => {
    storeLang(l);
    setLangState(l);
  }, []);

  const tx = useCallback(
    (key: TKey): string => t[key][lang],
    [lang],
  );

  const bi = useCallback(
    (key: TKey): { primary: string; secondary: string } => ({
      primary: t[key][lang],
      secondary: t[key][lang === "en" ? "hi" : "en"],
    }),
    [lang],
  );

  const value = useMemo(
    () => ({ lang, setLang, tx, bi }),
    [lang, setLang, tx, bi],
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used inside LanguageProvider");
  return ctx;
}
