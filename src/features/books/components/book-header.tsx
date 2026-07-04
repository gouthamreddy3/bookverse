import Image from "next/image";
import { BookOpen } from "lucide-react";

import { AuthorCard } from "@/features/books/components/author-card";
import type { BookDetail } from "@/features/books/types";

export function BookHeader({ book }: { book: BookDetail }) {
  const publishYear = book.publishedAt?.getUTCFullYear();

  return (
    <div className="flex flex-col gap-8 sm:flex-row">
      <div className="relative aspect-[2/3] w-40 shrink-0 overflow-hidden rounded-lg bg-muted sm:w-56">
        {book.coverImageUrl ? (
          <Image
            src={book.coverImageUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 160px, 224px"
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <BookOpen className="size-10 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4">
        <div>
          <h1 className="font-serif text-3xl italic tracking-tight">{book.title}</h1>
          {book.subtitle && (
            <p className="mt-1 text-lg text-muted-foreground">{book.subtitle}</p>
          )}
        </div>

        {book.authors.length > 0 && (
          <div className="flex flex-wrap gap-4">
            {book.authors.map((author) => (
              <AuthorCard key={author.id} author={author} />
            ))}
          </div>
        )}

        <dl className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
          {publishYear && (
            <div className="flex gap-1">
              <dt className="font-medium text-foreground">Published:</dt>
              <dd>{publishYear}</dd>
            </div>
          )}
          {book.isbn13 && (
            <div className="flex gap-1">
              <dt className="font-medium text-foreground">ISBN-13:</dt>
              <dd>{book.isbn13}</dd>
            </div>
          )}
          {book.isbn10 && (
            <div className="flex gap-1">
              <dt className="font-medium text-foreground">ISBN-10:</dt>
              <dd>{book.isbn10}</dd>
            </div>
          )}
        </dl>

        {book.genres.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {book.genres.map((genre) => (
              <span
                key={genre}
                className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
              >
                {genre}
              </span>
            ))}
          </div>
        )}

        {book.description && (
          <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">
            {book.description}
          </p>
        )}
      </div>
    </div>
  );
}
