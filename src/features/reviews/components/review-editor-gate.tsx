"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { rateBook } from "@/features/reviews/actions";
import { ReviewEditor } from "@/features/reviews/components/review-editor";
import { StarRatingInput } from "@/features/reviews/components/star-rating-input";
import { Button } from "@/components/ui/button";

export function ReviewEditorGate({
  bookId,
  hasExistingReview,
  initialRating,
}: {
  bookId: string;
  hasExistingReview: boolean;
  initialRating?: number;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(initialRating ?? 0);
  const [isWriting, setIsWriting] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleQuickRate = (value: number) => {
    setRating(value);
    startTransition(async () => {
      await rateBook({ bookId, value });
      router.refresh();
    });
  };

  if (isWriting) {
    return (
      <ReviewEditor
        bookId={bookId}
        initialRating={rating || undefined}
        onSuccess={() => setIsWriting(false)}
      />
    );
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-4">
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">Your rating</span>
        <StarRatingInput value={rating} onChange={handleQuickRate} disabled={isPending} />
      </div>
      {!hasExistingReview && (
        <Button variant="outline" onClick={() => setIsWriting(true)}>
          Write a review
        </Button>
      )}
    </div>
  );
}
