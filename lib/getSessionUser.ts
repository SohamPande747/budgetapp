import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function getSessionUser() {
  // create a Supabase client bound to cookies (so it knows the session)
  const supabase = createRouteHandlerClient({ cookies });

  // fetch the currently signed-in user
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // return null if no user or error
  if (error || !user) return null;
  return user;
}
