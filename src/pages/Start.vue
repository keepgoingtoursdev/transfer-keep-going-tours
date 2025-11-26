<template>
  <div class="min-h-screen pt-32 pb-20 px-4">
    <div class="container mx-auto max-w-4xl">
      <div class="text-center mb-12">
        <h1 class="text-5xl font-bold mb-3">Bem-vindo</h1>
        <p class="text-xl text-muted-foreground">Escolha como deseja iniciar</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          class="card p-6 shadow-large hover:shadow-xl transition-smooth text-left"
          @click="goPassenger"
        >
          <div class="flex items-center mb-3">
            <span class="text-2xl font-bold">Passageiro do Cruzeiro</span>
          </div>
          <p class="text-muted-foreground">
            Ir para a Home para selecionar o tipo de orçamento.
          </p>
        </button>

        <button
          class="card p-6 shadow-large hover:shadow-xl transition-smooth text-left"
          @click="goAgency"
        >
          <div class="flex items-center mb-3">
            <span class="text-2xl font-bold">Agência de viagens</span>
          </div>
          <p class="text-muted-foreground">
            Inserir dados da agência e iniciar o orçamento.
          </p>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

function goPassenger() {
  router.push({ path: "/home" });
}

function goAgency() {
  router.push({ path: "/agencia" });
}
</script>
