"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    async function handleAuth() {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error(error);
        return;
      }

      if (data.session) {
        // ✅ user is signed in
        console.log("User:", data.session.user);
        router.push("/dashboard"); // redirect to dashboard or home
      }
    }

    handleAuth();
  }, [router]);

  return <p>Loading...</p>;
}
