"use client";

import { useState } from "react";

import { CommentForm } from "@/features/reviews/components/comment-form";
import { CommentItem, type CommentItemData } from "@/features/reviews/components/comment-item";
import { Button } from "@/components/ui/button";

interface CommentWithReplies extends CommentItemData {
  replies: CommentItemData[];
}

export function CommentSection({
  reviewId,
  initialComments,
  currentUserId,
  isAuthenticated,
}: {
  reviewId: string;
  initialComments: CommentWithReplies[];
  currentUserId: string | null;
  isAuthenticated: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [comments, setComments] = useState(initialComments);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const liveCount = comments.reduce((sum, c) => sum + 1 + c.replies.length, 0);

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen((v) => !v)}
        className="text-xs text-muted-foreground"
      >
        {liveCount > 0 ? `${liveCount} comment${liveCount === 1 ? "" : "s"}` : "Add a comment"}
      </Button>

      {isOpen && (
        <div className="mt-3 flex flex-col gap-4 border-t border-border pt-3">
          {comments.map((comment) => (
            <div key={comment.id} className="flex flex-col gap-3">
              <CommentItem
                comment={comment}
                currentUserId={currentUserId}
                isAuthenticated={isAuthenticated}
              />
              <div className="ml-9 flex flex-col gap-3">
                {comment.replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    currentUserId={currentUserId}
                    isAuthenticated={isAuthenticated}
                  />
                ))}
                {isAuthenticated &&
                  (replyingTo === comment.id ? (
                    <CommentForm
                      reviewId={reviewId}
                      parentId={comment.id}
                      onCreated={(newReply) => {
                        setComments((prev) =>
                          prev.map((c) =>
                            c.id === comment.id
                              ? { ...c, replies: [...c.replies, newReply] }
                              : c
                          )
                        );
                        setReplyingTo(null);
                      }}
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setReplyingTo(comment.id)}
                      className="self-start text-xs font-medium text-muted-foreground hover:text-foreground"
                    >
                      Reply
                    </button>
                  ))}
              </div>
            </div>
          ))}

          {isAuthenticated ? (
            <CommentForm
              reviewId={reviewId}
              onCreated={(newComment) =>
                setComments((prev) => [...prev, { ...newComment, replies: [] }])
              }
            />
          ) : (
            <p className="text-xs text-muted-foreground">Log in to join the conversation.</p>
          )}
        </div>
      )}
    </div>
  );
}
