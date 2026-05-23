import { z } from 'zod';

export const TKLProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  nameEn: z.string(),
  description: z.string(),
  descriptionEn: z.string(),
  category: z.enum(['activities', 'services', 'marketing']),
  highlights: z.array(z.string()),
  highlightsEn: z.array(z.string()),
  price: z.string(),
  priceEn: z.string(),
  order: z.number(),
  published: z.boolean(),
  createdAt: z.string().optional(),
});

export type TKLProduct = z.infer<typeof TKLProductSchema>;

export const TKLProductFormSchema = TKLProductSchema.omit({ id: true, createdAt: true });
export type TKLProductFormData = z.infer<typeof TKLProductFormSchema>;
