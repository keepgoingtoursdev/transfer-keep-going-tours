<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-bold text-center mb-6">Passageiros</h2>
    <div class="space-y-4">
      <div>
        <label for="passengers" class="text-base mb-2 block"
          >Quantidade de Passageiros</label
        >
        <!-- Select nativo com estilização e ícone de passageiros -->
        <select
          id="passengers"
          v-model="calculatorStore.passengers"
          class="w-full h-12 pl-10 pr-10 border border-gray-200 rounded-md bg-white select-with-icon-users"
        >
          <option value="">Selecione</option>
          <option v-for="i in 20" :key="i" :value="i.toString()">
            {{ i }} passageiro{{ i > 1 ? "s" : "" }} {{ i === 1 ? "👤" : "👥" }}
          </option>
        </select>
      </div>
    </div>
    <div class="flex gap-4">
      <button class="btn btn-outline flex-1 text-lg" @click="$emit('prev')">
        Voltar
      </button>
      <button
        class="btn btn-primary gradient-ocean flex-1 text-lg"
        @click="$emit('next')"
      >
        Próximo
        <ArrowRight class="ml-2 h-5 w-5" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCalculatorStore } from "@/stores/calculator";
import { ArrowRight } from "lucide-vue-next";
const calculatorStore = useCalculatorStore();
</script>
