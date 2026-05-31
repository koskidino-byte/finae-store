import { Router } from "express";
import { db } from "@workspace/db";
import { cartItemsTable, productsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  AddCartItemBody,
  UpdateCartItemParams,
  UpdateCartItemBody,
  RemoveCartItemParams,
} from "@workspace/api-zod";

const router = Router();

async function buildCart() {
  const items = await db
    .select()
    .from(cartItemsTable)
    .leftJoin(productsTable, eq(cartItemsTable.productId, productsTable.id));

  const cartItems = items.map((row) => ({
    id: row.cart_items.id,
    productId: row.cart_items.productId,
    quantity: row.cart_items.quantity,
    selectedColor: row.cart_items.selectedColor,
    selectedSize: row.cart_items.selectedSize,
    product: row.products
      ? {
          ...row.products,
          price: Number(row.products.price),
          createdAt: row.products.createdAt.toISOString(),
        }
      : null,
  }));

  const total = cartItems.reduce((sum, item) => {
    return sum + (item.product ? Number(item.product.price) * item.quantity : 0);
  }, 0);

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return { items: cartItems, total, itemCount };
}

router.get("/cart", async (req, res) => {
  try {
    const cart = await buildCart();
    res.json(cart);
  } catch (err) {
    req.log.error({ err }, "Failed to get cart");
    res.status(500).json({ error: "Failed to get cart" });
  }
});

router.post("/cart/items", async (req, res) => {
  try {
    const body = AddCartItemBody.parse(req.body);
    const existing = await db
      .select()
      .from(cartItemsTable)
      .where(eq(cartItemsTable.productId, body.productId));

    const matchingItem = existing.find(
      (i) =>
        i.selectedColor === (body.selectedColor ?? null) &&
        i.selectedSize === (body.selectedSize ?? null)
    );

    if (matchingItem) {
      await db
        .update(cartItemsTable)
        .set({ quantity: matchingItem.quantity + body.quantity })
        .where(eq(cartItemsTable.id, matchingItem.id));
    } else {
      await db.insert(cartItemsTable).values({
        productId: body.productId,
        quantity: body.quantity,
        selectedColor: body.selectedColor ?? null,
        selectedSize: body.selectedSize ?? null,
      });
    }

    const cart = await buildCart();
    res.status(201).json(cart);
  } catch (err) {
    req.log.error({ err }, "Failed to add cart item");
    res.status(400).json({ error: "Failed to add cart item" });
  }
});

router.patch("/cart/items/:id", async (req, res) => {
  try {
    const { id } = UpdateCartItemParams.parse({ id: Number(req.params.id) });
    const body = UpdateCartItemBody.parse(req.body);
    if (body.quantity <= 0) {
      await db.delete(cartItemsTable).where(eq(cartItemsTable.id, id));
    } else {
      await db.update(cartItemsTable).set({ quantity: body.quantity }).where(eq(cartItemsTable.id, id));
    }
    const cart = await buildCart();
    res.json(cart);
  } catch (err) {
    req.log.error({ err }, "Failed to update cart item");
    res.status(400).json({ error: "Failed to update cart item" });
  }
});

router.delete("/cart/items/:id", async (req, res) => {
  try {
    const { id } = RemoveCartItemParams.parse({ id: Number(req.params.id) });
    await db.delete(cartItemsTable).where(eq(cartItemsTable.id, id));
    const cart = await buildCart();
    res.json(cart);
  } catch (err) {
    req.log.error({ err }, "Failed to remove cart item");
    res.status(500).json({ error: "Failed to remove cart item" });
  }
});

router.delete("/cart/clear", async (req, res) => {
  try {
    await db.delete(cartItemsTable);
    const cart = await buildCart();
    res.json(cart);
  } catch (err) {
    req.log.error({ err }, "Failed to clear cart");
    res.status(500).json({ error: "Failed to clear cart" });
  }
});

export default router;
