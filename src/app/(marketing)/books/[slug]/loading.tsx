export default function BookDetailLoading() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex flex-col gap-8 sm:flex-row">
        <div className="aspect-[2/3] w-40 shrink-0 animate-pulse rounded-lg bg-muted sm:w-56" />
        <div className="flex flex-1 flex-col gap-4">
          <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-5 w-1/2 animate-pulse rounded bg-muted" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
          <div className="h-24 w-full animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}
