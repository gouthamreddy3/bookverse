"use client";

import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";

import { toggleLike } from "@/features/reviews/actions";
import { cn } from "@/lib/utils";

export function LikeButton({
  likeableType,
  likeableId,
  initialLiked,
  initialCount,
  isAuthenticated,
}: {
  likeableType: "REVIEW" | "COMMENT";
  likeableId: string;
  initialLiked: boolean;
  initialCount: number;
  isAuthenticated: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [state, setState] = useState({ liked: initialLiked, count: initialCount });
  const [optimisticState, setOptimisticState] = useOptimistic(
    state,
    (_current, liked: boolean) => ({
      liked,
      count: state.count + (liked ? 1 : -1),
    })
  );

  const handleClick = () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    startTransition(async () => {
      setOptimisticState(!state.liked);
      const result = await toggleLike(likeableType, likeableId);
      if (result.success) {
        setState({ liked: result.liked, count: result.likesCount });
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        optimisticState.liked && "text-rose-500 hover:text-rose-500"
      )}
      aria-pressed={optimisticState.liked}
      aria-label={optimisticState.liked ? "Unlike" : "Like"}
    >
      <Heart className={cn("size-3.5", optimisticState.liked && "fill-rose-500")} />
      {optimisticState.count > 0 && optimisticState.count}
    </button>
  );
}
