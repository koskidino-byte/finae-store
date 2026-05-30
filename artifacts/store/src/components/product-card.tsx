import { Link } from "wouter";
import { motion } from "framer-motion";
import { useAddCartItem, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLang } from "@/lib/i18n";
import { ShoppingBag, Package } from "lucide-react";

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string | null;
  inStock: boolean;
  featured: boolean;
  createdAt: string;
};

export function ProductCard({ product }: { product: Product }) {
  const addItem = useAddCartItem();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useLang();

  function quickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem.mutate(
      { data: { productId: product.id, quantity: 1 } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          toast({ title: t.common.addedToCart, description: product.name });
        },
      }
    );
  }

  return (
    <Link href={`/products/${product.id}`}>
      <motion.div
        data-testid={`card-product-${product.id}`}
        whileHover={{ y: -3 }}
        transition={{ duration: 0.25 }}
        className="group relative cursor-pointer bg-card border border-border/60 overflow-hidden hover:border-primary/40 transition-all duration-400"
      >
        {/* Image */}
        <div className="aspect-[3/4] bg-secondary relative overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-muted-foreground/20">
              <Package className="h-12 w-12" />
            </div>
          )}

          {/* Featured badge */}
          {product.featured && (
            <div className="absolute top-3 left-3">
              <span className="text-[9px] tracking-[0.2em] uppercase bg-primary text-primary-foreground px-2 py-1 font-sans">
                {t.common.addedToCart.includes("Added") ? "Featured" : "Istaknuto"}
              </span>
            </div>
          )}

          {/* Out of stock overlay */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
              <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-sans border border-border px-3 py-1.5">
                {t.product.outOfStock}
              </span>
            </div>
          )}

          {/* Quick add — appears on hover */}
          {product.inStock && (
            <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <button
                data-testid={`button-quick-add-${product.id}`}
                onClick={quickAdd}
                disabled={addItem.isPending}
                className="w-full bg-primary text-primary-foreground text-[10px] tracking-[0.2em] uppercase py-3 flex items-center justify-center gap-2 font-sans hover:bg-primary/90 transition-colors"
              >
                <ShoppingBag className="h-3 w-3" />
                {addItem.isPending ? "..." : t.product.addToCart}
              </button>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-[9px] tracking-[0.22em] uppercase text-primary mb-1.5 font-sans">{product.category}</p>
          <h3 className="font-serif text-base font-light group-hover:text-primary transition-colors leading-snug">{product.name}</h3>
          <p className="text-sm text-muted-foreground mt-2 font-light tracking-wide">€{Number(product.price).toFixed(2)}</p>
        </div>
      </motion.div>
    </Link>
  );
}
