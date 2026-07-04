import { Star } from "lucide-react";

const SIZES = {
  sm: "size-3.5",
  md: "size-5",
} as const;

export function StarRatingDisplay({
  value,
  size = "md",
}: {
  value: number;
  size?: keyof typeof SIZES;
}) {
  const sizeClass = SIZES[size];

  return (
    <div className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => {
        const fill = Math.max(0, Math.min(1, value - i)) * 100;
        return (
          <div key={i} className="relative">
            <Star className={`${sizeClass} text-muted-foreground/30`} />
            <div className="absolute inset-0 overflow-hidden" style={{ width: `${fill}%` }}>
              <Star className={`${sizeClass} fill-amber-400 text-amber-400`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
