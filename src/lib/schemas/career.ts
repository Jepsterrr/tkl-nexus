import { z } from 'zod';

export const CareerTypeSchema = z.enum(['exjobb', 'jobb', 'sommarjobb', 'praktik', 'trainee']);
export type CareerType = z.infer<typeof CareerTypeSchema>;

// Företag vs myndighet/institut (FOI, RISE m.fl.)
export const OrgTypeSchema = z.enum(['company', 'public']);
export type OrgType = z.infer<typeof OrgTypeSchema>;

export const CareerSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(120),
  titleEn: z.string().max(120).optional(),
  company: z.string().min(1).max(120),
  type: CareerTypeSchema,
  orgType: OrgTypeSchema.optional(), // saknas = company
  location: z.string().min(1).max(120),
  description: z.string().max(2000).optional(),
  descriptionEn: z.string().max(2000).optional(),
  requirements: z.string().max(2000).optional(), // "kompletterande kunskap"
  requirementsEn: z.string().max(2000).optional(),
  studentTask: z.string().max(2000).optional(), // endast exjobb
  studentTaskEn: z.string().max(2000).optional(),
  contactName: z.string().max(120).optional(),
  contactEmail: z.string().trim().email('Ogiltig e-postadress').max(160).optional().or(z.literal('')),
  startDate: z.string().max(120).optional(),
  startDateEn: z.string().max(120).optional(),
  deadline: z.string().datetime({ offset: true }),
  // Renderas i href — enbart http(s) (z.string().url() godkänner javascript:)
  applyUrl: z.string().url().refine(
    v => /^https?:\/\//i.test(v),
    { message: 'URL måste börja med https://' }
  ).optional().or(z.literal('')),
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
  orgType: OrgTypeSchema.optional(),
  location: z.string().default(''),
  description: z.string().optional(),
  descriptionEn: z.string().optional(),
  requirements: z.string().optional(),
  requirementsEn: z.string().optional(),
  studentTask: z.string().optional(),
  studentTaskEn: z.string().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().optional(),
  startDate: z.string().optional(),
  startDateEn: z.string().optional(),
  deadline: z.string(),
  applyUrl: z.string().optional(),
  published: z.boolean().default(false),
  createdAt: z.string(),
});
