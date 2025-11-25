<template>
  <section class="min-h-screen relative overflow-hidden">
    <div class="absolute inset-0 gradient-hero opacity-50"></div>
    <div class="container mx-auto px-4 pt-28 pb-20 relative z-10">
      <div class="max-w-md mx-auto">
        <div class="text-center mb-6">
          <h1
            class="text-4xl font-bold mb-1 bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent"
          >
            Redefinir senha
          </h1>
          <p class="text-muted-foreground">Defina sua nova senha.</p>
        </div>
        <div
          class="p-6 rounded-xl border shadow-medium bg-white/90 ring-1 ring-brand-primary/10"
        >
          <form class="space-y-4" @submit.prevent="onSubmit">
            <div>
              <label class="block text-sm font-medium mb-1">Nova senha</label>
              <input
                v-model="password"
                type="password"
                required
                minlength="6"
                class="w-full h-12 px-3 border border-gray-200 rounded-md bg-white"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1"
                >Confirmar nova senha</label
              >
              <input
                v-model="confirm"
                type="password"
                required
                minlength="6"
                class="w-full h-12 px-3 border border-gray-200 rounded-md bg-white"
                placeholder="••••••••"
              />
            </div>
            <button
              class="btn w-full gradient-ocean text-white shadow-medium hover:shadow-large"
              :disabled="loading"
            >
              {{ loading ? "Salvando..." : "Salvar nova senha" }}
            </button>
          </form>
          <p class="text-sm text-muted-foreground mt-4 text-center">
            Ao salvar, você poderá fazer login normalmente.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useToastStore } from "@/stores/toast";
import { updatePassword } from "@/services/auth";
import { supabase } from "@/lib/supabaseClient";

const router = useRouter();
const toast = useToastStore();
const password = ref("");
const confirm = ref("");
const loading = ref(false);

onMounted(() => {
  // Opcional: se quiser exibir um aviso quando estiver no modo recovery
  supabase.auth.onAuthStateChange((event) => {
    if (event === "PASSWORD_RECOVERY") {
      toast.info("Link de recuperação validado. Defina sua nova senha.");
    }
  });
});

const onSubmit = async () => {
  if (!password.value || password.value.length < 6) {
    toast.warning("A senha deve ter ao menos 6 caracteres.");
    return;
  }
  if (password.value !== confirm.value) {
    toast.warning("As senhas não coincidem.");
    return;
  }
  loading.value = true;
  try {
    await updatePassword(password.value);
    toast.success("Senha atualizada com sucesso!");
    router.push({ path: "/admin/login" });
  } catch (e: any) {
    console.error(e);
    toast.error(e?.message || "Falha ao atualizar senha");
  } finally {
    loading.value = false;
  }
};
</script>
