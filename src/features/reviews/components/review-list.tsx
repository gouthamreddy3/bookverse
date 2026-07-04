"use client";

import { useState, useTransition } from "react";

import { loadMoreReviews } from "@/features/reviews/actions";
import { ReviewCardView } from "@/features/reviews/components/review-card-view";
import { Button } from "@/components/ui/button";

type LoadedItem = Awaited<ReturnType<typeof loadMoreReviews>>["items"][number];

export function ReviewList({
  bookId,
  initialNextCursor,
  children,
}: {
  bookId: string;
  initialNextCursor: string | null;
  children: React.ReactNode;
}) {
  const [items, setItems] = useState<LoadedItem[]>([]);
  const [cursor, setCursor] = useState(initialNextCursor);
  const [isPending, startTransition] = useTransition();

  const handleLoadMore = () => {
    if (!cursor) return;
    startTransition(async () => {
      const result = await loadMoreReviews(bookId, cursor);
      setItems((prev) => [...prev, ...result.items]);
      setCursor(result.nextCursor);
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {children}
      {items.map((item) => (
        <ReviewCardView key={item.id} {...item} />
      ))}
      {cursor && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={handleLoadMore} disabled={isPending}>
            {isPending ? "Loading..." : "Load more reviews"}
          </Button>
        </div>
      )}
    </div>
  );
}
