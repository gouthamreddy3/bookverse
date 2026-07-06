"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { setReadingGoal } from "@/features/profile/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ReadingGoalCard({
  goal,
  booksReadThisYear,
}: {
  goal: number | null;
  booksReadThisYear: number;
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(goal?.toString() ?? "");
  const [isPending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Number(value);
    startTransition(async () => {
      await setReadingGoal(Number.isFinite(parsed) && parsed > 0 ? parsed : null);
      setIsEditing(false);
      router.refresh();
    });
  };

  if (isEditing) {
    return (
      <form onSubmit={onSubmit} className="flex gap-2">
        <Input
          type="number"
          min={1}
          max={1000}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Books this year"
          autoFocus
        />
        <Button type="submit" disabled={isPending} size="sm">
          Save
        </Button>
      </form>
    );
  }

  if (!goal) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="text-sm font-medium text-muted-foreground underline underline-offset-4"
      >
        Set a reading goal
      </button>
    );
  }

  const percent = Math.min(100, Math.round((booksReadThisYear / goal) * 100));

  return (
    <button onClick={() => setIsEditing(true)} className="flex w-full flex-col gap-2 text-left">
      <div className="flex items-baseline justify-between">
        <span className="text-2xl font-semibold tabular-nums">
          {booksReadThisYear} / {goal}
        </span>
        <span className="text-xs text-muted-foreground">{percent}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
      </div>
    </button>
  );
}
