"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

export function ReviewContent({
  html,
  containsSpoilers,
}: {
  html: string;
  containsSpoilers: boolean;
}) {
  const [revealed, setRevealed] = useState(!containsSpoilers);

  return (
    <div className="relative">
      <div
        className={cn(
          "text-sm leading-relaxed text-foreground/90 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:italic [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5",
          !revealed && "pointer-events-none select-none blur-sm"
        )}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {!revealed && (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="absolute inset-0 flex items-center justify-center rounded-md bg-background/70 text-sm font-medium"
        >
          Contains spoilers — click to reveal
        </button>
      )}
    </div>
  );
}
