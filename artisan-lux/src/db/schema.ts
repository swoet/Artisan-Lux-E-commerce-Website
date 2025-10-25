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
    descriptionRich: text("description_rich"),
    heroMediaId: integer("hero_media_id").references(() => mediaAssets.id),
    parentCategoryId: integer("parent_category_id"),
    order: integer("order_index").default(0).notNull(),
    status: varchar("status", { length: 12 }).$type<"draft" | "published">().notNull().default("draft"),
    seoTitle: varchar("seo_title", { length: 160 }),
    seoDescription: varchar("seo_description", { length: 160 }),
    // Product-like fields merged in
    priceDecimal: numeric("price_decimal", { precision: 12, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("USD"),
    coverImageId: integer("cover_image_id").references(() => mediaAssets.id),
    videoAssetId: integer("video_asset_id").references(() => mediaAssets.id),
    model3dAssetId: integer("model3d_asset_id").references(() => mediaAssets.id),
    isFeatured: boolean("is_featured").notNull().default(false),
    materials: text("materials").array(),
    tags: text("tags").array(),
    // Price range fields (for parent categories)
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
  productId: integer("product_id").references(() => categories.id).notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("USD"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const customers = pgTable(
  "customers",
  {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 160 }).notNull(),
    name: varchar("name", { length: 160 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    emailUnique: uniqueIndex("customers_email_unique").on(table.email),
  })
);

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id),
  total: numeric("total", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("USD"),
  status: varchar("status", { length: 16 }).notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  productId: integer("product_id").references(() => categories.id).notNull(),
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

// Payment proofs (manual/offline payments)
export const paymentProofs = pgTable("payment_proofs", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  url: text("url").notNull(),
  paymentMethod: varchar("payment_method", { length: 40 }),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

// Wishlist
export const wishlists = pgTable(
  "wishlists",
  {
    id: serial("id").primaryKey(),
    sessionToken: varchar("session_token", { length: 255 }).notNull(),
    email: varchar("email", { length: 160 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    sessionUnique: uniqueIndex("wishlists_session_unique").on(table.sessionToken),
  })
);

export const wishlistItems = pgTable("wishlist_items", {
  id: serial("id").primaryKey(),
  wishlistId: integer("wishlist_id").references(() => wishlists.id).notNull(),
  productId: integer("product_id").references(() => categories.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Inventory Management
export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantityInStock: integer("quantity_in_stock").notNull().default(0),
  lowStockThreshold: integer("low_stock_threshold").notNull().default(5),
  lastRestockedAt: timestamp("last_restocked_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const inventoryHistory = pgTable("inventory_history", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantityChange: integer("quantity_change").notNull(), // +5 for restock, -1 for sale
  reason: varchar("reason", { length: 50 }).notNull(), // restock, sale, adjustment
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
