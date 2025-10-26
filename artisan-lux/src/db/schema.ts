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

// ============================================================================
// ARTISAN PORTAL SYSTEM
// ============================================================================

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
    specialties: text("specialties").array(),
    avatarMediaId: integer("avatar_media_id").references(() => mediaAssets.id),
    coverMediaId: integer("cover_media_id").references(() => mediaAssets.id),
    website: varchar("website", { length: 255 }),
    instagram: varchar("instagram", { length: 100 }),
    status: varchar("status", { length: 20 }).$type<"pending" | "active" | "suspended">().notNull().default("pending"),
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

export const productArtisans = pgTable("product_artisans", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id).notNull(),
  artisanId: integer("artisan_id").references(() => artisans.id).notNull(),
  role: varchar("role", { length: 20 }).notNull().default("creator"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================================
// PROVENANCE PASSPORT SYSTEM
// ============================================================================

export const provenancePassports = pgTable("provenance_passports", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id).notNull(),
  serialNumber: varchar("serial_number", { length: 50 }).notNull(),
  nfcTagId: varchar("nfc_tag_id", { length: 100 }),
  materialsOrigin: text("materials_origin"),
  sustainabilityCertifications: text("sustainability_certifications").array(),
  carbonFootprint: numeric("carbon_footprint", { precision: 10, scale: 2 }),
  artisanNotes: text("artisan_notes"),
  productionDate: timestamp("production_date"),
  productionTimeHours: integer("production_time_hours"),
  careInstructions: text("care_instructions"),
  warrantyYears: integer("warranty_years").default(1),
  warrantyExpiresAt: timestamp("warranty_expires_at"),
  currentOwnerId: integer("current_owner_id").references(() => customers.id),
  originalPurchaseDate: timestamp("original_purchase_date"),
  resaleEligible: boolean("resale_eligible").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const ownershipHistory = pgTable("ownership_history", {
  id: serial("id").primaryKey(),
  passportId: integer("passport_id").references(() => provenancePassports.id).notNull(),
  fromOwnerId: integer("from_owner_id").references(() => customers.id),
  toOwnerId: integer("to_owner_id").references(() => customers.id).notNull(),
  transferType: varchar("transfer_type", { length: 20 }).notNull(),
  transferPrice: numeric("transfer_price", { precision: 12, scale: 2 }),
  transferDate: timestamp("transfer_date").defaultNow().notNull(),
});

export const serviceHistory = pgTable("service_history", {
  id: serial("id").primaryKey(),
  passportId: integer("passport_id").references(() => provenancePassports.id).notNull(),
  serviceType: varchar("service_type", { length: 50 }).notNull(),
  description: text("description"),
  servicedBy: varchar("serviced_by", { length: 200 }),
  cost: numeric("cost", { precision: 12, scale: 2 }),
  serviceDate: timestamp("service_date").defaultNow().notNull(),
});

// ============================================================================
// CUSTOM BUILDER / MADE-TO-ORDER SYSTEM
// ============================================================================

export const customOrders = pgTable("custom_orders", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  artisanId: integer("artisan_id").references(() => artisans.id),
  baseProductId: integer("base_product_id").references(() => products.id),
  customizationData: text("customization_data").notNull(),
  customerNotes: text("customer_notes"),
  basePrice: numeric("base_price", { precision: 12, scale: 2 }).notNull(),
  customizationPrice: numeric("customization_price", { precision: 12, scale: 2 }).default("0.00"),
  totalPrice: numeric("total_price", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("USD"),
  depositRequired: boolean("deposit_required").default(true),
  depositAmount: numeric("deposit_amount", { precision: 12, scale: 2 }),
  depositPaid: boolean("deposit_paid").default(false),
  estimatedLeadTimeDays: integer("estimated_lead_time_days"),
  estimatedCompletionDate: timestamp("estimated_completion_date"),
  actualCompletionDate: timestamp("actual_completion_date"),
  status: varchar("status", { length: 20 }).$type<"draft" | "quoted" | "approved" | "in_production" | "completed" | "cancelled">().notNull().default("draft"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const productionStages = pgTable("production_stages", {
  id: serial("id").primaryKey(),
  customOrderId: integer("custom_order_id").references(() => customOrders.id).notNull(),
  stage: varchar("stage", { length: 50 }).notNull(),
  status: varchar("status", { length: 20 }).$type<"pending" | "in_progress" | "completed">().notNull().default("pending"),
  artisanNotes: text("artisan_notes"),
  photoMediaId: integer("photo_media_id").references(() => mediaAssets.id),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================================
// WAITLIST & LIMITED DROPS SYSTEM
// ============================================================================

export const waitlists = pgTable("waitlists", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id).notNull(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  priority: integer("priority").default(0),
  notified: boolean("notified").default(false),
  notifiedAt: timestamp("notified_at"),
  convertedToOrder: boolean("converted_to_order").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const drops = pgTable("drops", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull(),
  description: text("description"),
  productIds: text("product_ids").array(),
  announcementDate: timestamp("announcement_date"),
  dropDate: timestamp("drop_date").notNull(),
  endDate: timestamp("end_date"),
  accessType: varchar("access_type", { length: 20 }).$type<"public" | "vip_only" | "waitlist">().notNull().default("public"),
  maxQuantityPerCustomer: integer("max_quantity_per_customer").default(1),
  status: varchar("status", { length: 20 }).$type<"upcoming" | "live" | "sold_out" | "ended">().notNull().default("upcoming"),
  coverMediaId: integer("cover_media_id").references(() => mediaAssets.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const dropAccessList = pgTable("drop_access_list", {
  id: serial("id").primaryKey(),
  dropId: integer("drop_id").references(() => drops.id).notNull(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  accessGrantedAt: timestamp("access_granted_at").defaultNow().notNull(),
});

// ============================================================================
// CONCIERGE & CLIENTELING SYSTEM
// ============================================================================

export const conciergeConversations = pgTable("concierge_conversations", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  assignedAdminId: integer("assigned_admin_id").references(() => admins.id),
  subject: varchar("subject", { length: 255 }),
  status: varchar("status", { length: 20 }).$type<"open" | "in_progress" | "resolved" | "closed">().notNull().default("open"),
  priority: varchar("priority", { length: 20 }).$type<"low" | "medium" | "high" | "urgent">().default("medium"),
  channel: varchar("channel", { length: 20 }).notNull().default("chat"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const conciergeMessages = pgTable("concierge_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => conciergeConversations.id).notNull(),
  senderId: integer("sender_id").notNull(),
  senderType: varchar("sender_type", { length: 20 }).notNull(),
  message: text("message").notNull(),
  attachmentMediaId: integer("attachment_media_id").references(() => mediaAssets.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

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

export const vipTiers = pgTable("vip_tiers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  minSpend: numeric("min_spend", { precision: 12, scale: 2 }).notNull(),
  benefits: text("benefits").array(),
  discountPercent: numeric("discount_percent", { precision: 5, scale: 2 }).default("0.00"),
  priority: integer("priority").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

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

export const userContent = pgTable("user_content", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  productId: integer("product_id").references(() => products.id),
  mediaId: integer("media_id").references(() => mediaAssets.id).notNull(),
  caption: text("caption"),
  tags: text("tags").array(),
  status: varchar("status", { length: 20 }).$type<"pending" | "approved" | "rejected">().notNull().default("pending"),
  moderatedBy: integer("moderated_by").references(() => admins.id),
  moderatedAt: timestamp("moderated_at"),
  featured: boolean("featured").default(false),
  likes: integer("likes").default(0),
  shoppable: boolean("shoppable").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const ugcRewards = pgTable("ugc_rewards", {
  id: serial("id").primaryKey(),
  contentId: integer("content_id").references(() => userContent.id).notNull(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  rewardType: varchar("reward_type", { length: 50 }).notNull(),
  rewardValue: numeric("reward_value", { precision: 12, scale: 2 }),
  redeemed: boolean("redeemed").default(false),
  redeemedAt: timestamp("redeemed_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================================
// TRADE-IN & BUYBACK SYSTEM
// ============================================================================

export const tradeIns = pgTable("trade_ins", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  productId: integer("product_id").references(() => products.id),
  passportId: integer("passport_id").references(() => provenancePassports.id),
  itemDescription: text("item_description").notNull(),
  condition: varchar("condition", { length: 20 }).$type<"excellent" | "good" | "fair" | "poor">().notNull(),
  photoMediaIds: text("photo_media_ids").array(),
  estimatedValue: numeric("estimated_value", { precision: 12, scale: 2 }),
  offeredValue: numeric("offered_value", { precision: 12, scale: 2 }),
  finalValue: numeric("final_value", { precision: 12, scale: 2 }),
  status: varchar("status", { length: 20 }).$type<"submitted" | "under_review" | "offer_made" | "accepted" | "rejected" | "completed">().notNull().default("submitted"),
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

export const giftOptions = pgTable("gift_options", {
  id: serial("id").primaryKey(),
  orderItemId: integer("order_item_id").notNull(),
  giftWrap: boolean("gift_wrap").default(false),
  giftMessage: text("gift_message"),
  recipientName: varchar("recipient_name", { length: 160 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const careBookings = pgTable("care_bookings", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  passportId: integer("passport_id").references(() => provenancePassports.id),
  serviceType: varchar("service_type", { length: 50 }).notNull(),
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

export const impactCauses = pgTable("impact_causes", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(),
  logoMediaId: integer("logo_media_id").references(() => mediaAssets.id),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const impactContributions = pgTable("impact_contributions", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  causeId: integer("cause_id").references(() => impactCauses.id).notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("USD"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
