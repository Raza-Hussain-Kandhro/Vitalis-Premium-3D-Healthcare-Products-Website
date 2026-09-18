/** Zod validation schemas shared by the API routes (mirrors client-side rules). */

import { z } from 'zod'

const email = z.string().trim().min(5).max(255).email('Enter a valid email address.')
const phone = z
  .string()
  .trim()
  .regex(/^[+()\d][\d\s()-]{6,19}$/, 'Enter a valid phone number.')

export const enquirySchema = z.object({
  fullName: z.string().trim().min(2, 'Please enter your full name.').max(160),
  email,
  phone: phone.optional(),
  organization: z.string().trim().max(160).optional(),
  interest: z.string().trim().max(80).optional(),
  message: z.string().trim().min(10, 'Tell us a little more.').max(2000),
})

export const appointmentSchema = enquirySchema.extend({
  phone,
  preferredDate: z.coerce.date().refine((d) => d.getTime() >= Date.now() - 86_400_000, {
    message: 'Pick today or a future date.',
  }),
  message: z.string().trim().max(2000).optional(),
})

export const waitlistSchema = z.object({
  email,
  source: z.string().trim().max(60).optional(),
})

export const registerSchema = z.object({
  email,
  password: z.string().min(8, 'Use at least 8 characters.').max(128),
  fullName: z.string().trim().min(2).max(160),
  organization: z.string().trim().max(160).optional(),
  registrationId: z.string().trim().max(40).optional(),
})

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required.'),
})

export const recordCreateSchema = z.object({
  title: z.string().trim().min(1, 'Title is required.').max(200),
  metadata: z.record(z.any()).optional(),
  status: z.enum(['active', 'archived', 'draft']).optional(),
})

export const recordUpdateSchema = recordCreateSchema.partial().refine((v) => Object.keys(v).length > 0, {
  message: 'Provide at least one field to update.',
})

export const productQuerySchema = z.object({
  category: z.enum(['monitoring', 'diagnostics', 'respiratory', 'recovery', 'consumables']).optional(),
  search: z.string().trim().max(120).optional(),
  limit: z.coerce.number().int().min(1).max(60).optional(),
})

export const galleryQuerySchema = z.object({
  category: z.enum(['facility', 'product', 'deployment', 'team']).optional(),
})


export const productCreateSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, 'Slug is required.')
    .max(120)
    .regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers, and hyphens only.'),
  name: z.string().trim().min(1, 'Name is required.').max(160),
  category: z.enum(['monitoring', 'diagnostics', 'respiratory', 'recovery', 'consumables']),
  shortDescription: z.string().trim().min(1, 'Short description is required.').max(500),
  description: z.string().trim().max(4000).optional(),
  price: z.coerce.number().positive('Price must be greater than 0.'),
  currency: z.string().trim().length(3).optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
  badge: z.string().trim().max(40).optional(),
  certifications: z.array(z.string()).optional(),
  specs: z.record(z.any()).optional(),
  imageUrl: z.union([z.string().trim().url(), z.literal('')]).optional(),
  inStock: z.coerce.boolean().optional(),
  sortOrder: z.coerce.number().int().optional(),
})

export const productUpdateSchema = productCreateSchema
  .partial()
  .refine((v) => Object.keys(v).length > 0, { message: 'Provide at least one field to update.' })

export const galleryCreateSchema = z.object({
  title: z.string().trim().min(1, 'Title is required.').max(160),
  caption: z.string().trim().max(500).optional(),
  category: z.enum(['facility', 'product', 'deployment', 'team']),
  imageUrl: z.union([z.string().trim().url(), z.literal('')]).optional(),
  tone: z.string().trim().max(120).optional(),
  sortOrder: z.coerce.number().int().optional(),
})

export const galleryUpdateSchema = galleryCreateSchema
  .partial()
  .refine((v) => Object.keys(v).length > 0, { message: 'Provide at least one field to update.' })

  export const enquiryStatusSchema = z.object({
  status: z.enum(['new', 'in_review', 'responded', 'closed']),
})

export const appointmentStatusSchema = z.object({
  status: z.enum(['requested', 'confirmed', 'completed', 'cancelled']),
})