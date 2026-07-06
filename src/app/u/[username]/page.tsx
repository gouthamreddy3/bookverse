import { generateHTML } from "@tiptap/html";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BookOpen, Link as LinkIcon, MapPin, User } from "lucide-react";

import { reviewEditorExtensions } from "@/features/reviews/editor-extensions";
import { getProfileByUsername, getRecentReviewsByUser } from "@/features/profile/queries";
import { StarRatingDisplay } from "@/features/reviews/components/star-rating-display";
import { formatRelativeTime } from "@/features/reviews/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  return { title: profile?.displayName ?? profile?.username ?? "Profile" };
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  if (!profile) notFound();

  const reviews = await getRecentReviewsByUser(profile.userId);
  const displayName = profile.displayName ?? profile.user.name ?? profile.username;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-4">
        <div className="relative h-32 w-full overflow-hidden rounded-xl bg-gradient-to-br from-muted to-muted/50 sm:h-44">
          {profile.bannerUrl && (
            <Image src={profile.bannerUrl} alt="" fill className="object-cover" />
          )}
        </div>

        <div className="flex items-start gap-4">
          <div className="relative -mt-12 size-20 shrink-0 overflow-hidden rounded-full border-4 border-background bg-muted">
            {profile.avatarUrl ? (
              <Image src={profile.avatarUrl} alt="" fill sizes="80px" className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <User className="size-8 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-semibold">{displayName}</h1>
            <p className="text-sm text-muted-foreground">
              @{profile.username}
              {profile.pronouns ? ` · ${profile.pronouns}` : ""}
            </p>
          </div>
        </div>

        {profile.bio && <p className="text-sm text-foreground/90">{profile.bio}</p>}

        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          {profile.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3" />
              {profile.location}
            </span>
          )}
          {profile.websiteUrl && (
            <a
              href={profile.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 underline underline-offset-4"
            >
              <LinkIcon className="size-3" />
              {profile.websiteUrl.replace(/^https?:\/\//, "")}
            </a>
          )}
        </div>

        <dl className="flex gap-6 text-sm">
          <div>
            <dt className="font-semibold">{profile.booksReadCount}</dt>
            <dd className="text-xs text-muted-foreground">Books read</dd>
          </div>
          <div>
            <dt className="font-semibold">{profile.reviewsCount}</dt>
            <dd className="text-xs text-muted-foreground">Reviews</dd>
          </div>
          <div>
            <dt className="font-semibold">{profile.followersCount}</dt>
            <dd className="text-xs text-muted-foreground">Followers</dd>
          </div>
          <div>
            <dt className="font-semibold">{profile.followingCount}</dt>
            <dd className="text-xs text-muted-foreground">Following</dd>
          </div>
        </dl>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Recent reviews</h2>
        {reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reviews yet.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {reviews.map((review) => {
              const html = generateHTML(JSON.parse(review.content), reviewEditorExtensions);
              return (
                <Link
                  key={review.id}
                  href={`/books/${review.book.slug}`}
                  className="flex gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/40"
                >
                  <div className="relative aspect-[2/3] w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                    {review.book.coverImageUrl ? (
                      <Image
                        src={review.book.coverImageUrl}
                        alt=""
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <BookOpen className="size-3 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{review.book.title}</p>
                      {review.rating && (
                        <StarRatingDisplay value={Number(review.rating.value)} size="sm" />
                      )}
                    </div>
                    {review.containsSpoilers ? (
                      <p className="text-xs italic text-muted-foreground">Contains spoilers</p>
                    ) : (
                      <div
                        className="line-clamp-2 text-xs text-foreground/80"
                        dangerouslySetInnerHTML={{ __html: html }}
                      />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(review.createdAt)}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
