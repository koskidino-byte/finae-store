import { Router } from "express";
import { db } from "@workspace/db";
import { reviewsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { z } from "zod/v4";

const router = Router();

const CreateReviewBody = z.object({
  authorName: z.string().min(1).max(80),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(3).max(1000),
});

router.get("/products/:id/reviews", async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    if (isNaN(productId)) { res.status(400).json({ error: "Invalid product id" }); return; }
    const rows = await db
      .select()
      .from(reviewsTable)
      .where(and(eq(reviewsTable.productId, productId), eq(reviewsTable.approved, true)));
    res.json(rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })));
  } catch (err) {
    req.log.error({ err }, "Failed to get reviews");
    res.status(500).json({ error: "Failed to get reviews" });
  }
});

router.post("/products/:id/reviews", async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    if (isNaN(productId)) { res.status(400).json({ error: "Invalid product id" }); return; }
    const body = CreateReviewBody.parse(req.body);
    const [review] = await db.insert(reviewsTable).values({
      productId,
      authorName: body.authorName,
      rating: body.rating,
      comment: body.comment,
      approved: false,
    }).returning();
    res.status(201).json({ ...review, createdAt: review.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to create review");
    res.status(400).json({ error: "Failed to create review" });
  }
});

router.get("/reviews/pending", async (req, res) => {
  try {
    const rows = await db.select().from(reviewsTable).where(eq(reviewsTable.approved, false));
    res.json(rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })));
  } catch (err) {
    req.log.error({ err }, "Failed to get pending reviews");
    res.status(500).json({ error: "Failed to get pending reviews" });
  }
});

router.patch("/reviews/:id/approve", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [review] = await db.update(reviewsTable).set({ approved: true }).where(eq(reviewsTable.id, id)).returning();
    if (!review) { res.status(404).json({ error: "Review not found" }); return; }
    res.json({ ...review, createdAt: review.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to approve review");
    res.status(500).json({ error: "Failed to approve" });
  }
});

router.delete("/reviews/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(reviewsTable).where(eq(reviewsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete review");
    res.status(500).json({ error: "Failed to delete" });
  }
});

export default router;
