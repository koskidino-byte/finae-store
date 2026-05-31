import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const settingsTable = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Setting = typeof settingsTable.$inferSelect;

export const DEFAULT_SETTINGS: Record<string, string> = {
  store_name: "FINAE",
  store_tagline: "Everyday essentials made to feel luxurious. Crafted for a slower, more intentional way of living.",
  hero_title: "Home goods for a slower pace.",
  hero_subtitle: "Premium pillowcases, sheets, towels, and socks — crafted to last, designed to feel exceptional.",
  free_shipping_min: "75",
  currency_symbol: "€",
  contact_email: "",
  primary_color: "#c9a84c",
  announcement: "",
};
