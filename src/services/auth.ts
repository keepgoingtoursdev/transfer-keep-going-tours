import { supabase } from "@/lib/supabaseClient";

export type UserProfile = {
  id?: string; // auth uid
  name: string;
  email: string;
  roles?: ("user" | "admin")[]; // optional, default handled as ['user']
  address_street?: string | null;
  address_number?: string | null;
  address_complement?: string | null;
  address_neighborhood?: string | null;
  address_city?: string | null;
  address_state?: string | null;
  address_zip?: string | null;
  address_country?: string | null;
};

export async function signInWithEmailPassword(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  return true;
}

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session || null;
}

export async function signUpWithProfile(
  profile: UserProfile,
  password: string,
) {
  // Cria usuário de auth
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: profile.email,
    password,
  });
  if (signUpError) throw signUpError;

  const userId = signUpData.user?.id;
  if (!userId) throw new Error("Falha ao criar usuário");

  // Upsert em tabela 'users' (perfil)
  const payload = {
    id: userId,
    name: profile.name,
    email: profile.email,
    password_hash: "managed_by_supabase_auth", // gerenciado pelo Supabase Auth
    roles: profile.roles && profile.roles.length > 0 ? profile.roles : ["user"],
    address_street: profile.address_street || null,
    address_number: profile.address_number || null,
    address_complement: profile.address_complement || null,
    address_neighborhood: profile.address_neighborhood || null,
    address_city: profile.address_city || null,
    address_state: profile.address_state || null,
    address_zip: profile.address_zip || null,
    address_country: profile.address_country || "Brasil",
  } as any;

  const { error: upsertError } = await supabase.from("users").upsert(payload, {
    onConflict: "id",
  });
  if (upsertError) throw upsertError;

  return signUpData;
}

// Recuperação de senha (envia e-mail com link de redefinição)
export async function requestPasswordReset(email: string, redirectTo?: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectTo || `${window.location.origin}/redefinir-senha`,
  });
  if (error) throw error;
  return data;
}

// Atualiza a senha do usuário após abrir o link de recuperação
export async function updatePassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (error) throw error;
  return data;
}

export type ViaCepResponse = {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string; // cidade
  uf: string; // estado
  ibge?: string;
  gia?: string;
  ddd?: string;
  siafi?: string;
  erro?: boolean;
};

export async function fetchViaCep(
  cepRaw: string,
): Promise<ViaCepResponse | null> {
  const cep = (cepRaw || "").replace(/\D/g, "").slice(0, 8);
  if (cep.length !== 8) return null;
  const url = `https://viacep.com.br/ws/${cep}/json/`;
  try {
    const res = await fetch(url);
    const json = (await res.json()) as ViaCepResponse;
    if ((json as any).erro) return null;
    return json;
  } catch (e) {
    console.warn("[ViaCEP] Falha ao consultar CEP:", e);
    return null;
  }
}
