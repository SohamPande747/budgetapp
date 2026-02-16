"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AuthStatus() {
  const [user, setUser] = useState<any>(null);

  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    getUser();
  }, []);

  return (
    <div>
      {user ? <p>Logged in as {user.email}</p> : <p>Not logged in</p>}
    </div>
  );
}