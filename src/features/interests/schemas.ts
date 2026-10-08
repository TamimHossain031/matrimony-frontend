import { z } from 'zod';

export const sendInterestSchema = z.object({
  profile_id: z.string().min(1),
  message: z.string().max(500, 'Keep it under 500 characters').optional(),
});
export type SendInterestValues = z.infer<typeof sendInterestSchema>;
