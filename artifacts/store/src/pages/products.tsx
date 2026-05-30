import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useListProducts } from "@workspace/api-client-react";
import { Search, X } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { useLang } from "@/lib/i18n";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export function Products() {
  const [location] = useLocation();
  const { t } = useLang();

  const CATEGORIES = [
    { key: "", label: t.products.all },
    { key: "pillowcases", label: t.home.cats.pillowcases.label },
    { key: "sheets", label: t.home.cats.sheets.label },
    { key: "towels", label: t.home.cats.towels.label },
    { key: "socks", label: t.home.cats.socks.label },
  ];

  const params = new URLSearchParams(location.includes("?") ? location.split("?")[1] : "");
  const defaultCategory = params.get("category") ?? "";

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(defaultCategory);

  useEffect(() => {
    const p = new URLSearchParams(location.includes("?") ? location.split("?")[1] : "");
    setCategory(p.get("category") ?? "");
  }, [location]);

  const { data: products, isLoading } = useListProducts(category ? { category } : {});

  const filtered = (products ?? []).filter((p) =>
    search === "" ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto px-6 md:px-10 py-14 md:py-20">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
        <p className="text-[10px] tracking-[0.35em] uppercase text-primary mb-3 font-sans">{t.products.title}</p>
        <div className="divider-gold" />
        <p className="text-muted-foreground text-sm mt-4 font-light">
          {filtered.length} {filtered.length === 1 ? "product" : "products"}
        </p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-6 mb-12 border-b border-border/40 pb-8">
        {/* Category tabs */}
        <div className="flex gap-6 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              data-testid={`button-category-${cat.key || "all"}`}
              onClick={() => setCategory(cat.key)}
              className={`text-[10px] tracking-[0.2em] uppercase pb-1 transition-all font-sans border-b ${
                category === cat.key
                  ? "text-primary border-primary"
                  : "text-muted-foreground border-transparent hover:text-foreground hover:border-muted-foreground"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative sm:ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <input
            data-testid="input-search"
            placeholder={t.products.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-card border border-border/60 text-sm pl-9 pr-8 py-2.5 w-full sm:w-56 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 transition-colors font-sans font-light tracking-wide"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-border/40">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="aspect-[3/4] bg-card animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-28 text-muted-foreground">
          <p className="font-serif text-3xl font-light mb-3">{t.products.noProducts}</p>
          <p className="text-sm font-light tracking-wide">{t.products.noProductsSub}</p>
        </div>
      ) : (
        <motion.div
          key={`${category}-${search}`}
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-border/40"
        >
          {filtered.map((product) => (
            <motion.div key={product.id} variants={item} className="bg-background">
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
