import { generateHTML } from "@tiptap/html";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { BookOpen, Heart, MessageCircle, User } from "lucide-react";

import { reviewEditorExtensions } from "@/features/reviews/editor-extensions";
import { getRecentReviews } from "@/features/reviews/queries";
import { StarRatingDisplay } from "@/features/reviews/components/star-rating-display";
import { formatRelativeTime } from "@/features/reviews/utils";
import { auth } from "@/lib/auth";

export const metadata: Metadata = { title: "Reviews" };

export default async function ReviewsPage() {
  const session = await auth();
  const reviews = await getRecentReviews(session?.user?.id ?? null);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-12">
      <div>
        <h1 className="font-serif text-3xl italic tracking-tight">Reviews</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          What readers are saying, across every book.
        </p>
      </div>

      {reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No reviews yet — be the first to{" "}
          <Link href="/books" className="font-medium underline underline-offset-4">
            find a book
          </Link>{" "}
          and write one.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {reviews.map((review) => {
            const html = generateHTML(JSON.parse(review.content), reviewEditorExtensions);
            const displayName =
              review.user.profile?.displayName ?? review.user.name ?? "Reader";

            return (
              <Link
                key={review.id}
                href={`/books/${review.book.slug}`}
                className="flex gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-muted/40"
              >
                <div className="relative aspect-[2/3] w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                  {review.book.coverImageUrl ? (
                    <Image
                      src={review.book.coverImageUrl}
                      alt=""
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <BookOpen className="size-4 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-1.5">
                  <p className="text-sm font-medium">{review.book.title}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="relative size-4 shrink-0 overflow-hidden rounded-full bg-muted">
                      {review.user.profile?.avatarUrl ? (
                        <Image
                          src={review.user.profile.avatarUrl}
                          alt=""
                          fill
                          sizes="16px"
                          className="object-cover"
                        />
                      ) : (
                        <User className="size-3" />
                      )}
                    </span>
                    {displayName}
                    {review.rating && <StarRatingDisplay value={Number(review.rating.value)} size="sm" />}
                    <span>{formatRelativeTime(review.createdAt)}</span>
                  </div>

                  {review.containsSpoilers ? (
                    <p className="text-sm italic text-muted-foreground">Contains spoilers</p>
                  ) : (
                    <div
                      className="line-clamp-3 text-sm text-foreground/90"
                      dangerouslySetInnerHTML={{ __html: html }}
                    />
                  )}

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Heart className="size-3" />
                      {review.likesCount}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MessageCircle className="size-3" />
                      {review.commentsCount}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
