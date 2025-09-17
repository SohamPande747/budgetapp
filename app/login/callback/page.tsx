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
      const { data: { user }, error } = await supabase.auth.getUser();

      if (user) {
        // Insert into your table
        await supabase.from("profiles").upsert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata.full_name,
          avatar_url: user.user_metadata.avatar_url,
        });
      }

      router.push("/dashboard"); // redirect to your dashboard
    }

    handleUser();
  }, [router]);

  return <p>Logging in...</p>;
}
