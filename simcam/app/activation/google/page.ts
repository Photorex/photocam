"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function CheckNewUserPage() {
  const { data: session, status, update } = useSession();
  const search       = useSearchParams();
  const returnToRaw  = search.get('return');
  const returnTo     = returnToRaw ? decodeURIComponent(returnToRaw) : undefined;
  const router  = useRouter();

  useEffect(() => {
    if (status !== "authenticated") return;

    const fetchFreshUserData = async () => {
      try {
        const res = await fetch(`/api/user/${session?.user?.id}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) throw new Error("Failed to fetch user info");

        const { user } = await res.json();

        await update({
          user: {
            ...session.user,
            isNewUser: user.isNewUser,
          },
        });

        if (returnTo) {
            router.replace(returnTo);
            return;
        }

        router.replace(user.isNewUser ? "/onboarding" : "/photoshoot");

      } catch (err) {
        console.error("Redirect check failed:", err);
        router.replace("/photoshoot"); // fallback route
      }
    };

    fetchFreshUserData();
  }, [status, session?.user?.id]);

  return null;
}