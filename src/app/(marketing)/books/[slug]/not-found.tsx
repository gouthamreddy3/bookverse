import Link from "next/link";

export default function BookNotFound() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-6 py-24 text-center">
      <h1 className="text-xl font-semibold">Book not found</h1>
      <p className="text-sm text-muted-foreground">
        We couldn&apos;t find that book on Open Library.
      </p>
      <Link href="/books" className="text-sm font-medium underline underline-offset-4">
        Back to search
      </Link>
    </div>
  );
}
