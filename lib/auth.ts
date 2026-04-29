import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  full_name: string | null;
  role: "team" | "client";
  client_id: string | null;
  email: string;
};

export async function getProfile(): Promise<Profile> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/signin");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, full_name, role, client_id")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    // Profile row missing — sign out and start over.
    await supabase.auth.signOut();
    redirect("/auth/signin?error=profile_missing");
  }

  return { ...profile, email: user.email ?? "" };
}

export async function requireTeam(): Promise<Profile> {
  const profile = await getProfile();
  if (profile.role !== "team") redirect("/");
  return profile;
}

export async function requireClient(): Promise<Profile> {
  const profile = await getProfile();
  if (profile.role !== "client") redirect("/");
  return profile;
}
