"use client";
import { useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function TestSession() {
  useEffect(() => {
    const supabase = createClientComponentClient();
    supabase.auth.getSession().then(({ data }) => {
      console.log("Client session:", data.session);
    });
  }, []);

  return <div>Check console</div>;
}
