"use client";

import { MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { deleteReview } from "@/features/reviews/actions";
import { ReviewEditor } from "@/features/reviews/components/review-editor";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ReviewCardShell({
  isOwn,
  reviewId,
  bookId,
  initialContent,
  initialRating,
  initialSpoiler,
  children,
}: {
  isOwn: boolean;
  reviewId: string;
  bookId: string;
  initialContent: object;
  initialRating: number | undefined;
  initialSpoiler: boolean;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (isEditing) {
    return (
      <ReviewEditor
        bookId={bookId}
        initialContent={initialContent}
        initialRating={initialRating}
        initialSpoiler={initialSpoiler}
        onSuccess={() => setIsEditing(false)}
      />
    );
  }

  const handleDelete = () => {
    startTransition(async () => {
      await deleteReview(reviewId);
      router.refresh();
    });
  };

  return (
    <div className="group relative">
      {children}
      {isOwn && (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="absolute right-0 top-0 opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Review actions"
              />
            }
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsEditing(true)}>Edit</DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={handleDelete} disabled={isPending}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
