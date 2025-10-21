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

// Links multiple media assets to a category (product) for galleries/videos
export const categoryMediaLinks = pgTable("category_media_links", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  mediaId: integer("media_id").references(() => mediaAssets.id).notNull(),
  role: varchar("role", { length: 12 }).notNull().default("gallery"), // cover | gallery | video
  order: integer("order_index").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Products table removed - all functionality merged into categories

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

/**
 * Customers (end-users)
 */
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

/**
 * Authentication events (register/login) for customers
 */
export const authEvents = pgTable("auth_events", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id),
  type: varchar("type", { length: 16 }).$type<"register" | "login">().notNull(),
  ip: varchar("ip", { length: 64 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Page views (for analytics & map)
 */
export const pageViews = pgTable(
  "page_views",
  {
    id: serial("id").primaryKey(),
    path: text("path").notNull(),
    referrer: text("referrer"),
    country: varchar("country", { length: 2 }),
    region: varchar("region", { length: 80 }),
    city: varchar("city", { length: 120 }),
    lat: numeric("lat", { precision: 9, scale: 6 }),
    lon: numeric("lon", { precision: 9, scale: 6 }),
    ip: varchar("ip", { length: 64 }),
    userAgent: text("user_agent"),
    sessionId: varchar("session_id", { length: 64 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    createdAtIdx: uniqueIndex("page_views_created_at_path").on(table.createdAt, table.path),
  })
);

/**
 * Orders & payments
 */
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id),
  total: numeric("total", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("USD"),
  status: varchar("status", { length: 16 }).$type<"pending" | "paid" | "failed" | "refunded">().notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  provider: varchar("provider", { length: 24 }).notNull(),
  providerSessionId: varchar("provider_session_id", { length: 128 }),
  providerIntentId: varchar("provider_intent_id", { length: 128 }),
  status: varchar("status", { length: 16 }).$type<"created" | "requires_action" | "succeeded" | "failed">().notNull().default("created"),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("USD"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
