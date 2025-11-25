import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { supabase } from "@/lib/supabaseClient";
import { signOut as authSignOut } from "@/services/auth";
import { useToastStore } from "@/stores/toast";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<null | { id: string; email?: string }>(null);
  // Suporta tanto a coluna legada "role" (string) quanto a nova "roles" (array)
  const profile = ref<null | {
    name?: string;
    email?: string;
    roles?: string[];
    address_city?: string;
    address_state?: string;
  }>(null);
  const loading = ref(false);
  const toast = useToastStore();

  // Cache local simples para reduzir refresh de dados em tela
  const CACHE_KEYS = {
    user: "kg_cache_user",
    profile: "kg_cache_profile",
    updatedAt: "kg_cache_profile_updated_at",
  } as const;
  const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutos

  function readCache<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  function writeCache(key: string, value: unknown) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignora erros de storage (quota, privacy)
    }
  }

  function isStale(updatedAtMs?: number, ttlMs: number = DEFAULT_TTL_MS) {
    if (!updatedAtMs) return true;
    const now = Date.now();
    return now - updatedAtMs > ttlMs;
  }

  function shallowEqual(a: any, b: any) {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  const isAuthenticated = computed(() => !!user.value);

  async function loadSession() {
    loading.value = true;
    try {
      // 1) Carrega do cache imediatamente (SWR: mostra já o dado)
      const cachedUser = readCache<{ id: string; email?: string }>(
        CACHE_KEYS.user,
      );
      const cachedProfile = readCache<{
        name?: string;
        email?: string;
        roles?: string[];
      }>(CACHE_KEYS.profile);
      const cachedUpdatedAt =
        readCache<number>(CACHE_KEYS.updatedAt) || undefined;
      if (cachedUser) user.value = cachedUser;
      if (cachedProfile) profile.value = cachedProfile;

      // 2) Revalida sessão e perfil apenas se estiver stale ou se não há cache
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        // Exibe toast para caso de sessão expirada (ex.: 401)
        if ((error as any).status === 401) {
          toast.warning("Sessão expirada. Faça login novamente.");
        }
        user.value = null;
        profile.value = null;
        writeCache(CACHE_KEYS.user, null);
        writeCache(CACHE_KEYS.profile, null);
        writeCache(CACHE_KEYS.updatedAt, Date.now());
        return;
      }
      const u = data.user;
      const nextUser = u ? { id: u.id, email: u.email || undefined } : null;
      if (!shallowEqual(user.value, nextUser)) {
        user.value = nextUser;
        writeCache(CACHE_KEYS.user, nextUser);
      }
      // Se usuário existe e dados estão stale, busca perfil
      const shouldFetchProfile =
        !!u && (isStale(cachedUpdatedAt) || !cachedProfile);
      if (!shouldFetchProfile) {
        return; // mantém perfil do cache para evitar refresh
      }
      if (u) {
        // carrega perfil da tabela users (name, role, roles, email)
        const { data: p } = await supabase
          .from("users")
          .select("name,roles, email")
          .eq("id", u.id)
          .maybeSingle();
        if (p) {
          const nextProfile = {
            name: (p as any).name || undefined,
            roles: (p as any).roles || undefined,
            email: (p as any).email || u.email || undefined,
          };
          if (!shallowEqual(profile.value, nextProfile)) {
            profile.value = nextProfile;
            writeCache(CACHE_KEYS.profile, nextProfile);
            writeCache(CACHE_KEYS.updatedAt, Date.now());
          }
        }
      }
    } finally {
      loading.value = false;
    }
  }

  function startAuthListener() {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        // Quando o usuário entra via link de recuperação de senha
        toast.info("Link de recuperação validado. Redefina sua senha.");
      }
      const u = session?.user;
      const nextUser = u ? { id: u.id, email: u.email || undefined } : null;
      if (!shallowEqual(user.value, nextUser)) {
        user.value = nextUser;
        writeCache(CACHE_KEYS.user, nextUser);
      }
      if (!session && event === "SIGNED_OUT") {
        toast.info("Você foi desconectado. Até breve!");
        profile.value = null;
        writeCache(CACHE_KEYS.profile, null);
        writeCache(CACHE_KEYS.updatedAt, Date.now());
      }
      // Atualiza nome/role/roles quando sessão muda
      if (u) {
        supabase
          .from("users")
          .select("name, roles, email,address_city,address_state")
          .eq("id", u.id)
          .maybeSingle()
          .then(({ data }) => {
            if (data) {
              const nextProfile = {
                name: (data as any).name || undefined,
                roles: (data as any).roles || undefined,
                email: (data as any).email || u.email || undefined,
                address_city: (data as any).address_city || undefined,
                address_state: (data as any).address_state || undefined,
              };
              // Só atualiza se houve mudança (evita refresh visual)
              if (!shallowEqual(profile.value, nextProfile)) {
                profile.value = nextProfile;
                writeCache(CACHE_KEYS.profile, nextProfile);
                writeCache(CACHE_KEYS.updatedAt, Date.now());
              }
            }
          });
      }
    });
  }

  async function signOut() {
    await authSignOut();
    user.value = null;
    profile.value = null;
    writeCache(CACHE_KEYS.user, null);
    writeCache(CACHE_KEYS.profile, null);
    writeCache(CACHE_KEYS.updatedAt, Date.now());
  }

  // Initialize
  (function init() {
    // Inicializa com cache, depois revalida de forma inteligente
    const cachedUser = readCache<{ id: string; email?: string }>(
      CACHE_KEYS.user,
    );
    const cachedProfile = readCache<{
      name?: string;
      email?: string;
      roles?: string[];
      address_city?: string;
      address_state?: string;
    }>(CACHE_KEYS.profile);
    if (cachedUser) user.value = cachedUser;
    if (cachedProfile) profile.value = cachedProfile;

    loadSession();
    startAuthListener();
  })();

  const isAdmin = computed(() => {
    const p = profile.value;
    if (!p) return false;
    if (Array.isArray(p.roles)) {
      return p.roles.includes("admin");
    }
    return false;
  });

  return {
    user,
    profile,
    loading,
    isAuthenticated,
    isAdmin,
    loadSession,
    signOut,
  };
});
