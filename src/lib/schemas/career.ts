import { z } from 'zod';

export const CareerTypeSchema = z.enum(['exjobb', 'jobb', 'praktik', 'trainee']);
export type CareerType = z.infer<typeof CareerTypeSchema>;

export const CareerSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(120),
  titleEn: z.string().max(120).optional(),
  company: z.string().min(1).max(120),
  type: CareerTypeSchema,
  location: z.string().min(1).max(120),
  description: z.string().max(2000).optional(),
  descriptionEn: z.string().max(2000).optional(),
  startDate: z.string().max(120).optional(),
  startDateEn: z.string().max(120).optional(),
  deadline: z.string().datetime({ offset: true }),
  applyUrl: z.string().url().optional().or(z.literal('')),
  published: z.boolean().default(false),
  createdAt: z.string().datetime({ offset: true }),
});

export type TKLCareer = z.infer<typeof CareerSchema>;

// Admin form schema — utan id och createdAt
export const CareerFormSchema = CareerSchema.omit({ id: true, createdAt: true });
export type CareerFormData = z.infer<typeof CareerFormSchema>;

export const FirestoreCareerDocSchema = z.object({
  id: z.string(),
  title: z.string(),
  titleEn: z.string().optional(),
  company: z.string(),
  type: CareerTypeSchema.default('jobb'),
  location: z.string().default(''),
  description: z.string().optional(),
  descriptionEn: z.string().optional(),
  startDate: z.string().optional(),
  startDateEn: z.string().optional(),
  deadline: z.string(),
  applyUrl: z.string().optional(),
  published: z.boolean().default(false),
  createdAt: z.string(),
});
