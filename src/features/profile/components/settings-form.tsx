"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { Profile } from "@prisma/client";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { updateProfile } from "@/features/profile/actions";
import { updateProfileSchema, type UpdateProfileInput } from "@/features/profile/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function SettingsForm({ profile }: { profile: Profile }) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError: setFieldError,
    formState: { errors },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      displayName: profile.displayName ?? "",
      bio: profile.bio ?? "",
      location: profile.location ?? "",
      websiteUrl: profile.websiteUrl ?? "",
      pronouns: profile.pronouns ?? "",
      avatarUrl: profile.avatarUrl ?? "",
      bannerUrl: profile.bannerUrl ?? "",
    },
  });

  const onSubmit = (data: UpdateProfileInput) => {
    setStatus("idle");
    setError(null);
    startTransition(async () => {
      const result = await updateProfile(data);
      if (!result.success) {
        setStatus("error");
        setError(result.error);
        for (const [field, messages] of Object.entries(result.fieldErrors ?? {})) {
          if (messages?.[0]) {
            setFieldError(field as keyof UpdateProfileInput, { message: messages[0] });
          }
        }
        return;
      }
      setStatus("saved");
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="displayName">Display name</Label>
        <Input id="displayName" {...register("displayName")} />
        {errors.displayName && (
          <p className="text-sm text-destructive">{errors.displayName.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" rows={3} {...register("bio")} />
        {errors.bio && <p className="text-sm text-destructive">{errors.bio.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="pronouns">Pronouns</Label>
        <Input id="pronouns" {...register("pronouns")} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="location">Location</Label>
        <Input id="location" {...register("location")} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="websiteUrl">Website</Label>
        <Input id="websiteUrl" type="url" placeholder="https://" {...register("websiteUrl")} />
        {errors.websiteUrl && (
          <p className="text-sm text-destructive">{errors.websiteUrl.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="avatarUrl">Avatar URL</Label>
        <Input id="avatarUrl" type="url" placeholder="https://" {...register("avatarUrl")} />
        {errors.avatarUrl && (
          <p className="text-sm text-destructive">{errors.avatarUrl.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bannerUrl">Banner URL</Label>
        <Input id="bannerUrl" type="url" placeholder="https://" {...register("bannerUrl")} />
        {errors.bannerUrl && (
          <p className="text-sm text-destructive">{errors.bannerUrl.message}</p>
        )}
      </div>

      {status === "error" && error && <p className="text-sm text-destructive">{error}</p>}
      {status === "saved" && <p className="text-sm text-emerald-600">Profile updated.</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
