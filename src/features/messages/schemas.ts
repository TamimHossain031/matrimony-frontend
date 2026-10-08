import { z } from 'zod';

export const sendMessageSchema = z.object({
  body: z.string().min(1, 'Write a message').max(2000, 'Keep it under 2000 characters'),
});
export type SendMessageValues = z.infer<typeof sendMessageSchema>;
