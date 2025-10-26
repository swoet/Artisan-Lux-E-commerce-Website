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
 * Email verification codes for passwordless authentication
 */
export const verificationCodes = pgTable("verification_codes", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 160 }).notNull(),
  code: varchar("code", { length: 6 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").notNull().default(false),
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

// Payment proofs table (already created in main site DB)
export const paymentProofs = pgTable("payment_proofs", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  url: text("url").notNull(),
  paymentMethod: varchar("payment_method", { length: 40 }),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

// Products table (for inventory management)
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull(),
  descriptionRich: text("description_rich"),
  priceDecimal: numeric("price_decimal", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("USD"),
  categoryId: integer("category_id").references(() => categories.id),
  coverImageId: integer("cover_image_id").references(() => mediaAssets.id),
  materials: text("materials").array(),
  tags: text("tags").array(),
  isFeatured: boolean("is_featured").notNull().default(false),
  status: varchar("status", { length: 12 }).$type<"draft" | "published">().notNull().default("draft"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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

// Minimal definitions for cross-app tables
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  cartId: integer("cart_id").notNull(),
  productId: integer("product_id").references(() => categories.id).notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("USD"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const wishlistItems = pgTable("wishlist_items", {
  id: serial("id").primaryKey(),
  wishlistId: integer("wishlist_id").notNull(),
  productId: integer("product_id").references(() => categories.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").references(() => categories.id).notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull(),
});

// ============================================================================
// ARTISAN PORTAL SYSTEM
// ============================================================================

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
    avatarMediaId: integer("avatar_media_id").references(() => mediaAssets.id),
    coverMediaId: integer("cover_media_id").references(() => mediaAssets.id),
    website: varchar("website", { length: 255 }),
    instagram: varchar("instagram", { length: 100 }),
    status: varchar("status", { length: 20 }).$type<"pending" | "active" | "suspended">().notNull().default("pending"),
    emailVerified: boolean("email_verified").default(false).notNull(),
    verificationCode: varchar("verification_code", { length: 6 }),
    verificationCodeExpiresAt: timestamp("verification_code_expires_at"),
    commissionRate: numeric("commission_rate", { precision: 5, scale: 2 }).default("15.00"), // Platform commission %
    totalSales: numeric("total_sales", { precision: 12, scale: 2 }).default("0.00"),
    rating: numeric("rating", { precision: 3, scale: 2 }), // Average rating
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

/**
 * Link products to artisans
 */
export const productArtisans = pgTable("product_artisans", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id).notNull(),
  artisanId: integer("artisan_id").references(() => artisans.id).notNull(),
  role: varchar("role", { length: 20 }).notNull().default("creator"), // creator | collaborator
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================================
// PROVENANCE PASSPORT SYSTEM
// ============================================================================

/**
 * Provenance Passport - Digital identity for each product
 */
export const provenancePassports = pgTable("provenance_passports", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id).notNull(),
  serialNumber: varchar("serial_number", { length: 50 }).notNull(),
  nfcTagId: varchar("nfc_tag_id", { length: 100 }),
  
  // Materials & Origin
  materialsOrigin: text("materials_origin"), // JSON: [{material: "Gold", origin: "Peru", certified: true}]
  sustainabilityCertifications: text("sustainability_certifications").array(),
  carbonFootprint: numeric("carbon_footprint", { precision: 10, scale: 2 }), // kg CO2
  
  // Artisan Story
  artisanNotes: text("artisan_notes"),
  productionDate: timestamp("production_date"),
  productionTimeHours: integer("production_time_hours"),
  
  // Care & Warranty
  careInstructions: text("care_instructions"),
  warrantyYears: integer("warranty_years").default(1),
  warrantyExpiresAt: timestamp("warranty_expires_at"),
  
  // Ownership & Resale
  currentOwnerId: integer("current_owner_id").references(() => customers.id),
  originalPurchaseDate: timestamp("original_purchase_date"),
  resaleEligible: boolean("resale_eligible").default(true),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Ownership Transfer History
 */
export const ownershipHistory = pgTable("ownership_history", {
  id: serial("id").primaryKey(),
  passportId: integer("passport_id").references(() => provenancePassports.id).notNull(),
  fromOwnerId: integer("from_owner_id").references(() => customers.id),
  toOwnerId: integer("to_owner_id").references(() => customers.id).notNull(),
  transferType: varchar("transfer_type", { length: 20 }).notNull(), // purchase | gift | resale
  transferPrice: numeric("transfer_price", { precision: 12, scale: 2 }),
  transferDate: timestamp("transfer_date").defaultNow().notNull(),
});

/**
 * Service History (repairs, maintenance)
 */
export const serviceHistory = pgTable("service_history", {
  id: serial("id").primaryKey(),
  passportId: integer("passport_id").references(() => provenancePassports.id).notNull(),
  serviceType: varchar("service_type", { length: 50 }).notNull(), // repair | cleaning | restoration
  description: text("description"),
  servicedBy: varchar("serviced_by", { length: 200 }),
  cost: numeric("cost", { precision: 12, scale: 2 }),
  serviceDate: timestamp("service_date").defaultNow().notNull(),
});

// ============================================================================
// CUSTOM BUILDER / MADE-TO-ORDER SYSTEM
// ============================================================================

/**
 * Custom Order Requests
 */
export const customOrders = pgTable("custom_orders", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  artisanId: integer("artisan_id").references(() => artisans.id),
  baseProductId: integer("base_product_id").references(() => products.id),
  
  // Customization Details
  customizationData: text("customization_data").notNull(), // JSON: {material: "Gold", size: "M", engraving: "..."}
  customerNotes: text("customer_notes"),
  
  // Pricing
  basePrice: numeric("base_price", { precision: 12, scale: 2 }).notNull(),
  customizationPrice: numeric("customization_price", { precision: 12, scale: 2 }).default("0.00"),
  totalPrice: numeric("total_price", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("USD"),
  
  // Deposit & Payment
  depositRequired: boolean("deposit_required").default(true),
  depositAmount: numeric("deposit_amount", { precision: 12, scale: 2 }),
  depositPaid: boolean("deposit_paid").default(false),
  
  // Timeline
  estimatedLeadTimeDays: integer("estimated_lead_time_days"),
  estimatedCompletionDate: timestamp("estimated_completion_date"),
  actualCompletionDate: timestamp("actual_completion_date"),
  
  // Status
  status: varchar("status", { length: 20 }).$type<"draft" | "quoted" | "approved" | "in_production" | "completed" | "cancelled">().notNull().default("draft"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Production Timeline Stages
 */
export const productionStages = pgTable("production_stages", {
  id: serial("id").primaryKey(),
  customOrderId: integer("custom_order_id").references(() => customOrders.id).notNull(),
  stage: varchar("stage", { length: 50 }).notNull(), // sourced | crafted | finished | qa | shipped
  status: varchar("status", { length: 20 }).$type<"pending" | "in_progress" | "completed">().notNull().default("pending"),
  artisanNotes: text("artisan_notes"),
  photoMediaId: integer("photo_media_id").references(() => mediaAssets.id),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================================
// WAITLIST & LIMITED DROPS SYSTEM
// ============================================================================

/**
 * Product Waitlists
 */
export const waitlists = pgTable("waitlists", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id).notNull(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  priority: integer("priority").default(0), // VIP customers get higher priority
  notified: boolean("notified").default(false),
  notifiedAt: timestamp("notified_at"),
  convertedToOrder: boolean("converted_to_order").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Limited Edition Drops
 */
export const drops = pgTable("drops", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull(),
  description: text("description"),
  productIds: text("product_ids").array(), // Array of product IDs in this drop
  
  // Timing
  announcementDate: timestamp("announcement_date"),
  dropDate: timestamp("drop_date").notNull(),
  endDate: timestamp("end_date"),
  
  // Access Control
  accessType: varchar("access_type", { length: 20 }).$type<"public" | "vip_only" | "waitlist">().notNull().default("public"),
  maxQuantityPerCustomer: integer("max_quantity_per_customer").default(1),
  
  // Status
  status: varchar("status", { length: 20 }).$type<"upcoming" | "live" | "sold_out" | "ended">().notNull().default("upcoming"),
  
  coverMediaId: integer("cover_media_id").references(() => mediaAssets.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Drop Access List (VIP/Waitlist)
 */
export const dropAccessList = pgTable("drop_access_list", {
  id: serial("id").primaryKey(),
  dropId: integer("drop_id").references(() => drops.id).notNull(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  accessGrantedAt: timestamp("access_granted_at").defaultNow().notNull(),
});

// ============================================================================
// CONCIERGE & CLIENTELING SYSTEM
// ============================================================================

/**
 * Concierge Conversations
 */
export const conciergeConversations = pgTable("concierge_conversations", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  assignedAdminId: integer("assigned_admin_id").references(() => admins.id),
  subject: varchar("subject", { length: 255 }),
  status: varchar("status", { length: 20 }).$type<"open" | "in_progress" | "resolved" | "closed">().notNull().default("open"),
  priority: varchar("priority", { length: 20 }).$type<"low" | "medium" | "high" | "urgent">().default("medium"),
  channel: varchar("channel", { length: 20 }).notNull().default("chat"), // chat | whatsapp | email | video
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Concierge Messages
 */
export const conciergeMessages = pgTable("concierge_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => conciergeConversations.id).notNull(),
  senderId: integer("sender_id").notNull(), // customer or admin ID
  senderType: varchar("sender_type", { length: 20 }).notNull(), // customer | admin
  message: text("message").notNull(),
  attachmentMediaId: integer("attachment_media_id").references(() => mediaAssets.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Styling Boards (Curated looks by concierge)
 */
export const stylingBoards = pgTable("styling_boards", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  createdByAdminId: integer("created_by_admin_id").references(() => admins.id).notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  productIds: text("product_ids").array(),
  coverMediaId: integer("cover_media_id").references(() => mediaAssets.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * VIP Tiers / Collector's Circle
 */
export const vipTiers = pgTable("vip_tiers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(), // Bronze, Silver, Gold, Platinum
  minSpend: numeric("min_spend", { precision: 12, scale: 2 }).notNull(),
  benefits: text("benefits").array(), // ["Early access", "Free shipping", "Concierge"]
  discountPercent: numeric("discount_percent", { precision: 5, scale: 2 }).default("0.00"),
  priority: integer("priority").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Customer VIP Status
 */
export const customerVipStatus = pgTable("customer_vip_status", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  tierId: integer("tier_id").references(() => vipTiers.id).notNull(),
  lifetimeSpend: numeric("lifetime_spend", { precision: 12, scale: 2 }).default("0.00"),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================================================
// USER GENERATED CONTENT (UGC) SYSTEM
// ============================================================================

/**
 * User Generated Content
 */
export const userContent = pgTable("user_content", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  productId: integer("product_id").references(() => products.id),
  
  // Content
  mediaId: integer("media_id").references(() => mediaAssets.id).notNull(),
  caption: text("caption"),
  tags: text("tags").array(),
  
  // Moderation
  status: varchar("status", { length: 20 }).$type<"pending" | "approved" | "rejected">().notNull().default("pending"),
  moderatedBy: integer("moderated_by").references(() => admins.id),
  moderatedAt: timestamp("moderated_at"),
  
  // Engagement
  featured: boolean("featured").default(false),
  likes: integer("likes").default(0),
  shoppable: boolean("shoppable").default(false),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * UGC Rewards/Perks
 */
export const ugcRewards = pgTable("ugc_rewards", {
  id: serial("id").primaryKey(),
  contentId: integer("content_id").references(() => userContent.id).notNull(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  rewardType: varchar("reward_type", { length: 50 }).notNull(), // discount | credit | free_shipping
  rewardValue: numeric("reward_value", { precision: 12, scale: 2 }),
  redeemed: boolean("redeemed").default(false),
  redeemedAt: timestamp("redeemed_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================================
// TRADE-IN & BUYBACK SYSTEM
// ============================================================================

/**
 * Trade-In Requests
 */
export const tradeIns = pgTable("trade_ins", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  productId: integer("product_id").references(() => products.id),
  passportId: integer("passport_id").references(() => provenancePassports.id),
  
  // Item Details
  itemDescription: text("item_description").notNull(),
  condition: varchar("condition", { length: 20 }).$type<"excellent" | "good" | "fair" | "poor">().notNull(),
  photoMediaIds: text("photo_media_ids").array(),
  
  // Valuation
  estimatedValue: numeric("estimated_value", { precision: 12, scale: 2 }),
  offeredValue: numeric("offered_value", { precision: 12, scale: 2 }),
  finalValue: numeric("final_value", { precision: 12, scale: 2 }),
  
  // Status
  status: varchar("status", { length: 20 }).$type<"submitted" | "under_review" | "offer_made" | "accepted" | "rejected" | "completed">().notNull().default("submitted"),
  
  // Trade-in or Buyback
  tradeInType: varchar("trade_in_type", { length: 20 }).$type<"trade_in" | "buyback">().notNull(),
  creditAppliedToOrderId: integer("credit_applied_to_order_id").references(() => orders.id),
  
  reviewedBy: integer("reviewed_by").references(() => admins.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================================================
// GIFT & CARE SERVICES
// ============================================================================

/**
 * Gift Options
 */
export const giftOptions = pgTable("gift_options", {
  id: serial("id").primaryKey(),
  orderItemId: integer("order_item_id").notNull(), // References order_items
  giftWrap: boolean("gift_wrap").default(false),
  giftMessage: text("gift_message"),
  recipientName: varchar("recipient_name", { length: 160 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Care & Repair Bookings
 */
export const careBookings = pgTable("care_bookings", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  passportId: integer("passport_id").references(() => provenancePassports.id),
  serviceType: varchar("service_type", { length: 50 }).notNull(), // repair | cleaning | restoration | warranty_claim
  description: text("description"),
  status: varchar("status", { length: 20 }).$type<"requested" | "scheduled" | "in_progress" | "completed" | "cancelled">().notNull().default("requested"),
  scheduledDate: timestamp("scheduled_date"),
  completedDate: timestamp("completed_date"),
  cost: numeric("cost", { precision: 12, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================================================
// SUSTAINABILITY & IMPACT TRACKING
// ============================================================================

/**
 * Impact Causes (for checkout donations)
 */
export const impactCauses = pgTable("impact_causes", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(), // environment | artisan_support | education
  logoMediaId: integer("logo_media_id").references(() => mediaAssets.id),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Customer Impact Contributions
 */
export const impactContributions = pgTable("impact_contributions", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  causeId: integer("cause_id").references(() => impactCauses.id).notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("USD"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
