import Link from "next/link";
import Image from "next/image";
import { BookOpen } from "lucide-react";

import type { BookSearchResult } from "@/features/books/types";

export function BookCard({ book }: { book: BookSearchResult }) {
  return (
    <Link
      href={`/books/${book.slug}`}
      className="group flex flex-col gap-2 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-muted">
        {book.coverImageUrl ? (
          <Image
            src={book.coverImageUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 15vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <BookOpen className="size-8 text-muted-foreground" />
          </div>
        )}
      </div>
      <div>
        <p className="line-clamp-2 text-sm font-medium leading-snug">{book.title}</p>
        <p className="line-clamp-1 text-xs text-muted-foreground">
          {book.authorNames.join(", ") || "Unknown author"}
          {book.firstPublishYear ? ` · ${book.firstPublishYear}` : ""}
        </p>
      </div>
    </Link>
  );
}
