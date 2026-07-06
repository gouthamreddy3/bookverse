import { z } from "zod";

export const readingStatusValues = [
  "WANT_TO_READ",
  "READING",
  "READ",
  "DID_NOT_FINISH",
  "ON_HOLD",
] as const;

export const setReadingStatusSchema = z.object({
  bookId: z.uuid(),
  status: z.enum(readingStatusValues).nullable(),
});

export const createReadingListSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(50),
});

export const toggleBookInListSchema = z.object({
  listId: z.uuid(),
  bookId: z.uuid(),
});
