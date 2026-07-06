import "server-only";

import { prisma } from "@/lib/prisma";

export async function getProfileByUsername(username: string) {
  return prisma.profile.findUnique({
    where: { username },
    include: {
      user: { select: { id: true, name: true } },
    },
  });
}

export async function getOwnUsername(userId: string): Promise<string | null> {
  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { username: true },
  });
  return profile?.username ?? null;
}

/** Recent reviews by this user, with book context — powers the profile page. */
export async function getRecentReviewsByUser(userId: string, limit = 6) {
  return prisma.review.findMany({
    where: { userId, deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      rating: { select: { value: true } },
      book: { select: { title: true, slug: true, coverImageUrl: true } },
    },
  });
}
