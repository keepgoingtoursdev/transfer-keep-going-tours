<template>
  <section class="min-h-screen relative overflow-hidden">
    <div class="absolute inset-0 gradient-hero opacity-50"></div>
    <div class="container mx-auto px-4 pt-28 pb-20 relative z-10">
      <div class="max-w-md mx-auto">
        <div class="text-center mb-6">
          <img
            src="/images/Logo_KG.png"
            class="w-48 mx-auto mb-2"
            alt="Logo Keep Going Tours"
          />
          <h1
            class="text-4xl font-bold mb-1 bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent"
          >
            Acesse sua conta
          </h1>
          <p class="text-muted-foreground">
            Entre para calcular e reservar seus transfers.
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
            <div>
              <label for="password" class="block text-sm font-medium mb-1"
                >Senha</label
              >
              <input
                v-model="password"
                type="password"
                required
                class="w-full h-12 px-3 border border-gray-200 rounded-md bg-white"
                placeholder="••••••••"
              />
            </div>
            <button
              class="btn w-full gradient-ocean text-white shadow-medium hover:shadow-large"
              :disabled="loading"
            >
              {{ loading ? "Entrando..." : "Entrar" }}
            </button>
          </form>
          <p class="text-sm text-muted-foreground mt-4 text-center">
            Não tem conta?
            <router-link
              class="text-brand-primary hover:underline"
              to="/cadastro"
              >Criar conta</router-link
            >
          </p>
          <p class="text-sm text-muted-foreground mt-2 text-center">
            Esqueceu sua senha?
            <router-link
              class="text-brand-primary hover:underline"
              to="/recuperar-senha"
              >Recuperar senha</router-link
            >
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useToastStore } from "@/stores/toast";
import { signInWithEmailPassword } from "@/services/auth";

const router = useRouter();
const route = useRoute();
const toast = useToastStore();

const email = ref("");
const password = ref("");
const loading = ref(false);

const onSubmit = async () => {
  if (!email.value || !password.value) return;
  loading.value = true;
  try {
    await signInWithEmailPassword(email.value, password.value);
    toast.success("Login realizado com sucesso!");
    const redirect = (route.query?.redirect as string) || "/";
    router.push(redirect);
  } catch (e: any) {
    console.error(e);
    toast.error(e?.message || "Falha no login");
  } finally {
    loading.value = false;
  }
};
</script>
