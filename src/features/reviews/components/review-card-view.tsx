import Image from "next/image";
import { User } from "lucide-react";

import { CommentSection } from "@/features/reviews/components/comment-section";
import type { CommentItemData } from "@/features/reviews/components/comment-item";
import { LikeButton } from "@/features/reviews/components/like-button";
import { ReviewCardShell } from "@/features/reviews/components/review-card-shell";
import { ReviewContent } from "@/features/reviews/components/review-content";
import { StarRatingDisplay } from "@/features/reviews/components/star-rating-display";
import { formatRelativeTime } from "@/features/reviews/utils";

interface CommentWithReplies extends CommentItemData {
  replies: CommentItemData[];
}

/**
 * Pure, server-safe-and-client-safe presentation: no async work, no
 * server-only imports. This is what makes cursor pagination possible —
 * the initial page renders it from a Server Component (review-card.tsx),
 * and "Load more" renders it directly from client state populated by a
 * Server Action's serialized return value.
 */
export function ReviewCardView({
  id,
  bookId,
  contentJson,
  html,
  containsSpoilers,
  ratingValue,
  createdAt,
  likesCount,
  isLikedByCurrentUser,
  displayName,
  avatarUrl,
  isOwn,
  currentUserId,
  isAuthenticated,
  comments,
}: {
  id: string;
  bookId: string;
  contentJson: object;
  html: string;
  containsSpoilers: boolean;
  ratingValue: number | null;
  createdAt: Date | string;
  likesCount: number;
  isLikedByCurrentUser: boolean;
  displayName: string;
  avatarUrl: string | null;
  isOwn: boolean;
  currentUserId: string | null;
  isAuthenticated: boolean;
  comments: CommentWithReplies[];
}) {
  return (
    <ReviewCardShell
      isOwn={isOwn}
      reviewId={id}
      bookId={bookId}
      initialContent={contentJson}
      initialRating={ratingValue ?? undefined}
      initialSpoiler={containsSpoilers}
    >
      <div className="flex flex-col gap-3 border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <div className="relative size-9 shrink-0 overflow-hidden rounded-full bg-muted">
            {avatarUrl ? (
              <Image src={avatarUrl} alt="" fill sizes="36px" className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <User className="size-4 text-muted-foreground" />
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-medium">{displayName}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {ratingValue !== null && <StarRatingDisplay value={ratingValue} size="sm" />}
              <span>{formatRelativeTime(createdAt)}</span>
            </div>
          </div>
        </div>

        <ReviewContent html={html} containsSpoilers={containsSpoilers} />

        <div className="flex items-center gap-2">
          <LikeButton
            likeableType="REVIEW"
            likeableId={id}
            initialLiked={isLikedByCurrentUser}
            initialCount={likesCount}
            isAuthenticated={isAuthenticated}
          />
        </div>

        <CommentSection
          reviewId={id}
          initialComments={comments}
          currentUserId={currentUserId}
          isAuthenticated={isAuthenticated}
        />
      </div>
    </ReviewCardShell>
  );
}
