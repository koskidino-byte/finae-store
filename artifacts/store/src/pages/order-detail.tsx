import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useGetOrder } from "@workspace/api-client-react";
import { ArrowLeft, Package, CheckCircle, Truck, Clock, RotateCcw } from "lucide-react";
import { useLang } from "@/lib/i18n";

const STATUS_STEPS = ["pending", "processing", "shipped", "delivered"] as const;
const STATUS_ICONS = { pending: Clock, processing: RotateCcw, shipped: Truck, delivered: CheckCircle };

export function OrderDetail() {
  const [location] = useLocation();
  const id = parseInt(location.split("/").pop() ?? "0");
  const { data: order, isLoading } = useGetOrder(id, { query: { enabled: !!id, queryKey: useGetOrder.bind(null, id) as never } });
  const { t } = useLang();

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 md:px-10 py-20">
        <div className="space-y-4 max-w-xl">
          <div className="h-6 bg-card animate-pulse w-1/3" />
          <div className="h-32 bg-card animate-pulse" />
          <div className="h-48 bg-card animate-pulse" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-6 md:px-10 py-20 text-center">
        <p className="font-serif text-2xl font-light mb-6">{t.order.notFound}</p>
        <Link href="/orders">
          <button className="border border-border/60 text-[11px] tracking-[0.2em] uppercase px-6 py-3 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors font-sans">
            {t.order.back}
          </button>
        </Link>
      </div>
    );
  }

  const currentStep = STATUS_STEPS.indexOf(order.status as typeof STATUS_STEPS[number]);

  return (
    <div className="container mx-auto px-6 md:px-10 py-14 md:py-20 max-w-2xl">
      <Link href="/orders">
        <button className="flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-muted-foreground hover:text-primary transition-colors mb-10 font-sans">
          <ArrowLeft className="h-3 w-3" /> {t.order.back}
        </button>
      </Link>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-10">
          <p className="text-[10px] tracking-[0.35em] uppercase text-primary mb-3 font-sans">{t.common.order} #{order.id}</p>
          <div className="divider-gold" />
          <p className="text-muted-foreground text-sm mt-4 font-light">
            {new Date(order.createdAt).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>

        {/* Progress */}
        <div className="border border-border/60 p-8 bg-card mb-4">
          <div className="flex items-start justify-between">
            {STATUS_STEPS.map((step, idx) => {
              const Icon = STATUS_ICONS[step];
              const done = idx <= currentStep;
              return (
                <div key={step} className="flex flex-col items-center gap-2 flex-1">
                  <div className={`h-8 w-8 border flex items-center justify-center transition-colors ${done ? "border-primary bg-primary/10 text-primary" : "border-border/40 text-muted-foreground/30"}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <p className={`text-[9px] tracking-[0.15em] uppercase font-sans ${done ? "text-primary" : "text-muted-foreground/40"}`}>
                    {t.order.status[step]}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Customer info */}
        <div className="border border-border/60 p-8 bg-card mb-4">
          <p className="text-[10px] tracking-[0.25em] uppercase text-primary mb-5 font-sans">{t.order.shippingDetails}</p>
          <div className="text-sm space-y-1 text-muted-foreground font-light">
            <p className="text-foreground">{order.customerName}</p>
            <p>{order.customerEmail}</p>
            <p className="whitespace-pre-line mt-1">{order.shippingAddress}</p>
          </div>
        </div>

        {/* Items */}
        <div className="border border-border/60 p-8 bg-card">
          <p className="text-[10px] tracking-[0.25em] uppercase text-primary mb-6 font-sans">{t.order.items}</p>
          <div className="space-y-5">
            {order.items.map((oi) => (
              <div key={oi.id} data-testid={`row-order-item-${oi.id}`} className="flex items-center gap-5">
                <div className="h-12 w-10 bg-secondary flex items-center justify-center shrink-0">
                  <Package className="h-4 w-4 text-muted-foreground/20" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-serif font-light text-sm">{oi.productName}</p>
                  <p className="text-[10px] text-muted-foreground font-sans font-light tracking-wider mt-0.5">
                    × {oi.quantity}
                    {oi.selectedColor ? ` · ${oi.selectedColor}` : ""}
                    {oi.selectedSize ? ` · ${oi.selectedSize}` : ""}
                  </p>
                </div>
                <p className="text-sm font-light tracking-wide shrink-0">€{(Number(oi.price) * oi.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="divider-gold my-6" />
          <div className="flex justify-between text-sm">
            <span className="font-light tracking-wide">{t.order.total}</span>
            <span className="text-primary tracking-wide">€{Number(order.total).toFixed(2)}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
