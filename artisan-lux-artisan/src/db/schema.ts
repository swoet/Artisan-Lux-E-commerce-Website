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

/**
 * Artisans - Creators who make products
 */
export const artisans = pgTable(
  "artisans",
  {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 160 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    name: varchar("name", { length: 160 }).notNull(),
    slug: varchar("slug", { length: 200 }).notNull(),
    bio: text("bio"),
    bioRich: text("bio_rich"),
    studioName: varchar("studio_name", { length: 200 }),
    studioLocation: varchar("studio_location", { length: 200 }),
    specialties: text("specialties").array(), // ["Jewelry", "Ceramics"]
    avatarMediaId: integer("avatar_media_id"),
    coverMediaId: integer("cover_media_id"),
    website: varchar("website", { length: 255 }),
    instagram: varchar("instagram", { length: 100 }),
    status: varchar("status", { length: 20 }).$type<"pending" | "active" | "suspended">().notNull().default("pending"),
    emailVerified: boolean("email_verified").default(false).notNull(),
    verificationCode: varchar("verification_code", { length: 6 }),
    verificationCodeExpiresAt: timestamp("verification_code_expires_at"),
    commissionRate: numeric("commission_rate", { precision: 5, scale: 2 }).default("15.00"),
    totalSales: numeric("total_sales", { precision: 12, scale: 2 }).default("0.00"),
    rating: numeric("rating", { precision: 3, scale: 2 }),
    reviewCount: integer("review_count").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    emailUnique: uniqueIndex("artisans_email_unique").on(table.email),
    slugUnique: uniqueIndex("artisans_slug_unique").on(table.slug),
  })
);

/**
 * Artisan Sessions
 */
export const artisanSessions = pgTable(
  "artisan_sessions",
  {
    id: serial("id").primaryKey(),
    artisanId: integer("artisan_id").references(() => artisans.id).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    tokenUnique: uniqueIndex("artisan_sessions_token_unique").on(table.token),
  })
);

// Minimal shared tables referenced by the portal
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 160 }).notNull(),
  name: varchar("name", { length: 160 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const mediaAssets = pgTable("media_assets", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 16 }).notNull(), // image | video | model3d
  url: text("url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  slug: varchar("slug", { length: 160 }).notNull(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull(),
  descriptionRich: text("description_rich"),
  priceDecimal: numeric("price_decimal", { precision: 12, scale: 2 }).notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  coverImageId: integer("cover_image_id").references(() => mediaAssets.id),
  status: varchar("status", { length: 16 }).$type<"draft" | "published" | "active">().notNull().default("draft"),
  isFeatured: boolean("is_featured").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const productArtisans = pgTable("product_artisans", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id).notNull(),
  artisanId: integer("artisan_id").references(() => artisans.id).notNull(),
  role: varchar("role", { length: 20 }).notNull().default("creator"),
  commissionRate: integer("commission_rate").default(70),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const productGallery = pgTable("product_gallery", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id).notNull(),
  mediaId: integer("media_id").references(() => mediaAssets.id).notNull(),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const provenancePassports = pgTable("provenance_passports", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id).notNull(),
  serialNumber: varchar("serial_number", { length: 50 }).notNull(),
  materialsOrigin: text("materials_origin"),
  artisanNotes: text("artisan_notes"),
  productionTimeHours: integer("production_time_hours"),
  careInstructions: text("care_instructions"),
  carbonFootprint: numeric("carbon_footprint", { precision: 10, scale: 2 }),
  sustainabilityCertifications: text("sustainability_certifications").array(),
  warrantyYears: integer("warranty_years").default(1),
  resaleEligible: boolean("resale_eligible").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantityInStock: integer("quantity_in_stock").notNull().default(0),
  lowStockThreshold: integer("low_stock_threshold").notNull().default(5),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  total: numeric("total", { precision: 12, scale: 2 }).notNull().default("0.00"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
});

// Custom orders used in the portal
export const customOrders = pgTable("custom_orders", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id),
  artisanId: integer("artisan_id").references(() => artisans.id),
  baseProductId: integer("base_product_id").references(() => products.id),
  customizationData: text("customization_data"),
  customerNotes: text("customer_notes"),
  basePrice: numeric("base_price", { precision: 12, scale: 2 }),
  customizationPrice: numeric("customization_price", { precision: 12, scale: 2 }),
  totalPrice: numeric("total_price", { precision: 12, scale: 2 }),
  currency: varchar("currency", { length: 3 }),
  depositRequired: boolean("deposit_required"),
  depositAmount: numeric("deposit_amount", { precision: 12, scale: 2 }),
  depositPaid: boolean("deposit_paid"),
  estimatedLeadTimeDays: integer("estimated_lead_time_days"),
  estimatedCompletionDate: timestamp("estimated_completion_date"),
  actualCompletionDate: timestamp("actual_completion_date"),
  status: varchar("status", { length: 20 }).$type<
    | "draft"
    | "quoted"
    | "approved"
    | "in_production"
    | "completed"
    | "cancelled"
  >(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const productionStages = pgTable("production_stages", {
  id: serial("id").primaryKey(),
  customOrderId: integer("custom_order_id").references(() => customOrders.id).notNull(),
  stage: varchar("stage", { length: 50 }).notNull(),
  status: varchar("status", { length: 20 }),
  artisanNotes: text("artisan_notes"),
  photoMediaId: integer("photo_media_id"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
