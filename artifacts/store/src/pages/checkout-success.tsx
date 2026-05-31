import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { useLang } from "@/lib/i18n";

export function CheckoutSuccess() {
  const [, setLocation] = useLocation();
  const { t, lang } = useLang();
  const [sessionData, setSessionData] = useState<{ customerEmail?: string } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (!sessionId) return;

    const base = import.meta.env.BASE_URL.replace(/\/$/, "");
    fetch(`${base}/api/stripe/session/${sessionId}`)
      .then((r) => r.json())
      .then((data) => setSessionData(data))
      .catch(() => {});
  }, []);

  return (
    <div className="container mx-auto px-6 md:px-10 py-28 text-center max-w-md">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
        <div className="w-16 h-16 border border-primary/40 flex items-center justify-center mx-auto mb-8">
          <CheckCircle className="h-8 w-8 text-primary" />
        </div>
        <p className="text-[10px] tracking-[0.3em] uppercase text-primary mb-4 font-sans">
          {t.checkout.confirmed}
        </p>
        <h1 className="font-serif text-4xl font-light mb-4">
          {lang === "en" ? "Payment successful" : "Plaćanje uspješno"}
        </h1>
        {sessionData?.customerEmail && (
          <p className="text-muted-foreground font-light mb-2">
            {lang === "en"
              ? `Confirmation sent to ${sessionData.customerEmail}`
              : `Potvrda poslana na ${sessionData.customerEmail}`}
          </p>
        )}
        <p className="text-muted-foreground text-sm font-light mb-10">
          {t.checkout.confirmedSub2}
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => setLocation("/orders")}
            className="bg-primary text-primary-foreground text-[11px] tracking-[0.2em] uppercase px-8 py-4 hover:bg-primary/90 transition-colors font-sans"
          >
            {lang === "en" ? "View my orders" : "Moje narudžbe"}
          </button>
          <button
            onClick={() => setLocation("/products")}
            className="border border-border/60 text-[11px] tracking-[0.2em] uppercase px-8 py-4 hover:border-primary/40 transition-colors text-muted-foreground hover:text-foreground font-sans"
          >
            {t.checkout.continueShopping}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
