import { z } from 'zod';

export const EventTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
  nameEn: z.string(),
  description: z.string(),
  descriptionEn: z.string(),
  highlights: z.array(z.string()),
  highlightsEn: z.array(z.string()),
  order: z.number(),
  published: z.boolean(),
});

export type TKLEventType = z.infer<typeof EventTypeSchema>;

export const EventTypeFormSchema = EventTypeSchema.omit({ id: true });
export type EventTypeFormData = z.infer<typeof EventTypeFormSchema>;
