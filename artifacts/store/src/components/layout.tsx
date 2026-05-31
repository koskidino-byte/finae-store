import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useGetCart } from "@workspace/api-client-react";
import { ShoppingBag, Package } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useSettings } from "@/lib/settings-context";

export function Layout({ children }: { children: ReactNode }) {
  const { data: cart } = useGetCart();
  const [location] = useLocation();
  const { lang, setLang, t } = useLang();
  const { settings } = useSettings();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleNewsletter(e: React.FormEvent) {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterStatus("loading");
    try {
      const base = import.meta.env.BASE_URL.replace(/\/$/, "");
      const res = await fetch(`${base}/api/klaviyo/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newsletterEmail, source: "footer-newsletter" }),
      });
      if (!res.ok) throw new Error("failed");
      setNewsletterStatus("done");
      setNewsletterEmail("");
    } catch {
      setNewsletterStatus("error");
    }
  }

  const cartItemCount = cart?.itemCount || 0;
  const freeShipping = settings.free_shipping_min;
  const symbol = settings.currency_symbol;
  const storeName = settings.store_name;
  const announcement = settings.announcement;

  return (
    <div className="min-h-[100dvh] flex flex-col">
      {/* Announcement bar — dynamic */}
      <div className="w-full bg-primary text-primary-foreground text-center text-[11px] tracking-[0.2em] uppercase py-2 font-sans font-light">
        {announcement
          ? announcement
          : lang === "en"
            ? `Free shipping on orders over ${symbol}${freeShipping}`
            : `Besplatna dostava za narudžbe iznad ${freeShipping}${symbol}`}
      </div>

      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur-md">
        <div className="container mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
          {/* Left nav */}
          <nav className="hidden md:flex items-center gap-8 text-[11px] tracking-[0.18em] uppercase font-sans font-light">
            <Link
              href="/products"
              className={`transition-colors hover:text-primary ${location.startsWith("/products") ? "text-primary" : "text-muted-foreground"}`}
            >
              {t.nav.shop}
            </Link>
            <Link href="/products?category=pillowcases" className="transition-colors hover:text-primary text-muted-foreground">
              {t.nav.bedding}
            </Link>
            <Link href="/products?category=towels" className="transition-colors hover:text-primary text-muted-foreground">
              {t.nav.bath}
            </Link>
          </nav>

          {/* Logo — centered, dynamic name */}
          <Link href="/" className="absolute left-1/2 -translate-x-1/2">
            <span className="font-serif text-2xl tracking-[0.25em] text-gold-gradient font-light uppercase">
              {storeName}
            </span>
          </Link>

          {/* Right actions */}
          <div className="flex items-center gap-5 ml-auto">
            <button
              onClick={() => setLang(lang === "en" ? "hr" : "en")}
              className="text-[10px] tracking-[0.18em] uppercase text-muted-foreground hover:text-primary transition-colors font-sans font-light"
            >
              {lang === "en" ? "HR" : "EN"}
            </button>

            <Link href="/orders">
              <button className="text-muted-foreground hover:text-primary transition-colors">
                <Package className="h-4 w-4" />
                <span className="sr-only">{t.nav.orders}</span>
              </button>
            </Link>

            <Link href="/cart">
              <button className="relative text-muted-foreground hover:text-primary transition-colors">
                <ShoppingBag className="h-4 w-4" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[9px] text-primary-foreground font-medium">
                    {cartItemCount}
                  </span>
                )}
                <span className="sr-only">Cart</span>
              </button>
            </Link>

            <Link href="/admin" className="hidden md:block">
              <button className="text-[10px] tracking-[0.18em] uppercase text-muted-foreground hover:text-primary transition-colors font-sans font-light">
                {t.nav.admin}
              </button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t border-border/60 bg-background">
        <div className="divider-gold" />
        <div className="container mx-auto px-6 md:px-10 py-16 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
              <span className="font-serif text-3xl tracking-[0.25em] text-gold-gradient font-light uppercase block mb-5">
                {storeName}
              </span>
              <p className="text-muted-foreground max-w-xs leading-relaxed text-sm font-light mb-8">
                {settings.store_tagline}
              </p>
              {/* Newsletter */}
              {newsletterStatus === "done" ? (
                <p className="text-[11px] tracking-[0.2em] uppercase text-primary font-sans">
                  {lang === "en" ? "Thank you for subscribing." : "Hvala na pretplati."}
                </p>
              ) : (
                <form onSubmit={handleNewsletter} className="flex gap-0 max-w-xs">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder={lang === "en" ? "Your email" : "Vaš email"}
                    className="flex-1 bg-card border border-border/60 border-r-0 text-foreground placeholder:text-muted-foreground/40 px-4 py-3 text-xs focus:outline-none focus:border-primary/60 transition-colors font-sans font-light"
                  />
                  <button
                    type="submit"
                    disabled={newsletterStatus === "loading"}
                    className="bg-primary text-primary-foreground text-[10px] tracking-[0.2em] uppercase px-4 py-3 hover:bg-primary/90 transition-colors font-sans shrink-0 disabled:opacity-50"
                  >
                    {newsletterStatus === "loading" ? "..." : (lang === "en" ? "Join" : "Prijavi se")}
                  </button>
                </form>
              )}
              {newsletterStatus === "error" && (
                <p className="text-[10px] text-destructive mt-2 font-sans tracking-wide">
                  {lang === "en" ? "Something went wrong. Try again." : "Greška. Pokušajte ponovo."}
                </p>
              )}
              {settings.contact_email && (
                <p className="text-[11px] text-muted-foreground font-sans mt-6 tracking-wide">
                  {settings.contact_email}
                </p>
              )}
            </div>
            <div>
              <h4 className="text-[10px] tracking-[0.25em] uppercase text-primary mb-5 font-sans font-medium">{t.footer.shop}</h4>
              <ul className="space-y-3 text-sm text-muted-foreground font-light">
                <li><Link href="/products" className="hover:text-primary transition-colors">{t.footer.allProducts}</Link></li>
                <li><Link href="/products?category=pillowcases" className="hover:text-primary transition-colors">{t.footer.pillowcases}</Link></li>
                <li><Link href="/products?category=sheets" className="hover:text-primary transition-colors">{t.footer.sheets}</Link></li>
                <li><Link href="/products?category=towels" className="hover:text-primary transition-colors">{t.footer.towels}</Link></li>
                <li><Link href="/products?category=socks" className="hover:text-primary transition-colors">{t.footer.socks}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] tracking-[0.25em] uppercase text-primary mb-5 font-sans font-medium">{t.footer.support}</h4>
              <ul className="space-y-3 text-sm text-muted-foreground font-light">
                <li><Link href="/orders" className="hover:text-primary transition-colors">{t.nav.orders}</Link></li>
                <li><span className="cursor-pointer hover:text-primary transition-colors">{t.footer.shipping}</span></li>
                <li><span className="cursor-pointer hover:text-primary transition-colors">{t.footer.careGuide}</span></li>
                <li><span className="cursor-pointer hover:text-primary transition-colors">{t.footer.contact}</span></li>
              </ul>
            </div>
          </div>

          <div className="divider-gold mt-14 mb-8" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[11px] text-muted-foreground tracking-widest font-light">
              © {new Date().getFullYear()} {storeName}. {t.footer.rights}
            </p>
            <p className="text-[11px] text-muted-foreground tracking-widest font-light">
              {t.footer.madeWith}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
