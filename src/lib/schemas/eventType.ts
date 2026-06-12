import { z } from 'zod';

export const EventTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
  // EN-fält optional med default — äldre dokument utan översättning
  // ska visas (med svensk fallback), inte tyst försvinna ur listorna.
  nameEn: z.string().default(''),
  description: z.string().default(''),
  descriptionEn: z.string().default(''),
  highlights: z.array(z.string()).default([]),
  highlightsEn: z.array(z.string()).default([]),
  order: z.number(),
  published: z.boolean(),
  hiddenFields: z.array(z.enum(['endDate', 'location', 'section'])).optional(),
  dateMode: z.enum(['date', 'datetime']).optional(),
});

export type TKLEventType = z.infer<typeof EventTypeSchema>;

export const EventTypeFormSchema = EventTypeSchema.omit({ id: true });
export type EventTypeFormData = z.infer<typeof EventTypeFormSchema>;
