import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useGetProduct, useAddCartItem, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLang } from "@/lib/i18n";
import { ArrowLeft, ShoppingBag, Package } from "lucide-react";
import { ProductReviews } from "@/components/product-reviews";

export function ProductDetail() {
  const [location, setLocation] = useLocation();
  const id = parseInt(location.split("/").pop() ?? "0");
  const { data: product, isLoading } = useGetProduct(id, { query: { enabled: !!id, queryKey: useGetProduct.bind(null, id) as never } });
  const addItem = useAddCartItem();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useLang();

  const colors = product?.colors ? product.colors.split(",").map((c) => c.trim()) : [];
  const sizes = product?.sizes ? product.sizes.split(",").map((s) => s.trim()) : [];

  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);

  function handleAddToCart() {
    if (!product) return;
    addItem.mutate(
      { data: { productId: product.id, quantity: qty, selectedColor: selectedColor ?? undefined, selectedSize: selectedSize ?? undefined } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          toast({ title: t.common.addedToCart, description: product.name });
        },
        onError: () => toast({ title: t.common.failedToAdd, description: t.common.tryAgain, variant: "destructive" }),
      }
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 md:px-10 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="aspect-[3/4] bg-card animate-pulse" />
          <div className="space-y-4 pt-4">
            <div className="h-5 bg-card animate-pulse w-1/4" />
            <div className="h-8 bg-card animate-pulse w-3/4" />
            <div className="h-20 bg-card animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-6 md:px-10 py-20 text-center">
        <p className="font-serif text-2xl font-light mb-6">{t.product.notFound}</p>
        <Link href="/products">
          <button className="border border-border/60 text-[11px] tracking-[0.2em] uppercase px-6 py-3 text-muted-foreground hover:border-primary/40 transition-colors font-sans">
            {t.product.backToShop}
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 md:px-10 py-12 md:py-20">
      <Link href="/products">
        <button className="flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-muted-foreground hover:text-primary transition-colors mb-10 font-sans">
          <ArrowLeft className="h-3 w-3" /> {t.product.backToShop}
        </button>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
        {/* Image */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <div
            data-testid={`img-product-${product.id}`}
            className="aspect-[3/4] bg-card border border-border/40 overflow-hidden flex items-center justify-center"
          >
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-3 text-muted-foreground/20">
                <Package className="h-16 w-16" />
              </div>
            )}
          </div>
        </motion.div>

        {/* Info */}
        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="flex flex-col py-2">
          <div className="mb-8">
            <p className="text-[10px] tracking-[0.3em] uppercase text-primary mb-3 font-sans">{product.category}</p>
            <h1 className="font-serif text-4xl md:text-5xl font-light leading-tight mb-4">{product.name}</h1>
            <p className="text-2xl text-primary tracking-wide font-light mb-6">€{Number(product.price).toFixed(2)}</p>
            <p className="text-muted-foreground font-light leading-relaxed text-sm">{product.description}</p>
          </div>

          {product.material && (
            <p className="text-xs text-muted-foreground font-sans mb-6 tracking-wide">
              <span className="text-foreground/60 uppercase tracking-widest text-[9px]">{t.product.material}:</span>{" "}{product.material}
            </p>
          )}

          {/* Stock */}
          <p className={`text-[10px] tracking-[0.2em] uppercase font-sans mb-8 ${product.inStock ? "text-primary" : "text-muted-foreground"}`}>
            {product.inStock ? `● ${t.product.inStock}` : `○ ${t.product.outOfStock}`}
          </p>

          {/* Color */}
          {colors.length > 0 && (
            <div className="mb-6">
              <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-3 font-sans">
                {t.product.color}{selectedColor ? ` — ${selectedColor}` : ""}
              </p>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    data-testid={`button-color-${color}`}
                    onClick={() => setSelectedColor(color === selectedColor ? null : color)}
                    className={`px-4 py-2 text-xs tracking-wide font-sans font-light border transition-colors ${
                      selectedColor === color ? "border-primary text-primary bg-primary/5" : "border-border/60 text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size */}
          {sizes.length > 0 && (
            <div className="mb-8">
              <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-3 font-sans">
                {t.product.size}{selectedSize ? ` — ${selectedSize}` : ""}
              </p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    data-testid={`button-size-${size}`}
                    onClick={() => setSelectedSize(size === selectedSize ? null : size)}
                    className={`px-4 py-2 text-xs tracking-wide font-sans font-light border transition-colors ${
                      selectedSize === size ? "border-primary text-primary bg-primary/5" : "border-border/60 text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Qty + Add */}
          <div className="flex items-stretch gap-3 mt-auto">
            <div className="flex items-center border border-border/60">
              <button
                data-testid="button-qty-decrease"
                className="px-4 py-3 text-muted-foreground hover:text-foreground transition-colors text-lg leading-none"
                onClick={() => setQty(Math.max(1, qty - 1))}
              >−</button>
              <span data-testid="text-qty" className="px-4 py-3 font-light min-w-[2.5rem] text-center text-sm">{qty}</span>
              <button
                data-testid="button-qty-increase"
                className="px-4 py-3 text-muted-foreground hover:text-foreground transition-colors text-lg leading-none"
                onClick={() => setQty(qty + 1)}
              >+</button>
            </div>
            <button
              data-testid="button-add-to-cart"
              className="flex-1 bg-primary text-primary-foreground text-[11px] tracking-[0.2em] uppercase flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors font-sans disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={!product.inStock || addItem.isPending}
              onClick={handleAddToCart}
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              {addItem.isPending ? t.product.adding : t.product.addToCart}
            </button>
          </div>

          <button
            data-testid="link-view-cart"
            className="mt-3 text-[10px] tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors py-2 font-sans"
            onClick={() => setLocation("/cart")}
          >
            {t.product.viewCart}
          </button>
        </motion.div>
      </div>

      <ProductReviews productId={product.id} />
    </div>
  );
}
