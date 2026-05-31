import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable, orderItemsTable, cartItemsTable, productsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  CreateOrderBody,
  GetOrderParams,
} from "@workspace/api-zod";
import { klaviyoTrackEvent } from "../lib/klaviyo";

const router = Router();

async function buildOrder(orderId: number) {
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId));
  if (!order) return null;
  const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, orderId));
  return {
    ...order,
    total: Number(order.total),
    createdAt: order.createdAt.toISOString(),
    items: items.map((i) => ({ ...i, price: Number(i.price) })),
  };
}

router.get("/orders", async (req, res) => {
  try {
    const orders = await db.select().from(ordersTable).orderBy(ordersTable.createdAt);
    const result = await Promise.all(orders.map((o) => buildOrder(o.id)));
    res.json(result.filter(Boolean));
  } catch (err) {
    req.log.error({ err }, "Failed to list orders");
    res.status(500).json({ error: "Failed to list orders" });
  }
});

router.post("/orders", async (req, res) => {
  try {
    const body = CreateOrderBody.parse(req.body);

    const cartItems = await db
      .select()
      .from(cartItemsTable)
      .leftJoin(productsTable, eq(cartItemsTable.productId, productsTable.id));

    if (cartItems.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const total = cartItems.reduce((sum, row) => {
      return sum + (row.products ? Number(row.products.price) * row.cart_items.quantity : 0);
    }, 0);

    const [order] = await db.insert(ordersTable).values({
      ...body,
      total: String(total),
      status: "pending",
    }).returning();

    for (const row of cartItems) {
      if (!row.products) continue;
      await db.insert(orderItemsTable).values({
        orderId: order.id,
        productId: row.cart_items.productId,
        quantity: row.cart_items.quantity,
        price: row.products.price,
        productName: row.products.name,
        selectedColor: row.cart_items.selectedColor,
        selectedSize: row.cart_items.selectedSize,
      });
    }

    await db.delete(cartItemsTable);

    const result = await buildOrder(order.id);

    klaviyoTrackEvent(body.customerEmail, "Placed Order", {
      orderId: order.id,
      total,
      customerName: body.customerName,
      shippingAddress: body.shippingAddress,
      items: cartItems
        .filter((r) => r.products)
        .map((r) => ({
          name: r.products!.name,
          quantity: r.cart_items.quantity,
          price: Number(r.products!.price),
        })),
    }).catch(() => {});

    res.status(201).json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to create order");
    res.status(400).json({ error: "Failed to create order" });
  }
});

router.get("/orders/:id", async (req, res) => {
  try {
    const { id } = GetOrderParams.parse({ id: Number(req.params.id) });
    const order = await buildOrder(id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    req.log.error({ err }, "Failed to get order");
    res.status(500).json({ error: "Failed to get order" });
  }
});

router.patch("/orders/:id/ship", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [order] = await db
      .update(ordersTable)
      .set({ status: "shipped" })
      .where(eq(ordersTable.id, id))
      .returning();

    if (!order) return res.status(404).json({ error: "Order not found" });

    const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, id));

    klaviyoTrackEvent(order.customerEmail, "Fulfilled Order", {
      orderId: order.id,
      total: Number(order.total),
      customerName: order.customerName,
      shippingAddress: order.shippingAddress,
      items: items.map((i) => ({
        name: i.productName,
        quantity: i.quantity,
        price: Number(i.price),
      })),
    }).catch(() => {});

    res.json({ success: true, status: "shipped" });
  } catch (err) {
    req.log.error({ err }, "Failed to ship order");
    res.status(500).json({ error: "Failed to ship order" });
  }
});

export default router;
