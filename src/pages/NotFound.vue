<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="text-center">
      <div class="mb-8">
        <Ship class="h-32 w-32 text-brand-primary mx-auto mb-6 opacity-50" />
        <h1 class="text-9xl font-bold text-brand-primary mb-4">404</h1>
        <h2 class="text-3xl font-bold mb-4">Página Não Encontrada</h2>
        <p class="text-xl text-muted-foreground mb-8 max-w-md mx-auto">
          Ops! Parece que você navegou para águas desconhecidas. A página que
          você procura não existe.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Ship } from "lucide-vue-next";
</script>
