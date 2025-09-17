"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
export default function GoogleCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    async function handleUser() {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user) {
          router.push("/"); // redirect to home if failed
          return;
        }

        // Insert or update user in your table
        await supabase.from("profiles").upsert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata.full_name,
          avatar_url: user.user_metadata.avatar_url,
        });

        router.push("/dashboard"); // redirect to dashboard if success
      } catch (err) {
        router.push("/"); // redirect to home on error
      }
    }

    handleUser();
  }, [router]);

  return null; // nothing to render
}