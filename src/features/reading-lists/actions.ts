"use server";

import { revalidatePath } from "next/cache";

import {
  createReadingListSchema,
  setReadingStatusSchema,
  toggleBookInListSchema,
} from "@/features/reading-lists/schemas";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ActionResult<T = unknown> =
  | ({ success: true } & T)
  | { success: false; error: string };

export async function setReadingStatus(input: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "You must be logged in." };

  const parsed = setReadingStatusSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid status." };

  const { bookId, status } = parsed.data;
  const userId = session.user.id;

  if (status === null) {
    await prisma.readingStatus.deleteMany({ where: { userId, bookId } });
  } else {
    await prisma.readingStatus.upsert({
      where: { userId_bookId: { userId, bookId } },
      create: { userId, bookId, status },
      update: { status },
    });
  }

  return { success: true };
}

export async function createReadingList(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "You must be logged in." };

  const parsed = createReadingListSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid name." };

  const list = await prisma.readingList.create({
    data: { userId: session.user.id, name: parsed.data.name },
  });

  revalidatePath("/lists");
  return { success: true, id: list.id };
}

export async function toggleBookInList(
  input: unknown
): Promise<ActionResult<{ added: boolean }>> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "You must be logged in." };

  const parsed = toggleBookInListSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid input." };

  const { listId, bookId } = parsed.data;

  const list = await prisma.readingList.findUnique({ where: { id: listId } });
  if (!list || list.userId !== session.user.id) {
    return { success: false, error: "List not found." };
  }

  const existing = await prisma.readingListItem.findUnique({
    where: { readingListId_bookId: { readingListId: listId, bookId } },
  });

  if (existing) {
    await prisma.readingListItem.delete({ where: { id: existing.id } });
  } else {
    await prisma.readingListItem.create({ data: { readingListId: listId, bookId } });
  }

  revalidatePath("/lists");
  return { success: true, added: !existing };
}
