import { supabase } from "@/lib/supabaseClient";

export type AdminUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  roles?: string[] | null;
};

export async function listUsers(): Promise<AdminUser[]> {
  const { data, error } = await supabase
    .from("users")
    .select("id, name, email, roles")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as AdminUser[];
}

export async function setUserRoles(userId: string, roles: string[]) {
  if (!roles || roles.length === 0) roles = ["user"]; // evitar array vazio
  const { error } = await supabase
    .from("users")
    .update({ roles })
    .eq("id", userId);
  if (error) throw error;
  return true;
}

export async function promoteToAdmin(user: AdminUser) {
  const current = Array.isArray(user.roles) ? user.roles : [];
  if (!current.includes("admin")) current.push("admin");
  // garantir que 'user' exista
  if (!current.includes("user")) current.unshift("user");
  return setUserRoles(user.id, current);
}

export async function demoteFromAdmin(user: AdminUser) {
  const current = Array.isArray(user.roles) ? user.roles : ["user"];
  const filtered = current.filter((r) => r !== "admin");
  // garantir pelo menos 'user'
  if (filtered.length === 0) filtered.push("user");
  return setUserRoles(user.id, filtered);
}
