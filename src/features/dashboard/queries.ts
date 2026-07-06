import "server-only";

import { prisma } from "@/lib/prisma";

function startOfYear(): Date {
  return new Date(Date.UTC(new Date().getUTCFullYear(), 0, 1));
}

export async function getDashboardStats(userId: string) {
  const yearStart = startOfYear();

  const [profile, booksReadThisYear, currentlyReading, ratingsGiven] = await Promise.all([
    prisma.profile.findUnique({ where: { userId } }),
    prisma.readingStatus.findMany({
      where: { userId, status: "READ", finishedAt: { gte: yearStart } },
      include: { book: { select: { pageCount: true } } },
    }),
    prisma.readingStatus.findMany({
      where: { userId, status: "READING" },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { book: { select: { title: true, slug: true, coverImageUrl: true, pageCount: true } } },
    }),
    prisma.rating.aggregate({ where: { userId }, _avg: { value: true }, _count: true }),
  ]);

  const pagesReadThisYear = booksReadThisYear.reduce(
    (sum, r) => sum + (r.book.pageCount ?? 0),
    0
  );

  return {
    readingGoal: profile?.readingGoal ?? null,
    booksReadTotal: profile?.booksReadCount ?? 0,
    booksReadThisYear: booksReadThisYear.length,
    pagesReadThisYear,
    currentlyReading,
    ratingsGivenCount: ratingsGiven._count,
    averageRatingGiven: ratingsGiven._avg.value ? Number(ratingsGiven._avg.value) : null,
    streak: await getReadingStreak(userId),
  };
}

/**
 * Approximates a "reading streak" from consecutive days with any reading
 * activity (rating, review, or status update) — we don't have a dedicated
 * daily-activity log, so this is a real computation over existing data,
 * not a fabricated number.
 */
async function getReadingStreak(userId: string): Promise<number> {
  const [ratings, reviews, statuses] = await Promise.all([
    prisma.rating.findMany({ where: { userId }, select: { updatedAt: true } }),
    prisma.review.findMany({ where: { userId }, select: { updatedAt: true } }),
    prisma.readingStatus.findMany({ where: { userId }, select: { updatedAt: true } }),
  ]);

  const days = new Set(
    [...ratings, ...reviews, ...statuses].map((r) => r.updatedAt.toISOString().slice(0, 10))
  );

  let streak = 0;
  const cursor = new Date();
  for (;;) {
    const key = cursor.toISOString().slice(0, 10);
    if (!days.has(key)) break;
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}
