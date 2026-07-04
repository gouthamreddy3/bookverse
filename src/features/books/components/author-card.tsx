import Image from "next/image";
import { User } from "lucide-react";

import type { AuthorSummary } from "@/features/books/types";

export function AuthorCard({ author }: { author: AuthorSummary }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative size-10 shrink-0 overflow-hidden rounded-full bg-muted">
        {author.photoUrl ? (
          <Image src={author.photoUrl} alt="" fill sizes="40px" className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <User className="size-5 text-muted-foreground" />
          </div>
        )}
      </div>
      <p className="text-sm font-medium">{author.name}</p>
    </div>
  );
}
