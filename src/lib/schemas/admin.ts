import { z } from 'zod';

// AdminDoc-schemat används inte för runtime-parsing (existence-check räcker).
// Det finns för typderivering och framtida utökning av admins-dokumentet.
export const AdminDocSchema = z.object({}).passthrough();
export type AdminDoc = z.infer<typeof AdminDocSchema>;
