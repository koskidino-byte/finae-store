import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Star, Check, Trash2, MessageSquare } from "lucide-react";
import { useLang } from "@/lib/i18n";

type Review = {
  id: number;
  productId: number;
  authorName: string;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt: string;
};

async function fetchPending(): Promise<Review[]> {
  const res = await fetch("/api/reviews/pending");
  if (!res.ok) return [];
  return res.json();
}

function StarRow({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`h-3 w-3 ${s <= value ? "text-primary fill-primary" : "text-muted-foreground/20"}`} />
      ))}
    </div>
  );
}

export function AdminReviews() {
  const { lang } = useLang();
  const queryClient = useQueryClient();

  const { data: pending = [], isLoading } = useQuery({
    queryKey: ["admin-reviews-pending"],
    queryFn: fetchPending,
    refetchInterval: 30000,
  });

  const approve = useMutation({
    mutationFn: (id: number) => fetch(`/api/reviews/${id}/approve`, { method: "PATCH" }).then((r) => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-reviews-pending"] }),
  });

  const remove = useMutation({
    mutationFn: (id: number) => fetch(`/api/reviews/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-reviews-pending"] }),
  });

  if (isLoading) {
    return <div className="space-y-px">{[1, 2, 3].map((n) => <div key={n} className="h-20 bg-card animate-pulse" />)}</div>;
  }

  if (pending.length === 0) {
    return (
      <div className="py-16 text-center border border-border/40">
        <MessageSquare className="h-8 w-8 text-muted-foreground/20 mx-auto mb-4" />
        <p className="text-muted-foreground text-sm font-light">
          {lang === "hr" ? "Nema recenzija na čekanju." : "No reviews pending approval."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-px">
      {pending.map((review, idx) => (
        <motion.div
          key={review.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.04 }}
          className="bg-card border-b border-border/40 px-5 py-4"
        >
          <div className="flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <p className="font-sans text-sm font-light">{review.authorName}</p>
                <StarRow value={review.rating} />
                <span className="text-[9px] text-muted-foreground font-sans">
                  {lang === "hr" ? `Proizvod #${review.productId}` : `Product #${review.productId}`}
                </span>
              </div>
              <p className="text-muted-foreground text-sm font-light leading-relaxed">{review.comment}</p>
              <p className="text-[9px] text-muted-foreground/50 font-sans mt-2">
                {new Date(review.createdAt).toLocaleDateString(lang === "hr" ? "hr-HR" : "en-GB")}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => approve.mutate(review.id)}
                disabled={approve.isPending}
                className="flex items-center gap-1.5 bg-primary text-primary-foreground text-[10px] tracking-[0.15em] uppercase px-3 py-2 hover:bg-primary/90 transition-colors font-sans disabled:opacity-40"
              >
                <Check className="h-3 w-3" />
                {lang === "hr" ? "Odobri" : "Approve"}
              </button>
              <button
                onClick={() => remove.mutate(review.id)}
                disabled={remove.isPending}
                className="p-2 text-muted-foreground/40 hover:text-destructive transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
