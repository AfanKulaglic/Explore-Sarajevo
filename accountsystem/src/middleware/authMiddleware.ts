import { supabase } from "@/lib/supabaseClient";

const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export async function checkAdminAuth(): Promise<{ isAuthenticated: boolean; email?: string }> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      return { isAuthenticated: false };
    }

    const userEmail = session.user.email?.toLowerCase();
    if (!userEmail || !adminEmails.includes(userEmail)) {
      return { isAuthenticated: false };
    }

    return { isAuthenticated: true, email: userEmail };
  } catch (error) {
    console.error("Auth check error:", error);
    return { isAuthenticated: false };
  }
}
