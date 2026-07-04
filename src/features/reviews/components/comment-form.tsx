"use client";

import { useState, useTransition } from "react";

import { createComment } from "@/features/reviews/actions";
import type { CommentItemData } from "@/features/reviews/components/comment-item";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function CommentForm({
  reviewId,
  parentId = null,
  onCreated,
}: {
  reviewId: string;
  parentId?: string | null;
  onCreated: (comment: CommentItemData) => void;
}) {
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await createComment({ reviewId, parentId, content });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setContent("");
      onCreated(result.comment);
    });
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2">
      <Textarea
        placeholder="Add a comment..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={2}
        className="text-sm"
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={isPending || !content.trim()}>
          {isPending ? "Posting..." : "Comment"}
        </Button>
      </div>
    </form>
  );
}
