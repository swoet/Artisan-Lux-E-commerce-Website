import {
  pgTable,
  serial,
  integer,
  text,
  varchar,
  boolean,
  numeric,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const mediaAssets = pgTable("media_assets", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 16 }).notNull(), // image | video | model3d
  url: text("url").notNull(),
  width: integer("width"),
  height: integer("height"),
  filesize: integer("filesize"),
  format: varchar("format", { length: 16 }),
  altText: text("alt_text"),
  dominantColor: varchar("dominant_color", { length: 16 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categories = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    slug: varchar("slug", { length: 160 }).notNull(),
    description: text("description"),
    heroMediaId: integer("hero_media_id").references(() => mediaAssets.id),
    parentCategoryId: integer("parent_category_id"),
    order: integer("order_index").default(0).notNull(),
    status: varchar("status", { length: 12 }).$type<"draft" | "published">().notNull().default("draft"),
    seoTitle: varchar("seo_title", { length: 160 }),
    seoDescription: varchar("seo_description", { length: 160 }),
    minPrice: numeric("min_price", { precision: 12, scale: 2 }),
    maxPrice: numeric("max_price", { precision: 12, scale: 2 }),
    taxonomyKey: varchar("taxonomy_key", { length: 200 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    slugUnique: uniqueIndex("categories_slug_unique").on(table.slug),
  })
);

export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 200 }).notNull(),
    subtitle: varchar("subtitle", { length: 200 }),
    descriptionRich: text("description_rich"),
    materials: text("materials").array(),
    priceDecimal: numeric("price_decimal", { precision: 12, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    categoryId: integer("category_id").references(() => categories.id),
    subcategoryId: integer("subcategory_id"),
    tags: text("tags").array(),
    status: varchar("status", { length: 12 }).$type<"draft" | "published">().notNull().default("draft"),
    isFeatured: boolean("is_featured").notNull().default(false),
    order: integer("order_index").default(0).notNull(),
    seoTitle: varchar("seo_title", { length: 160 }),
    seoDescription: varchar("seo_description", { length: 160 }),
    coverImageId: integer("cover_image_id").references(() => mediaAssets.id),
    model3dAssetId: integer("model3d_asset_id").references(() => mediaAssets.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    slugUnique: uniqueIndex("products_slug_unique").on(table.slug),
  })
);

export const admins = pgTable(
  "admins",
  {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 160 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    role: varchar("role", { length: 20 }).notNull().default("admin"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    emailUnique: uniqueIndex("admins_email_unique").on(table.email),
  })
);

export const sessions = pgTable(
  "sessions",
  {
    id: serial("id").primaryKey(),
    adminId: integer("admin_id").references(() => admins.id).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    tokenUnique: uniqueIndex("sessions_token_unique").on(table.token),
  })
);

// Shopping cart & orders
export const carts = pgTable(
  "carts",
  {
    id: serial("id").primaryKey(),
    // anonymous cart token stored in cookie
    sessionToken: varchar("session_token", { length: 255 }).notNull(),
    email: varchar("email", { length: 160 }),
    status: varchar("status", { length: 20 }).$type<"open" | "converted" | "abandoned">().notNull().default("open"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    sessionUnique: uniqueIndex("carts_session_unique").on(table.sessionToken),
  })
);

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  cartId: integer("cart_id").references(() => carts.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("USD"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  cartId: integer("cart_id").references(() => carts.id),
  email: varchar("email", { length: 160 }).notNull(),
  total: numeric("total", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("USD"),
  status: varchar("status", { length: 20 }).$type<"pending" | "paid" | "failed">().notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  provider: varchar("provider", { length: 40 }).notNull(), // e.g. stripe
  providerSessionId: varchar("provider_session_id", { length: 255 }).notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull(),
  status: varchar("status", { length: 20 }).$type<"pending" | "succeeded" | "failed">().notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
