import { z } from 'zod';

export const DealCategorySchema = z.enum(['rabatt', 'mat', 'teknik', 'sport', 'övrigt']);
export type DealCategory = z.infer<typeof DealCategorySchema>;

export const DealSchema = z.object({
  id: z.string(),
  company: z.string().min(1),
  logoUrl: z.string().url().optional().or(z.literal('')),
  title: z.string().min(1),
  titleEn: z.string().optional(),
  description: z.string().min(1),
  descriptionEn: z.string().optional(),
  category: DealCategorySchema,
  link: z.string().url().optional().or(z.literal('')),
  discountCode: z.string().optional(),
  discount: z.string().optional(),
  published: z.boolean(),
  createdAt: z.string(),
});

export type TKLDeal = z.infer<typeof DealSchema>;

// Admin form schema — utan id och createdAt
export const DealFormSchema = DealSchema.omit({ id: true, createdAt: true });
export type DealFormData = z.infer<typeof DealFormSchema>;
