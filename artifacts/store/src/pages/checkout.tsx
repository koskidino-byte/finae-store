import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateOrder, useGetCart, getGetCartQueryKey, getListOrdersQueryKey } from "@workspace/api-client-react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLang } from "@/lib/i18n";
import { CheckCircle, Package } from "lucide-react";

const schema = z.object({
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  shippingAddress: z.string().min(10),
});
type FormValues = z.infer<typeof schema>;

export function Checkout() {
  const { data: cart } = useGetCart();
  const createOrder = useCreateOrder();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { t } = useLang();
  const [orderId, setOrderId] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { customerName: "", customerEmail: "", shippingAddress: "" },
  });

  function onSubmit(values: FormValues) {
    fetch("/api/klaviyo/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: values.customerEmail,
        event: "Started Checkout",
        properties: {
          customerName: values.customerName,
          total: cart?.total ?? 0,
          itemCount: cart?.itemCount ?? 0,
          items: (cart?.items ?? []).map((i) => ({
            name: i.product?.name,
            quantity: i.quantity,
            price: i.product?.price,
          })),
        },
      }),
    }).catch(() => {});

    createOrder.mutate(
      { data: values },
      {
        onSuccess: (order) => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
          setOrderId(order.id);
        },
        onError: () => {
          toast({ title: t.common.failedOrder, description: t.common.isCartEmpty, variant: "destructive" });
        },
      }
    );
  }

  if (orderId) {
    return (
      <div className="container mx-auto px-6 md:px-10 py-28 text-center max-w-md">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
          <div className="w-16 h-16 border border-primary/40 flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="h-8 w-8 text-primary" />
          </div>
          <p className="text-[10px] tracking-[0.3em] uppercase text-primary mb-4 font-sans">{t.checkout.confirmed}</p>
          <h1 className="font-serif text-4xl font-light mb-4">{t.common.order} #{orderId}</h1>
          <p className="text-muted-foreground font-light mb-2">{t.checkout.confirmedSub}</p>
          <p className="text-muted-foreground text-sm font-light mb-10">{t.checkout.confirmedSub2}</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setLocation(`/orders/${orderId}`)}
              className="bg-primary text-primary-foreground text-[11px] tracking-[0.2em] uppercase px-8 py-4 hover:bg-primary/90 transition-colors font-sans"
            >
              {t.checkout.viewOrder}
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

  const items = cart?.items ?? [];

  const inputClass = "w-full bg-card border border-border/60 text-foreground placeholder:text-muted-foreground/40 px-4 py-3 text-sm focus:outline-none focus:border-primary/60 transition-colors font-sans font-light tracking-wide";

  return (
    <div className="container mx-auto px-6 md:px-10 py-14 md:py-20">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
        <p className="text-[10px] tracking-[0.35em] uppercase text-primary mb-3 font-sans">{t.checkout.title}</p>
        <div className="divider-gold" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="border border-border/60 p-8 bg-card space-y-6">
                <p className="text-[10px] tracking-[0.25em] uppercase text-primary font-sans">{t.checkout.contact}</p>
                <FormField control={form.control} name="customerName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-sans font-normal">{t.checkout.fullName}</FormLabel>
                    <FormControl>
                      <input data-testid="input-name" placeholder={t.checkout.namePlaceholder} className={inputClass} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="customerEmail" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-sans font-normal">{t.checkout.email}</FormLabel>
                    <FormControl>
                      <input data-testid="input-email" type="email" placeholder={t.checkout.emailPlaceholder} className={inputClass} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="border border-border/60 p-8 bg-card space-y-6">
                <p className="text-[10px] tracking-[0.25em] uppercase text-primary font-sans">{t.checkout.shippingAddress}</p>
                <FormField control={form.control} name="shippingAddress" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-sans font-normal">{t.checkout.fullAddress}</FormLabel>
                    <FormControl>
                      <textarea
                        data-testid="input-address"
                        placeholder="123 Main St&#10;London, UK"
                        rows={3}
                        className={`${inputClass} resize-none`}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <button
                data-testid="button-place-order"
                type="submit"
                disabled={createOrder.isPending || items.length === 0}
                className="w-full bg-primary text-primary-foreground text-[11px] tracking-[0.2em] uppercase py-4 hover:bg-primary/90 transition-colors font-sans disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {createOrder.isPending ? t.checkout.placing : `${t.checkout.placeOrder} — €${Number(cart?.total ?? 0).toFixed(2)}`}
              </button>

              {items.length === 0 && (
                <p className="text-center text-xs text-muted-foreground font-light tracking-wide">{t.checkout.emptyCart}</p>
              )}
            </form>
          </Form>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 border border-border/60 p-8 bg-card">
            <p className="text-[10px] tracking-[0.25em] uppercase text-primary mb-6 font-sans">{t.checkout.yourOrder}</p>
            <div className="space-y-4">
              {items.map((ci) => (
                <div key={ci.id} className="flex gap-4">
                  <div className="h-14 w-11 bg-secondary shrink-0 flex items-center justify-center overflow-hidden">
                    {ci.product?.imageUrl ? (
                      <img src={ci.product.imageUrl} alt={ci.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="h-4 w-4 text-muted-foreground/20" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-serif font-light truncate">{ci.product?.name}</p>
                    <p className="text-xs text-muted-foreground font-light">× {ci.quantity}</p>
                  </div>
                  <p className="text-sm font-light shrink-0 tracking-wide">€{(Number(ci.product?.price ?? 0) * ci.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="divider-gold my-5" />
            <div className="flex justify-between text-sm">
              <span className="font-light tracking-wide">{t.cart.total}</span>
              <span className="text-primary tracking-wide">€{Number(cart?.total ?? 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
