import "server-only";

import { prisma } from "@/lib/prisma";

export async function getUserReadingLists(userId: string) {
  return prisma.readingList.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    include: {
      _count: { select: { items: true } },
    },
  });
}

export async function getReadingListDetail(listId: string) {
  return prisma.readingList.findUnique({
    where: { id: listId },
    include: {
      items: {
        orderBy: { position: "asc" },
        include: { book: { select: { title: true, slug: true, coverImageUrl: true } } },
      },
    },
  });
}

export async function getUserReadingStatus(userId: string, bookId: string) {
  const status = await prisma.readingStatus.findUnique({
    where: { userId_bookId: { userId, bookId } },
  });
  return status?.status ?? null;
}

/** Lists owned by userId, with whether bookId is already in each — for the "Add to list" menu. */
export async function getListsWithMembership(userId: string, bookId: string) {
  const lists = await prisma.readingList.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    include: { items: { where: { bookId }, select: { id: true } } },
  });
  return lists.map((list) => ({
    id: list.id,
    name: list.name,
    isMember: list.items.length > 0,
  }));
}
