import { z } from 'zod';

const yesNo = z.enum(['no', 'occasionally', 'yes']);

// A single permissive schema used by the multi-step create flow and the edit
// form. Every field is optional so a step can submit only what it owns; the
// backend validates ranges authoritatively.
export const profileSchema = z.object({
  full_name_en: z.string().min(2, 'Enter the full name').max(255).optional(),
  full_name_bn: z.string().max(255).nullable().optional(),
  height_cm: z.coerce
    .number()
    .int()
    .min(120, 'Height seems too low')
    .max(230, 'Height seems too high')
    .nullable()
    .optional(),
  marital_status: z
    .enum(['never_married', 'divorced', 'widowed', 'separated'])
    .nullable()
    .optional(),
  district_id: z.coerce.number().int().nullable().optional(),
  upazila_id: z.coerce.number().int().nullable().optional(),
  nationality: z.string().max(100).nullable().optional(),
  headline: z.string().max(255).nullable().optional(),
  about: z.string().max(5000).nullable().optional(),
  religion_id: z.coerce.number().int().nullable().optional(),
  education_level_id: z.coerce.number().int().nullable().optional(),
  institution: z.string().max(255).nullable().optional(),
  subject: z.string().max(255).nullable().optional(),
  graduation_year: z.coerce
    .number()
    .int()
    .min(1950)
    .max(new Date().getFullYear() + 1)
    .nullable()
    .optional(),
  profession_id: z.coerce.number().int().nullable().optional(),
  job_title: z.string().max(255).nullable().optional(),
  organization: z.string().max(255).nullable().optional(),
  income_min: z.coerce.number().int().min(0).nullable().optional(),
  income_max: z.coerce.number().int().min(0).nullable().optional(),
  work_location: z.string().max(255).nullable().optional(),
  father_occupation: z.string().max(255).nullable().optional(),
  mother_occupation: z.string().max(255).nullable().optional(),
  siblings_count: z.coerce.number().int().min(0).max(30).nullable().optional(),
  family_type: z.enum(['nuclear', 'joint']).nullable().optional(),
  family_location: z.string().max(255).nullable().optional(),
  family_description: z.string().max(2000).nullable().optional(),
  lifestyle: z
    .object({
      smoking: yesNo.optional(),
      drinking: yesNo.optional(),
      diet: z.enum(['halal', 'vegetarian', 'vegan', 'no_restriction']).optional(),
      hobbies: z.array(z.string().max(50)).optional(),
      languages: z.array(z.string().max(50)).optional(),
    })
    .nullable()
    .optional(),
  religion_attributes: z.record(z.string(), z.string()).optional(),
});

export type ProfileValues = z.infer<typeof profileSchema>;
