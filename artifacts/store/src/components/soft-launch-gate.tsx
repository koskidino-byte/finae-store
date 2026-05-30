import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/lib/i18n";

const STORAGE_KEY = "finae_access";
const ACCESS_CODE = import.meta.env.VITE_ACCESS_CODE || "FINAE2025";

export function SoftLaunchGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(true);
  const { lang } = useLang();

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored === ACCESS_CODE) setUnlocked(true);
    setChecking(false);
  }, []);

  if (checking) return null;
  if (unlocked) return <>{children}</>;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code.trim().toUpperCase() === ACCESS_CODE) {
      sessionStorage.setItem(STORAGE_KEY, ACCESS_CODE);
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
      setCode("");
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center px-6"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-24 h-px bg-primary/30" />
          <div className="absolute top-0 left-0 h-24 w-px bg-primary/30" />
          <div className="absolute bottom-0 right-0 w-24 h-px bg-primary/30" />
          <div className="absolute bottom-0 right-0 h-24 w-px bg-primary/30" />
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="w-full max-w-sm text-center"
        >
          <p className="text-[10px] tracking-[0.4em] uppercase text-primary font-sans mb-6">
            {lang === "en" ? "Early Access" : "Rani Pristup"}
          </p>
          <h1 className="font-serif text-4xl font-light tracking-[0.15em] uppercase mb-2">
            FINAE
          </h1>
          <p className="text-muted-foreground text-sm font-light tracking-wide mb-10">
            {lang === "en"
              ? "This collection is currently available by invitation only."
              : "Ova kolekcija trenutno je dostupna samo po pozivu."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                value={code}
                onChange={(e) => { setCode(e.target.value); setError(false); }}
                placeholder={lang === "en" ? "Enter access code" : "Unesite pristupni kod"}
                className="w-full bg-card border border-border/60 text-foreground placeholder:text-muted-foreground/40 px-5 py-4 text-sm text-center tracking-[0.2em] uppercase focus:outline-none focus:border-primary/60 transition-colors font-sans font-light"
                autoFocus
                autoComplete="off"
              />
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[11px] text-destructive mt-2 tracking-wide font-sans"
                >
                  {lang === "en" ? "Invalid code. Please try again." : "Neispravan kod. Pokušajte ponovo."}
                </motion.p>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground text-[11px] tracking-[0.25em] uppercase py-4 hover:bg-primary/90 transition-colors font-sans"
            >
              {lang === "en" ? "Enter" : "Ulaz"}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
