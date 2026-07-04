"use client";

import Image from "next/image";
import { User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { deleteComment } from "@/features/reviews/actions";
import { LikeButton } from "@/features/reviews/components/like-button";
import { formatRelativeTime } from "@/features/reviews/utils";
import { Button } from "@/components/ui/button";

export interface CommentItemData {
  id: string;
  content: string;
  createdAt: Date | string;
  likesCount: number;
  isLikedByCurrentUser: boolean;
  user: {
    id: string;
    name: string | null;
    profile: { username: string; avatarUrl: string | null; displayName: string | null } | null;
  };
}

export function CommentItem({
  comment,
  currentUserId,
  isAuthenticated,
}: {
  comment: CommentItemData;
  currentUserId: string | null;
  isAuthenticated: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const displayName = comment.user.profile?.displayName ?? comment.user.name ?? "Reader";
  const isOwn = currentUserId === comment.user.id;

  return (
    <div className="flex gap-2.5">
      <div className="relative size-7 shrink-0 overflow-hidden rounded-full bg-muted">
        {comment.user.profile?.avatarUrl ? (
          <Image src={comment.user.profile.avatarUrl} alt="" fill sizes="28px" className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <User className="size-3.5 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium">{displayName}</span>
          <span className="text-xs text-muted-foreground">{formatRelativeTime(comment.createdAt)}</span>
        </div>
        <p className="text-sm text-foreground/90">{comment.content}</p>
        <div className="mt-1 flex items-center gap-2">
          <LikeButton
            likeableType="COMMENT"
            likeableId={comment.id}
            initialLiked={comment.isLikedByCurrentUser}
            initialCount={comment.likesCount}
            isAuthenticated={isAuthenticated}
          />
          {isOwn && (
            <Button
              variant="ghost"
              size="xs"
              disabled={isPending}
              onClick={() => startTransition(async () => {
                await deleteComment(comment.id);
                router.refresh();
              })}
            >
              Delete
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
