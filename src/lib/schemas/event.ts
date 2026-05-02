import { z } from 'zod';

// Section enum
export const SectionSchema = z.enum(['data', 'geo', 'i', 'maskin', 'general']);
export type Section = z.infer<typeof SectionSchema>;

// Firestore Event schema (client-side shape)
export const EventSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(120),
  titleEn: z.string().max(120).optional(),
  description: z.string().max(2000),
  descriptionEn: z.string().max(2000).optional(),
  date: z.string().datetime({ offset: true }),
  endDate: z.string().datetime({ offset: true }),
  location: z.string().min(1).max(120),
  imageUrl: z.string().url().optional().or(z.literal('')),
  tags: z.array(z.string()).default([]),
  section: SectionSchema,
  published: z.boolean(),
  createdAt: z.string().datetime({ offset: true }),
});

export type TKLEvent = z.infer<typeof EventSchema>;

// Admin form schema — samma som EventSchema men utan id och createdAt
export const EventFormSchema = EventSchema.omit({ id: true, createdAt: true });
export type EventFormData = z.infer<typeof EventFormSchema>;

// Raw Firestore document shape (before parsing)
export const FirestoreEventDocSchema = z.object({
  id: z.string(),
  title: z.string(),
  titleEn: z.string().optional(),
  description: z.string().default(''),
  descriptionEn: z.string().optional(),
  date: z.string(),
  endDate: z.string(),
  location: z.string().default(''),
  imageUrl: z.string().optional(),
  tags: z.array(z.string()).default([]),
  section: SectionSchema.default('general'),
  published: z.boolean().default(false),
  createdAt: z.string(),
});
