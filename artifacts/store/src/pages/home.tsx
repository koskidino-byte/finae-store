import { Link } from "wouter";
import { motion } from "framer-motion";
import { useListProducts, useGetProductSummary } from "@workspace/api-client-react";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { useLang } from "@/lib/i18n";
import { useSettings } from "@/lib/settings-context";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } };

export function Home() {
  const { data: featured, isLoading } = useListProducts({ featured: true });
  const { data: summary } = useGetProductSummary();
  const { t, lang } = useLang();
  const { settings } = useSettings();

  const cats = [
    { key: "pillowcases", ...t.home.cats.pillowcases },
    { key: "sheets", ...t.home.cats.sheets },
    { key: "towels", ...t.home.cats.towels },
    { key: "socks", ...t.home.cats.socks },
  ];

  const freeShipping = settings.free_shipping_min;
  const symbol = settings.currency_symbol;

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[88vh] flex items-center border-b border-border/40">
        <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

        <div className="container mx-auto px-6 md:px-10 py-24 md:py-32">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="max-w-3xl">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-[10px] tracking-[0.35em] uppercase text-primary mb-8 font-sans"
            >
              {t.home.badge}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.8 }}
              className="font-serif text-6xl md:text-8xl font-light leading-[1.05] mb-8"
            >
              {settings.hero_title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="text-muted-foreground text-base md:text-lg leading-relaxed mb-12 max-w-xl font-light"
            >
              {settings.hero_subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link href="/products">
                <button className="bg-primary text-primary-foreground text-[11px] tracking-[0.2em] uppercase px-8 py-4 flex items-center gap-3 hover:bg-primary/90 transition-colors font-sans">
                  {t.home.shopAll} <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </Link>
              <Link href="/products?category=sheets">
                <button className="border border-primary/40 text-foreground text-[11px] tracking-[0.2em] uppercase px-8 py-4 hover:border-primary hover:text-primary transition-colors font-sans">
                  {t.home.shopSheets}
                </button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Category grid */}
      <section className="container mx-auto px-6 md:px-10 py-20 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <p className="text-[10px] tracking-[0.35em] uppercase text-primary mb-4 font-sans">{t.home.byCategory}</p>
          <div className="divider-gold" />
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border/40"
        >
          {cats.map((cat) => {
            const count = summary?.categories.find((c) => c.category === cat.key)?.count;
            return (
              <motion.div key={cat.key} variants={item}>
                <Link href={`/products?category=${cat.key}`}>
                  <div className="group bg-background p-8 md:p-10 h-52 md:h-64 flex flex-col justify-between cursor-pointer hover:bg-card transition-colors duration-300">
                    <p className="text-[9px] tracking-[0.25em] uppercase text-muted-foreground font-sans">
                      {count !== undefined ? `${count} ${t.home.items}` : ""}
                    </p>
                    <div>
                      <h3 className="font-serif text-2xl md:text-3xl font-light group-hover:text-primary transition-colors duration-300 mb-2">
                        {cat.label}
                      </h3>
                      <p className="text-[11px] text-muted-foreground font-light tracking-wide">{cat.desc}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Featured products */}
      <section className="border-t border-border/40">
        <div className="container mx-auto px-6 md:px-10 py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-14"
          >
            <div>
              <p className="text-[10px] tracking-[0.35em] uppercase text-primary mb-3 font-sans">{t.home.featured}</p>
              <p className="text-muted-foreground text-sm font-light">{t.home.featuredSub}</p>
            </div>
            <Link href="/products">
              <button className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 font-sans">
                {t.home.seeAll} <ArrowRight className="h-3 w-3" />
              </button>
            </Link>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border/40">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="aspect-[3/4] bg-card animate-pulse" />
              ))}
            </div>
          ) : (
            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border/40"
            >
              {(featured ?? []).slice(0, 4).map((product) => (
                <motion.div key={product.id} variants={item} className="bg-background">
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Value props */}
      <section className="border-t border-border/40">
        <div className="container mx-auto px-6 md:px-10 py-20">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border/40"
          >
            {[
              { title: t.home.quality, body: t.home.qualityBody },
              {
                title: lang === "en" ? `Free shipping over ${symbol}${freeShipping}` : `Besplatna dostava iznad ${freeShipping}${symbol}`,
                body: t.home.shippingBody,
              },
              { title: t.home.returns, body: t.home.returnsBody },
            ].map((prop) => (
              <motion.div key={prop.title} variants={item} className="bg-background p-10 md:p-12">
                <div className="w-8 h-px bg-primary mb-6" />
                <h3 className="font-serif text-xl font-light mb-4">{prop.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed font-light">{prop.body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
