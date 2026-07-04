"use server";

import { generateHTML } from "@tiptap/html";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";

import { reviewEditorExtensions } from "@/features/reviews/editor-extensions";
import { getCommentsForReview, getReviewsForBook } from "@/features/reviews/queries";
import { commentSchema, rateBookSchema, reviewSchema } from "@/features/reviews/schemas";
import { isEmptyTiptapDoc } from "@/features/reviews/utils";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ActionResult<T = unknown> =
  | ({ success: true } & T)
  | { success: false; error: string; fieldErrors?: Record<string, string[] | undefined> };

/** Recomputes Book.averageRating/ratingsCount/reviewsCount from source of
 * truth. Called inside the same transaction as any write that could change
 * them — see the milestone's counter-consistency reasoning. */
async function recomputeBookStats(tx: Prisma.TransactionClient, bookId: string) {
  const [agg, reviewsCount] = await Promise.all([
    tx.rating.aggregate({ where: { bookId }, _avg: { value: true }, _count: true }),
    tx.review.count({ where: { bookId, deletedAt: null } }),
  ]);
  await tx.book.update({
    where: { id: bookId },
    data: {
      averageRating: agg._avg.value ?? 0,
      ratingsCount: agg._count,
      reviewsCount,
    },
  });
}

export async function rateBook(
  input: unknown
): Promise<ActionResult<{ averageRating: number; ratingsCount: number }>> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "You must be logged in to rate books." };

  const parsed = rateBookSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid rating.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { bookId, value } = parsed.data;
  const userId = session.user.id;

  const book = await prisma.$transaction(async (tx) => {
    await tx.rating.upsert({
      where: { userId_bookId: { userId, bookId } },
      create: { userId, bookId, value },
      update: { value },
    });
    await recomputeBookStats(tx, bookId);
    return tx.book.findUniqueOrThrow({
      where: { id: bookId },
      select: { slug: true, averageRating: true, ratingsCount: true },
    });
  });

  revalidatePath(`/books/${book.slug}`);
  return {
    success: true,
    averageRating: Number(book.averageRating),
    ratingsCount: book.ratingsCount,
  };
}

export async function upsertReview(input: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "You must be logged in to write a review." };

  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { bookId, content, containsSpoilers, ratingValue } = parsed.data;
  if (isEmptyTiptapDoc(content)) {
    return {
      success: false,
      error: "Review cannot be empty.",
      fieldErrors: { content: ["Review cannot be empty."] },
    };
  }

  const userId = session.user.id;

  const book = await prisma.$transaction(async (tx) => {
    let ratingId: string | null = null;
    if (ratingValue !== null) {
      const rating = await tx.rating.upsert({
        where: { userId_bookId: { userId, bookId } },
        create: { userId, bookId, value: ratingValue },
        update: { value: ratingValue },
      });
      ratingId = rating.id;
    }

    const existing = await tx.review.findFirst({
      where: { bookId, userId, deletedAt: null },
      select: { id: true },
    });

    const contentJson = JSON.stringify(content);

    if (existing) {
      await tx.review.update({
        where: { id: existing.id },
        data: { content: contentJson, containsSpoilers, ratingId },
      });
    } else {
      await tx.review.create({
        data: { bookId, userId, content: contentJson, containsSpoilers, ratingId },
      });
    }

    await recomputeBookStats(tx, bookId);
    return tx.book.findUniqueOrThrow({ where: { id: bookId }, select: { slug: true } });
  });

  revalidatePath(`/books/${book.slug}`);
  return { success: true };
}

export async function deleteReview(reviewId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Not authenticated." };

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { userId: true, bookId: true },
  });
  if (!review || review.userId !== session.user.id) {
    return { success: false, error: "You can only delete your own review." };
  }

  const book = await prisma.$transaction(async (tx) => {
    await tx.review.update({ where: { id: reviewId }, data: { deletedAt: new Date() } });
    await recomputeBookStats(tx, review.bookId);
    return tx.book.findUniqueOrThrow({ where: { id: review.bookId }, select: { slug: true } });
  });

  revalidatePath(`/books/${book.slug}`);
  return { success: true };
}

export async function toggleLike(
  likeableType: "REVIEW" | "COMMENT",
  likeableId: string
): Promise<ActionResult<{ liked: boolean; likesCount: number }>> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "You must be logged in to like this." };

  const userId = session.user.id;

  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.like.findUnique({
      where: { userId_likeableType_likeableId: { userId, likeableType, likeableId } },
    });

    if (existing) {
      await tx.like.delete({ where: { id: existing.id } });
    } else {
      await tx.like.create({ data: { userId, likeableType, likeableId } });
    }

    const likesCount = await tx.like.count({ where: { likeableType, likeableId } });

    if (likeableType === "REVIEW") {
      await tx.review.update({ where: { id: likeableId }, data: { likesCount } });
    } else {
      await tx.comment.update({ where: { id: likeableId }, data: { likesCount } });
    }

    return { liked: !existing, likesCount };
  });

  return { success: true, ...result };
}

const commentAuthorSelect = {
  id: true,
  name: true,
  profile: { select: { username: true, avatarUrl: true, displayName: true } },
} as const;

export async function createComment(input: unknown) {
  const session = await auth();
  if (!session?.user) {
    return { success: false as const, error: "You must be logged in to comment." };
  }

  const parsed = commentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false as const,
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { reviewId, parentId, content } = parsed.data;
  const userId = session.user.id;

  const comment = await prisma.$transaction(async (tx) => {
    const created = await tx.comment.create({
      data: { reviewId, parentId, userId, content },
      include: { user: { select: commentAuthorSelect } },
    });
    const commentsCount = await tx.comment.count({ where: { reviewId, deletedAt: null } });
    await tx.review.update({ where: { id: reviewId }, data: { commentsCount } });
    return created;
  });

  return { success: true as const, comment: { ...comment, isLikedByCurrentUser: false } };
}

export async function deleteComment(commentId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Not authenticated." };

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { userId: true, reviewId: true },
  });
  if (!comment || comment.userId !== session.user.id) {
    return { success: false, error: "You can only delete your own comment." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.comment.update({ where: { id: commentId }, data: { deletedAt: new Date() } });
    const commentsCount = await tx.comment.count({
      where: { reviewId: comment.reviewId, deletedAt: null },
    });
    await tx.review.update({ where: { id: comment.reviewId }, data: { commentsCount } });
  });

  return { success: true };
}

/**
 * Powers cursor-paginated "Load more" on the client. Returns fully
 * serializable props shaped for ReviewCardView — no raw Tiptap JSON (HTML
 * is pre-generated here), so this can cross the Server Action boundary and
 * be rendered directly from client state.
 */
export async function loadMoreReviews(bookId: string, cursor: string) {
  const session = await auth();
  const currentUserId = session?.user?.id ?? null;

  const { reviews, nextCursor } = await getReviewsForBook(bookId, {
    cursor,
    currentUserId,
  });

  const items = await Promise.all(
    reviews.map(async (review) => {
      const contentJson = JSON.parse(review.content);
      const html = generateHTML(contentJson, reviewEditorExtensions);
      const comments = await getCommentsForReview(review.id, currentUserId);

      return {
        id: review.id,
        bookId: review.bookId,
        contentJson,
        html,
        containsSpoilers: review.containsSpoilers,
        ratingValue: review.rating ? Number(review.rating.value) : null,
        createdAt: review.createdAt.toISOString(),
        likesCount: review.likesCount,
        isLikedByCurrentUser: review.isLikedByCurrentUser,
        displayName: review.user.profile?.displayName ?? review.user.name ?? "Reader",
        avatarUrl: review.user.profile?.avatarUrl ?? null,
        isOwn: currentUserId === review.user.id,
        currentUserId,
        isAuthenticated: !!session?.user,
        comments,
      };
    })
  );

  return { items, nextCursor };
}
