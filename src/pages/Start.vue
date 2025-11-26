<template>
  <div class="min-h-screen pt-32 pb-20 px-4">
    <div class="container mx-auto max-w-5xl">
      <div class="text-center mb-12">
        <h1 class="text-5xl font-bold mb-3">Bem-vindo</h1>
        <p class="text-xl text-muted-foreground">Escolha como deseja iniciar</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <button
          class="card p-8 min-h-[200px] shadow-large hover:shadow-xl transition-smooth text-left"
          @click="goPassenger"
        >
          <div class="flex items-center gap-4">
            <Ship class="h-10 w-10 text-brand-primary" />
            <span class="text-3xl font-bold">Passageiro do Cruzeiro</span>
          </div>
        </button>

        <button
          class="card p-8 min-h-[200px] shadow-large hover:shadow-xl transition-smooth text-left"
          @click="goAgency"
        >
          <div class="flex items-center gap-4">
            <Building2 class="h-10 w-10 text-brand-primary" />
            <span class="text-3xl font-bold">Agência de viagens</span>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { Ship, Building2 } from "lucide-vue-next";

const router = useRouter();

function goPassenger() {
  router.push({ path: "/home" });
}

function goAgency() {
  router.push({ path: "/agencia" });
}
</script>
