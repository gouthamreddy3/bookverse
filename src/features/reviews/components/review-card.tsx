import { generateHTML } from "@tiptap/html";

import { getCommentsForReview } from "@/features/reviews/queries";
import { ReviewCardView } from "@/features/reviews/components/review-card-view";
import { reviewEditorExtensions } from "@/features/reviews/editor-extensions";

export interface ReviewCardData {
  id: string;
  bookId: string;
  content: string;
  containsSpoilers: boolean;
  likesCount: number;
  commentsCount: number;
  createdAt: Date;
  isLikedByCurrentUser: boolean;
  rating: { value: unknown } | null;
  user: {
    id: string;
    name: string | null;
    profile: { username: string; avatarUrl: string | null; displayName: string | null } | null;
  };
}

/** Initial-page render: does the async work (comments query + HTML
 * generation) then hands off to the pure ReviewCardView for presentation. */
export async function ReviewCard({
  review,
  currentUserId,
  isAuthenticated,
}: {
  review: ReviewCardData;
  currentUserId: string | null;
  isAuthenticated: boolean;
}) {
  const contentJson = JSON.parse(review.content);
  const html = generateHTML(contentJson, reviewEditorExtensions);
  const comments = await getCommentsForReview(review.id, currentUserId);

  return (
    <ReviewCardView
      id={review.id}
      bookId={review.bookId}
      contentJson={contentJson}
      html={html}
      containsSpoilers={review.containsSpoilers}
      ratingValue={review.rating ? Number(review.rating.value) : null}
      createdAt={review.createdAt}
      likesCount={review.likesCount}
      isLikedByCurrentUser={review.isLikedByCurrentUser}
      displayName={review.user.profile?.displayName ?? review.user.name ?? "Reader"}
      avatarUrl={review.user.profile?.avatarUrl ?? null}
      isOwn={currentUserId === review.user.id}
      currentUserId={currentUserId}
      isAuthenticated={isAuthenticated}
      comments={comments}
    />
  );
}
