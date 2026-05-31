import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  useGetCart,
  useUpdateCartItem,
  useRemoveCartItem,
  useClearCart,
  getGetCartQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLang } from "@/lib/i18n";
import { ShoppingBag, Trash2, ArrowRight, Package } from "lucide-react";

export function Cart() {
  const { data: cart, isLoading } = useGetCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const clearCart = useClearCart();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { t } = useLang();

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
  }

  function handleUpdate(id: number, qty: number) {
    updateItem.mutate({ id, data: { quantity: qty } }, { onSuccess: invalidate });
  }

  function handleRemove(id: number) {
    removeItem.mutate({ id }, {
      onSuccess: () => { invalidate(); toast({ title: t.common.itemRemoved }); },
    });
  }

  function handleClear() {
    clearCart.mutate(undefined as never, {
      onSuccess: () => { invalidate(); toast({ title: t.common.cartCleared }); },
    });
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 md:px-10 py-20">
        <div className="space-y-3 max-w-2xl">
          {[1, 2].map((n) => (
            <div key={n} className="h-24 bg-card animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const items = cart?.items ?? [];

  return (
    <div className="container mx-auto px-6 md:px-10 py-14 md:py-20">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
        <p className="text-[10px] tracking-[0.35em] uppercase text-primary mb-3 font-sans">{t.cart.title}</p>
        <div className="divider-gold" />
        <p className="text-muted-foreground text-sm mt-4 font-light">{cart?.itemCount ?? 0} items</p>
      </motion.div>

      {items.length === 0 ? (
        <div className="text-center py-28">
          <ShoppingBag className="h-10 w-10 text-muted-foreground/20 mx-auto mb-6" />
          <p className="font-serif text-3xl font-light mb-3">{t.cart.empty}</p>
          <p className="text-muted-foreground text-sm mb-8 font-light tracking-wide">{t.cart.emptySub}</p>
          <Link href="/products">
            <button className="bg-primary text-primary-foreground text-[11px] tracking-[0.2em] uppercase px-8 py-3 hover:bg-primary/90 transition-colors font-sans">
              {t.cart.shopNow}
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Items */}
          <div className="lg:col-span-2 space-y-px">
            <AnimatePresence>
              {items.map((cartItem) => (
                <motion.div
                  key={cartItem.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -16 }}
                  data-testid={`card-cart-item-${cartItem.id}`}
                  className="flex gap-5 p-5 bg-card border-b border-border/40"
                >
                  <div className="h-20 w-16 bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
                    {cartItem.product?.imageUrl ? (
                      <img src={cartItem.product.imageUrl} alt={cartItem.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="h-5 w-5 text-muted-foreground/20" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-serif text-base font-light">{cartItem.product?.name}</p>
                    <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mt-1 font-sans">{cartItem.product?.category}</p>
                    {cartItem.selectedColor && <p className="text-xs text-muted-foreground mt-1 font-light">{cartItem.selectedColor}</p>}
                    {cartItem.selectedSize && <p className="text-xs text-muted-foreground font-light">{cartItem.selectedSize}</p>}
                    <p className="text-primary text-sm mt-2 tracking-wide">€{Number(cartItem.product?.price ?? 0).toFixed(2)}</p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button
                      data-testid={`button-remove-${cartItem.id}`}
                      onClick={() => handleRemove(cartItem.id)}
                      className="text-muted-foreground/40 hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <div className="flex items-center border border-border/60 text-sm">
                      <button
                        data-testid={`button-decrease-${cartItem.id}`}
                        className="px-3 py-1.5 text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => cartItem.quantity > 1 ? handleUpdate(cartItem.id, cartItem.quantity - 1) : handleRemove(cartItem.id)}
                      >−</button>
                      <span className="px-3 py-1.5 min-w-[2rem] text-center font-light">{cartItem.quantity}</span>
                      <button
                        data-testid={`button-increase-${cartItem.id}`}
                        className="px-3 py-1.5 text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => handleUpdate(cartItem.id, cartItem.quantity + 1)}
                      >+</button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div className="pt-4">
              <button onClick={handleClear} className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/50 hover:text-destructive transition-colors font-sans flex items-center gap-2">
                <Trash2 className="h-3 w-3" /> {t.cart.clearCart}
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="sticky top-24 border border-border/60 p-8 bg-card"
            >
              <p className="text-[10px] tracking-[0.25em] uppercase text-primary mb-6 font-sans">{t.cart.orderSummary}</p>
              <div className="space-y-3 text-sm font-light">
                {items.map((ci) => (
                  <div key={ci.id} className="flex justify-between text-muted-foreground">
                    <span className="truncate max-w-[60%] tracking-wide">{ci.product?.name} × {ci.quantity}</span>
                    <span>€{(Number(ci.product?.price ?? 0) * ci.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="divider-gold my-5" />
              <div className="flex justify-between text-sm mb-1">
                <span className="tracking-wide font-light">{t.cart.total}</span>
                <span className="text-primary tracking-wide">€{Number(cart?.total ?? 0).toFixed(2)}</span>
              </div>
              <p className="text-[10px] text-muted-foreground/60 tracking-wide font-sans font-light mb-6">{t.cart.shipping}</p>
              <button
                data-testid="button-checkout"
                className="w-full bg-primary text-primary-foreground text-[11px] tracking-[0.2em] uppercase py-4 flex items-center justify-center gap-3 hover:bg-primary/90 transition-colors font-sans"
                onClick={() => setLocation("/checkout")}
              >
                {t.cart.checkout} <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <Link href="/products">
                <button className="w-full mt-3 text-[10px] tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors py-2 font-sans">
                  {t.cart.continueShopping}
                </button>
              </Link>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}
