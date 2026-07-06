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
