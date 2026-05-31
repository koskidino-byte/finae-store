import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";
import {
  ListProductsQueryParams,
  CreateProductBody,
  GetProductParams,
  UpdateProductParams,
  UpdateProductBody,
  DeleteProductParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/products/summary", async (req, res) => {
  try {
    const all = await db.select().from(productsTable);
    const catMap: Record<string, number> = {};
    let featuredCount = 0;
    for (const p of all) {
      catMap[p.category] = (catMap[p.category] ?? 0) + 1;
      if (p.featured) featuredCount++;
    }
    const categories = Object.entries(catMap).map(([category, count]) => ({ category, count }));
    res.json({ totalProducts: all.length, featuredCount, categories });
  } catch (err) {
    req.log.error({ err }, "Failed to get product summary");
    res.status(500).json({ error: "Failed to get product summary" });
  }
});

router.get("/products", async (req, res) => {
  try {
    const parsed = ListProductsQueryParams.safeParse(req.query);
    const params = parsed.success ? parsed.data : {};
    let rows = await db.select().from(productsTable);
    if (params.category) {
      rows = rows.filter((p) => p.category === params.category);
    }
    if (params.featured !== undefined) {
      rows = rows.filter((p) => p.featured === params.featured);
    }
    res.json(rows.map((p) => ({ ...p, price: Number(p.price), createdAt: p.createdAt.toISOString() })));
  } catch (err) {
    req.log.error({ err }, "Failed to list products");
    res.status(500).json({ error: "Failed to list products" });
  }
});

router.post("/products", async (req, res) => {
  try {
    const body = CreateProductBody.parse(req.body);
    const [product] = await db.insert(productsTable).values({
      ...body,
      price: String(body.price),
    }).returning();
    res.status(201).json({ ...product, price: Number(product.price), createdAt: product.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to create product");
    res.status(400).json({ error: "Failed to create product" });
  }
});

router.get("/products/:id", async (req, res) => {
  try {
    const { id } = GetProductParams.parse({ id: Number(req.params.id) });
    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, id));
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ ...product, price: Number(product.price), createdAt: product.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to get product");
    res.status(500).json({ error: "Failed to get product" });
  }
});

router.patch("/products/:id", async (req, res) => {
  try {
    const { id } = UpdateProductParams.parse({ id: Number(req.params.id) });
    const body = UpdateProductBody.parse(req.body);
    const updateData: Record<string, unknown> = { ...body };
    if (body.price !== undefined) updateData.price = String(body.price);
    const [product] = await db.update(productsTable).set(updateData).where(eq(productsTable.id, id)).returning();
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ ...product, price: Number(product.price), createdAt: product.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to update product");
    res.status(400).json({ error: "Failed to update product" });
  }
});

router.delete("/products/:id", async (req, res) => {
  try {
    const { id } = DeleteProductParams.parse({ id: Number(req.params.id) });
    await db.delete(productsTable).where(eq(productsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete product");
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default router;
