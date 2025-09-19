// app/login/callback/page.

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";

export default function GoogleCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already signed in
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.push("/home");
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        router.push("/home");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <p>Loading...</p>
    </div>
  );
}
