"use client";

import { Button } from "@/components/ui/button";

export default function BooksSearchError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-6 py-24 text-center">
      <h1 className="text-xl font-semibold">Something went wrong searching for books</h1>
      <p className="text-sm text-muted-foreground">
        Open Library might be temporarily unavailable. Please try again.
      </p>
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  );
}
