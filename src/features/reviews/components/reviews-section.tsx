import Link from "next/link";

import {
  getRatingDistribution,
  getReviewsForBook,
  getUserRatingAndReview,
} from "@/features/reviews/queries";
import { ReviewCard } from "@/features/reviews/components/review-card";
import { ReviewEditorGate } from "@/features/reviews/components/review-editor-gate";
import { ReviewList } from "@/features/reviews/components/review-list";
import { ReviewStats } from "@/features/reviews/components/review-stats";
import { auth } from "@/lib/auth";

export async function ReviewsSection({
  bookId,
  averageRating,
  ratingsCount,
}: {
  bookId: string;
  averageRating: number;
  ratingsCount: number;
}) {
  const session = await auth();
  const currentUserId = session?.user?.id ?? null;
  const isAuthenticated = !!session?.user;

  const [{ buckets }, { rating, review }, { reviews, nextCursor }] = await Promise.all([
    getRatingDistribution(bookId),
    currentUserId
      ? getUserRatingAndReview(bookId, currentUserId)
      : Promise.resolve({ rating: null, review: null }),
    getReviewsForBook(bookId, { currentUserId }),
  ]);

  return (
    <section className="flex flex-col gap-8">
      <ReviewStats buckets={buckets} total={ratingsCount} averageRating={averageRating} />

      {isAuthenticated ? (
        <ReviewEditorGate
          bookId={bookId}
          hasExistingReview={!!review}
          initialRating={rating ? Number(rating.value) : undefined}
        />
      ) : (
        <div className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
            Log in
          </Link>{" "}
          to rate or review this book.
        </div>
      )}

      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">Reviews</h2>
        {reviews.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No reviews yet — be the first to review this book.
          </p>
        )}
      </div>

      <ReviewList bookId={bookId} initialNextCursor={nextCursor}>
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            currentUserId={currentUserId}
            isAuthenticated={isAuthenticated}
          />
        ))}
      </ReviewList>
    </section>
  );
}
