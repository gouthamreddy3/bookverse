"use client";

import { Star } from "lucide-react";
import { useState } from "react";

export function StarRatingInput({
  value,
  onChange,
  disabled = false,
}: {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const displayValue = hoverValue ?? value;

  return (
    <div
      className="inline-flex items-center gap-0.5"
      role="radiogroup"
      aria-label="Rate this book"
      onMouseLeave={() => setHoverValue(null)}
    >
      {Array.from({ length: 5 }, (_, i) => {
        const starNumber = i + 1;
        const fill = Math.max(0, Math.min(1, displayValue - i)) * 100;

        return (
          <div key={i} className="relative size-7">
            <Star className="size-7 text-muted-foreground/30" />
            <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ width: `${fill}%` }}>
              <Star className="size-7 fill-amber-400 text-amber-400" />
            </div>
            {(["left", "right"] as const).map((half) => (
              <button
                key={half}
                type="button"
                disabled={disabled}
                className="absolute inset-y-0 w-1/2 disabled:cursor-not-allowed"
                style={half === "right" ? { left: "50%" } : { left: 0 }}
                aria-label={`Rate ${half === "left" ? starNumber - 0.5 : starNumber} stars`}
                onMouseEnter={() => setHoverValue(half === "left" ? starNumber - 0.5 : starNumber)}
                onClick={() => onChange(half === "left" ? starNumber - 0.5 : starNumber)}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
