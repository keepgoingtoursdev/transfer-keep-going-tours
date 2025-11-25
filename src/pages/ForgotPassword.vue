<template>
  <section class="min-h-screen relative overflow-hidden">
    <div class="absolute inset-0 gradient-hero opacity-50"></div>
    <div class="container mx-auto px-4 pt-28 pb-20 relative z-10">
      <div class="max-w-md mx-auto">
        <div class="text-center mb-6">
          <h1
            class="text-4xl font-bold mb-1 bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent"
          >
            Recuperar senha
          </h1>
          <p class="text-muted-foreground">
            Informe seu e-mail para receber o link de redefinição de senha.
          </p>
        </div>
        <div
          class="p-6 rounded-xl border shadow-medium bg-white/90 ring-1 ring-brand-primary/10"
        >
          <form class="space-y-4" @submit.prevent="onSubmit">
            <div>
              <label for="email" class="block text-sm font-medium mb-1"
                >E-mail</label
              >
              <input
                v-model="email"
                type="email"
                required
                class="w-full h-12 px-3 border border-gray-200 rounded-md bg-white"
                placeholder="seu@email.com"
              />
            </div>
            <button
              class="btn w-full gradient-ocean text-white shadow-medium hover:shadow-large"
              :disabled="loading"
            >
              {{ loading ? "Enviando..." : "Enviar link" }}
            </button>
          </form>
          <p class="text-sm text-muted-foreground mt-4 text-center">
            Lembrou a senha?
            <router-link
              class="text-brand-primary hover:underline"
              to="/admin/login"
              >Voltar ao login</router-link
            >
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useToastStore } from "@/stores/toast";
import { requestPasswordReset } from "@/services/auth";

const email = ref("");
const loading = ref(false);
const toast = useToastStore();

const onSubmit = async () => {
  if (!email.value) return;
  loading.value = true;
  try {
    await requestPasswordReset(email.value);
    toast.success("Enviamos um e-mail com o link de redefinição de senha.");
  } catch (e: any) {
    console.error(e);
    toast.error(e?.message || "Falha ao enviar link de recuperação");
  } finally {
    loading.value = false;
  }
};
</script>
