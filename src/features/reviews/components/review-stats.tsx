import { Star } from "lucide-react";

export function ReviewStats({
  buckets,
  total,
  averageRating,
}: {
  buckets: number[];
  total: number;
  averageRating: number;
}) {
  if (total === 0) return null;

  const maxBucket = Math.max(...buckets, 1);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-semibold tabular-nums">{averageRating.toFixed(1)}</span>
        <Star className="size-5 fill-amber-400 text-amber-400" />
        <span className="text-sm text-muted-foreground">
          {total.toLocaleString()} rating{total === 1 ? "" : "s"}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1.5">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = buckets[star - 1] ?? 0;
          const widthPercent = (count / maxBucket) * 100;
          return (
            <div key={star} className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="w-3 shrink-0 tabular-nums">{star}</span>
              <div
                className="h-2 flex-1 overflow-hidden rounded-full bg-muted"
                title={`${count} ${star}-star rating${count === 1 ? "" : "s"}`}
              >
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${widthPercent}%` }}
                />
              </div>
              <span className="w-8 shrink-0 text-right tabular-nums">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
