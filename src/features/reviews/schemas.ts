import { z } from "zod";

/** Half-star increments only: 0.5, 1.0, 1.5, ..., 5.0 */
export const ratingValueSchema = z
  .number()
  .min(0.5, "Rating must be at least 0.5 stars")
  .max(5, "Rating cannot exceed 5 stars")
  .refine((value) => Number.isInteger(value * 2), {
    message: "Rating must be in half-star increments",
  });

export const rateBookSchema = z.object({
  bookId: z.uuid(),
  value: ratingValueSchema,
});

export type RateBookInput = z.infer<typeof rateBookSchema>;

/** Tiptap's JSON document shape — validated loosely; emptiness is checked separately. */
const tiptapDocSchema = z.object({
  type: z.literal("doc"),
  content: z.array(z.record(z.string(), z.unknown())).optional(),
});

export const reviewSchema = z.object({
  bookId: z.uuid(),
  content: tiptapDocSchema,
  containsSpoilers: z.boolean(),
  ratingValue: ratingValueSchema.nullable(),
});

export type ReviewInput = z.infer<typeof reviewSchema>;

export const commentSchema = z.object({
  reviewId: z.uuid(),
  parentId: z.uuid().nullable(),
  content: z.string().trim().min(1, "Comment cannot be empty").max(2000, "Comment is too long"),
});

export type CommentInput = z.infer<typeof commentSchema>;
