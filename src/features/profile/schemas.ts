import { z } from "zod";

export const updateProfileSchema = z.object({
  displayName: z.string().trim().max(50).optional().or(z.literal("")),
  bio: z.string().trim().max(280).optional().or(z.literal("")),
  location: z.string().trim().max(100).optional().or(z.literal("")),
  websiteUrl: z
    .string()
    .trim()
    .pipe(z.url("Enter a valid URL"))
    .optional()
    .or(z.literal("")),
  pronouns: z.string().trim().max(30).optional().or(z.literal("")),
  avatarUrl: z
    .string()
    .trim()
    .pipe(z.url("Enter a valid URL"))
    .optional()
    .or(z.literal("")),
  bannerUrl: z
    .string()
    .trim()
    .pipe(z.url("Enter a valid URL"))
    .optional()
    .or(z.literal("")),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
