import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Star } from "lucide-react";
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

async function fetchReviews(productId: number): Promise<Review[]> {
  const res = await fetch(`/api/products/${productId}/reviews`);
  if (!res.ok) return [];
  return res.json();
}

async function submitReview(productId: number, data: { authorName: string; rating: number; comment: string }): Promise<Review> {
  const res = await fetch(`/api/products/${productId}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to submit review");
  return res.json();
}

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  const interactive = !!onChange;
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={interactive ? "button" : undefined}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={interactive ? "cursor-pointer" : "cursor-default pointer-events-none"}
        >
          <Star
            className={`h-4 w-4 transition-colors ${
              star <= (hovered || value) ? "text-primary fill-primary" : "text-muted-foreground/20"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewForm({ productId, onDone }: { productId: number; onDone: () => void }) {
  const { lang } = useLang();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [done, setDone] = useState(false);

  const mutation = useMutation({
    mutationFn: (data: { authorName: string; rating: number; comment: string }) =>
      submitReview(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
      setDone(true);
    },
  });

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border/40 p-6 text-center">
        <p className="text-primary text-[10px] tracking-[0.3em] uppercase font-sans mb-2">
          {lang === "hr" ? "Hvala!" : "Thank you!"}
        </p>
        <p className="text-muted-foreground text-sm font-light">
          {lang === "hr"
            ? "Tvoj recenzija je primljena i bit će objavljena nakon pregleda."
            : "Your review has been received and will appear after approval."}
        </p>
        <button onClick={onDone} className="mt-4 text-[10px] tracking-[0.2em] uppercase text-muted-foreground hover:text-primary transition-colors font-sans">
          {lang === "hr" ? "Zatvori" : "Close"}
        </button>
      </motion.div>
    );
  }

  const inputClass = "w-full bg-background border border-border/60 text-foreground placeholder:text-muted-foreground/40 px-4 py-2.5 text-sm focus:outline-none focus:border-primary/60 transition-colors font-sans font-light";

  return (
    <motion.form
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={(e) => {
        e.preventDefault();
        if (!rating) return;
        mutation.mutate({ authorName: name, rating, comment });
      }}
      className="bg-card border border-border/40 p-6 space-y-4"
    >
      <p className="text-[10px] tracking-[0.3em] uppercase text-primary font-sans">
        {lang === "hr" ? "Napiši recenziju" : "Write a review"}
      </p>

      <div className="space-y-1">
        <label className="text-[10px] tracking-[0.2em] uppercase font-sans text-muted-foreground">
          {lang === "hr" ? "Ocjena" : "Rating"}
        </label>
        <StarRating value={rating} onChange={setRating} />
        {!rating && mutation.isError && (
          <p className="text-[10px] text-destructive font-sans">
            {lang === "hr" ? "Odaberi ocjenu" : "Please select a rating"}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label className="text-[10px] tracking-[0.2em] uppercase font-sans text-muted-foreground">
          {lang === "hr" ? "Ime" : "Name"}
        </label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={lang === "hr" ? "Tvoje ime" : "Your name"}
          className={inputClass}
        />
      </div>

      <div className="space-y-1">
        <label className="text-[10px] tracking-[0.2em] uppercase font-sans text-muted-foreground">
          {lang === "hr" ? "Komentar" : "Comment"}
        </label>
        <textarea
          required
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={lang === "hr" ? "Podijeli svoje iskustvo..." : "Share your experience..."}
          className={`${inputClass} resize-none`}
        />
      </div>

      {mutation.isError && (
        <p className="text-[10px] text-destructive font-sans">
          {lang === "hr" ? "Greška. Pokušaj ponovo." : "Something went wrong. Try again."}
        </p>
      )}

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onDone}
          className="flex-1 border border-border/60 text-[11px] tracking-[0.2em] uppercase py-2.5 text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors font-sans"
        >
          {lang === "hr" ? "Odustani" : "Cancel"}
        </button>
        <button
          type="submit"
          disabled={mutation.isPending || !rating}
          className="flex-1 bg-primary text-primary-foreground text-[11px] tracking-[0.2em] uppercase py-2.5 hover:bg-primary/90 transition-colors font-sans disabled:opacity-40"
        >
          {mutation.isPending
            ? (lang === "hr" ? "Šaljem..." : "Sending...")
            : (lang === "hr" ? "Pošalji" : "Submit")}
        </button>
      </div>
    </motion.form>
  );
}

export function ProductReviews({ productId }: { productId: number }) {
  const { lang } = useLang();
  const [showForm, setShowForm] = useState(false);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["reviews", productId],
    queryFn: () => fetchReviews(productId),
  });

  const avg = reviews.length
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
    : 0;

  return (
    <div className="mt-16 border-t border-border/40 pt-12">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-[10px] tracking-[0.35em] uppercase text-primary mb-3 font-sans">
            {lang === "hr" ? "Recenzije" : "Reviews"}
          </p>
          <div className="w-8 h-px bg-primary/40" />
          {reviews.length > 0 && (
            <div className="flex items-center gap-3 mt-3">
              <StarRating value={Math.round(avg)} />
              <span className="text-sm text-muted-foreground font-light font-sans">
                {avg} / 5 · {reviews.length} {lang === "hr" ? "recenzija" : "reviews"}
              </span>
            </div>
          )}
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-[11px] tracking-[0.2em] uppercase border border-primary/40 px-5 py-2.5 text-primary hover:bg-primary/5 transition-colors font-sans"
          >
            {lang === "hr" ? "Napiši recenziju" : "Write a review"}
          </button>
        )}
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <div className="mb-8">
            <ReviewForm productId={productId} onDone={() => setShowForm(false)} />
          </div>
        )}
      </AnimatePresence>

      {/* Reviews list */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => <div key={n} className="h-24 bg-card animate-pulse" />)}
        </div>
      ) : reviews.length === 0 ? (
        <div className="py-12 text-center border border-border/40">
          <p className="text-muted-foreground text-sm font-light">
            {lang === "hr"
              ? "Još nema recenzija. Budi prvi!"
              : "No reviews yet. Be the first!"}
          </p>
        </div>
      ) : (
        <div className="space-y-px">
          {reviews.map((review, idx) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-card border-b border-border/40 p-6"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="font-sans text-sm font-light">{review.authorName}</p>
                  <p className="text-[10px] text-muted-foreground font-sans mt-0.5">
                    {new Date(review.createdAt).toLocaleDateString(lang === "hr" ? "hr-HR" : "en-GB", {
                      day: "numeric", month: "long", year: "numeric"
                    })}
                  </p>
                </div>
                <StarRating value={review.rating} />
              </div>
              <p className="text-muted-foreground text-sm font-light leading-relaxed">{review.comment}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
