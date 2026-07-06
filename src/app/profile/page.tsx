import { redirect } from "next/navigation";

import { getOwnUsername } from "@/features/profile/queries";
import { auth } from "@/lib/auth";

export default async function OwnProfileRedirectPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const username = await getOwnUsername(session.user.id);
  redirect(username ? `/u/${username}` : "/settings");
}
