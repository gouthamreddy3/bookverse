import "server-only";

import { prisma } from "@/lib/prisma";

const REVIEWS_PAGE_SIZE = 10;

const reviewAuthorSelect = {
  id: true,
  name: true,
  profile: { select: { username: true, avatarUrl: true, displayName: true } },
} as const;

async function likedReviewIds(reviewIds: string[], userId: string | null): Promise<Set<string>> {
  if (!userId || reviewIds.length === 0) return new Set();
  const likes = await prisma.like.findMany({
    where: { userId, likeableType: "REVIEW", likeableId: { in: reviewIds } },
    select: { likeableId: true },
  });
  return new Set(likes.map((l) => l.likeableId));
}

export async function getReviewsForBook(
  bookId: string,
  { cursor, currentUserId }: { cursor?: string; currentUserId: string | null }
) {
  const reviews = await prisma.review.findMany({
    where: { bookId, deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: REVIEWS_PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      user: { select: reviewAuthorSelect },
      rating: { select: { value: true } },
    },
  });

  const hasMore = reviews.length > REVIEWS_PAGE_SIZE;
  const page = hasMore ? reviews.slice(0, REVIEWS_PAGE_SIZE) : reviews;
  const liked = await likedReviewIds(
    page.map((r) => r.id),
    currentUserId
  );

  return {
    reviews: page.map((review) => ({ ...review, isLikedByCurrentUser: liked.has(review.id) })),
    nextCursor: hasMore ? page[page.length - 1]?.id ?? null : null,
  };
}

/** Global review feed across all books — powers /reviews. */
export async function getRecentReviews(currentUserId: string | null, limit = 20) {
  const reviews = await prisma.review.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      user: { select: reviewAuthorSelect },
      rating: { select: { value: true } },
      book: { select: { title: true, slug: true, coverImageUrl: true } },
    },
  });

  const liked = await likedReviewIds(
    reviews.map((r) => r.id),
    currentUserId
  );

  return reviews.map((review) => ({ ...review, isLikedByCurrentUser: liked.has(review.id) }));
}

export async function getUserRatingAndReview(bookId: string, userId: string) {
  const [rating, review] = await Promise.all([
    prisma.rating.findUnique({ where: { userId_bookId: { userId, bookId } } }),
    prisma.review.findFirst({
      where: { bookId, userId, deletedAt: null },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  return { rating, review };
}

/**
 * Buckets ratings into whole-star counts for the distribution chart.
 * Fetches raw values and reduces in-app rather than a SQL GROUP BY ROUND() —
 * simpler and entirely fine at this scale; a book with millions of ratings
 * would want the raw-SQL version instead.
 */
export async function getRatingDistribution(bookId: string) {
  const ratings = await prisma.rating.findMany({ where: { bookId }, select: { value: true } });
  const buckets = [0, 0, 0, 0, 0]; // index 0 = 1 star ... index 4 = 5 stars

  for (const { value } of ratings) {
    const star = Math.min(5, Math.max(1, Math.round(Number(value))));
    const bucket = buckets[star - 1];
    if (bucket !== undefined) buckets[star - 1] = bucket + 1;
  }

  return { buckets, total: ratings.length };
}

export async function getCommentsForReview(reviewId: string, currentUserId: string | null) {
  const comments = await prisma.comment.findMany({
    where: { reviewId, parentId: null, deletedAt: null },
    orderBy: { createdAt: "asc" },
    include: {
      user: { select: reviewAuthorSelect },
      replies: {
        where: { deletedAt: null },
        orderBy: { createdAt: "asc" },
        include: { user: { select: reviewAuthorSelect } },
      },
    },
  });

  const allIds = comments.flatMap((c) => [c.id, ...c.replies.map((r) => r.id)]);
  const liked = await likedCommentIds(allIds, currentUserId);

  return comments.map((comment) => ({
    ...comment,
    isLikedByCurrentUser: liked.has(comment.id),
    replies: comment.replies.map((reply) => ({
      ...reply,
      isLikedByCurrentUser: liked.has(reply.id),
    })),
  }));
}

async function likedCommentIds(commentIds: string[], userId: string | null): Promise<Set<string>> {
  if (!userId || commentIds.length === 0) return new Set();
  const likes = await prisma.like.findMany({
    where: { userId, likeableType: "COMMENT", likeableId: { in: commentIds } },
    select: { likeableId: true },
  });
  return new Set(likes.map((l) => l.likeableId));
}
