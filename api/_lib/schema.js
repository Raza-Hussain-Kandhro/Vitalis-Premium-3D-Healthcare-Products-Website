/**
 * Drizzle ORM schema — single source of truth for the PostgreSQL database.
 * Mirrors db/schema.sql. Run `npm run db:push` to sync.
 */

import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'

/* ---------------------------- enums ---------------------------- */

export const userRole = pgEnum('user_role', ['admin', 'staff', 'user'])
export const productCategory = pgEnum('product_category', [
  'monitoring',
  'diagnostics',
  'respiratory',
  'recovery',
  'consumables',
])
export const enquiryStatus = pgEnum('enquiry_status', ['new', 'in_review', 'responded', 'closed'])
export const appointmentStatus = pgEnum('appointment_status', ['requested', 'confirmed', 'completed', 'cancelled'])
export const galleryCategory = pgEnum('gallery_category', ['facility', 'product', 'deployment', 'team'])

/* ---------------------------- tables ---------------------------- */

export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    role: userRole('role').default('user').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({ emailIdx: uniqueIndex('users_email_idx').on(t.email) }),
)

export const profiles = pgTable('profiles', {
  id: uuid('id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  fullName: varchar('full_name', { length: 160 }).notNull(),
  registrationId: varchar('registration_id', { length: 40 }).unique(),
  organization: varchar('organization', { length: 160 }),
  phone: varchar('phone', { length: 32 }),
  avatarUrl: text('avatar_url'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const products = pgTable(
  'products',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: varchar('slug', { length: 120 }).notNull().unique(),
    name: varchar('name', { length: 160 }).notNull(),
    category: productCategory('category').notNull(),
    shortDescription: text('short_description').notNull(),
    description: text('description'),
    price: numeric('price', { precision: 10, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 3 }).default('USD').notNull(),
    rating: numeric('rating', { precision: 2, scale: 1 }).default('4.8'),
    badge: varchar('badge', { length: 40 }),
    certifications: jsonb('certifications').default([]).notNull(),
    specs: jsonb('specs').default({}).notNull(),
    imageUrl: text('image_url'), // external object storage (Vercel Blob / S3)
    inStock: boolean('in_stock').default(true).notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    categoryIdx: index('products_category_idx').on(t.category),
    slugIdx: uniqueIndex('products_slug_idx').on(t.slug),
  }),
)

export const galleryItems = pgTable(
  'gallery_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    title: varchar('title', { length: 160 }).notNull(),
    caption: text('caption'),
    category: galleryCategory('category').notNull(),
    imageUrl: text('image_url'), // external object storage only
    tone: varchar('tone', { length: 120 }), // CSS gradient fallback
    sortOrder: integer('sort_order').default(0).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({ categoryIdx: index('gallery_category_idx').on(t.category) }),
)

export const enquiries = pgTable(
  'enquiries',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    fullName: varchar('full_name', { length: 160 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 32 }),
    organization: varchar('organization', { length: 160 }),
    interest: varchar('interest', { length: 80 }),
    message: text('message').notNull(),
    status: enquiryStatus('status').default('new').notNull(),
    sourceIp: varchar('source_ip', { length: 64 }),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({ createdIdx: index('enquiries_created_idx').on(t.createdAt) }),
)

export const appointments = pgTable(
  'appointments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    fullName: varchar('full_name', { length: 160 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 32 }).notNull(),
    organization: varchar('organization', { length: 160 }),
    interest: varchar('interest', { length: 80 }),
    preferredDate: timestamp('preferred_date', { withTimezone: true }).notNull(),
    message: text('message'),
    status: appointmentStatus('status').default('requested').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({ dateIdx: index('appointments_date_idx').on(t.preferredDate) }),
)

export const waitlist = pgTable('waitlist', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  source: varchar('source', { length: 60 }).default('home-cta').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

/** Core domain entity from the original TRD (private, per-user records). */
export const appRecords = pgTable(
  'app_records',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 200 }).notNull(),
    metadata: jsonb('metadata').default({}).notNull(),
    status: varchar('status', { length: 40 }).default('active').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({ userIdx: index('app_records_user_idx').on(t.userId) }),
)
