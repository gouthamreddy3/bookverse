"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { setReadingStatus } from "@/features/reading-lists/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const STATUS_LABELS: Record<string, string> = {
  WANT_TO_READ: "Want to Read",
  READING: "Reading",
  READ: "Read",
  DID_NOT_FINISH: "Did Not Finish",
  ON_HOLD: "On Hold",
};

export function ReadingStatusSelector({
  bookId,
  initialStatus,
}: {
  bookId: string;
  initialStatus: string | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [isPending, startTransition] = useTransition();

  const handleSelect = (next: string | null) => {
    startTransition(async () => {
      const result = await setReadingStatus({ bookId, status: next });
      if (result.success) {
        setStatus(next);
        router.refresh();
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" disabled={isPending} />}>
        {status ? STATUS_LABELS[status] : "Add to shelf"}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {Object.entries(STATUS_LABELS).map(([value, label]) => (
          <DropdownMenuItem key={value} onClick={() => handleSelect(value)}>
            {label}
          </DropdownMenuItem>
        ))}
        {status && (
          <DropdownMenuItem variant="destructive" onClick={() => handleSelect(null)}>
            Remove from shelf
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
