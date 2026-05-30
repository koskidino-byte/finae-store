import { Link } from "wouter";
import { motion } from "framer-motion";
import { useListOrders } from "@workspace/api-client-react";
import { Package, ArrowRight } from "lucide-react";
import { useLang } from "@/lib/i18n";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

const STATUS_COLORS: Record<string, string> = {
  pending: "text-yellow-500",
  processing: "text-blue-400",
  shipped: "text-purple-400",
  delivered: "text-primary",
};

export function Orders() {
  const { data: orders, isLoading } = useListOrders();
  const { t } = useLang();

  return (
    <div className="container mx-auto px-6 md:px-10 py-14 md:py-20">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
        <p className="text-[10px] tracking-[0.35em] uppercase text-primary mb-3 font-sans">{t.orders.title}</p>
        <div className="divider-gold" />
        <p className="text-muted-foreground text-sm mt-4 font-light">{orders?.length ?? 0} {t.orders.placed}</p>
      </motion.div>

      {isLoading ? (
        <div className="space-y-px">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-20 bg-card animate-pulse" />
          ))}
        </div>
      ) : !orders || orders.length === 0 ? (
        <div className="text-center py-28">
          <Package className="h-10 w-10 text-muted-foreground/20 mx-auto mb-6" />
          <p className="font-serif text-3xl font-light mb-3">{t.orders.empty}</p>
          <p className="text-muted-foreground text-sm mb-10 font-light tracking-wide">{t.orders.emptySub}</p>
          <Link href="/products">
            <button className="bg-primary text-primary-foreground text-[11px] tracking-[0.2em] uppercase px-8 py-3 hover:bg-primary/90 transition-colors font-sans">
              {t.orders.startShopping}
            </button>
          </Link>
        </div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-px">
          {[...orders]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((order) => (
              <motion.div key={order.id} variants={item}>
                <Link href={`/orders/${order.id}`}>
                  <div
                    data-testid={`card-order-${order.id}`}
                    className="group flex items-center justify-between gap-6 p-6 bg-card border-b border-border/40 hover:bg-secondary/30 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-5">
                      <div className="h-9 w-9 border border-border/60 flex items-center justify-center">
                        <Package className="h-4 w-4 text-muted-foreground/40" />
                      </div>
                      <div>
                        <p className="font-serif text-base font-light">{t.common.order} #{order.id}</p>
                        <p className="text-[10px] tracking-[0.15em] text-muted-foreground font-sans font-light mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                          {" · "}{order.items.length} {order.items.length !== 1 ? t.orders.items : t.orders.item}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 ml-auto">
                      <span className={`text-[10px] tracking-[0.2em] uppercase font-sans ${STATUS_COLORS[order.status] ?? "text-muted-foreground"}`}>
                        {t.order.status[order.status as keyof typeof t.order.status] ?? order.status}
                      </span>
                      <p className="text-primary tracking-wide text-sm">€{Number(order.total).toFixed(2)}</p>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
        </motion.div>
      )}
    </div>
  );
}
