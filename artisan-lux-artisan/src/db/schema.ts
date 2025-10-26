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
