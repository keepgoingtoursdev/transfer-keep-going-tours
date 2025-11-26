<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-bold text-center mb-6">Tipo de Serviço</h2>
    <div class="space-y-4">
      <!-- Somente Ida -->
      <label
        for="oneway"
        :class="[
          'flex items-center space-x-3 border-2 rounded-lg p-4 cursor-pointer transition-smooth',
          calculatorStore.tripType === 'oneway'
            ? 'border-brand-primary bg-brand-primary/5'
            : 'border-gray-200',
        ]"
        @click="calculatorStore.setTripType('oneway')"
      >
        <input
          id="oneway"
          v-model="calculatorStore.tripType"
          type="radio"
          value="oneway"
          class="sr-only"
        />
        <div
          class="w-4 h-4 border-2 border-brand-primary rounded-full flex items-center justify-center"
        >
          <div
            v-if="calculatorStore.tripType === 'oneway'"
            class="w-2 h-2 bg-brand-primary rounded-full"
          />
        </div>
        <div>
          <div class="font-semibold">Somente Ida</div>
          <div class="text-sm text-muted-foreground">Trajeto único</div>
        </div>
      </label>

      <!-- Somente Volta -->
      <label
        for="returnonly"
        :class="[
          'flex items-center space-x-3 border-2 rounded-lg p-4 cursor-pointer transition-smooth',
          calculatorStore.tripType === 'returnonly'
            ? 'border-brand-primary bg-brand-primary/5'
            : 'border-gray-200',
        ]"
        @click="calculatorStore.setTripType('returnonly')"
      >
        <input
          id="returnonly"
          v-model="calculatorStore.tripType"
          type="radio"
          value="returnonly"
          class="sr-only"
        />
        <div
          class="w-4 h-4 border-2 border-brand-primary rounded-full flex items-center justify-center"
        >
          <div
            v-if="calculatorStore.tripType === 'returnonly'"
            class="w-2 h-2 bg-brand-primary rounded-full"
          />
        </div>
        <div>
          <div class="font-semibold">Somente Volta</div>
          <div class="text-sm text-muted-foreground">
            Porto de Santos → seu destino
          </div>
        </div>
      </label>

      <!-- Ida e Volta -->
      <label
        for="roundtrip"
        :class="[
          'flex items-center space-x-3 border-2 rounded-lg p-4 cursor-pointer transition-smooth',
          calculatorStore.tripType === 'roundtrip'
            ? 'border-brand-primary bg-brand-primary/5'
            : 'border-gray-200',
        ]"
        @click="calculatorStore.setTripType('roundtrip')"
      >
        <input
          id="roundtrip"
          v-model="calculatorStore.tripType"
          type="radio"
          value="roundtrip"
          class="sr-only"
        />
        <div
          class="w-4 h-4 border-2 border-brand-primary rounded-full flex items-center justify-center"
        >
          <div
            v-if="calculatorStore.tripType === 'roundtrip'"
            class="w-2 h-2 bg-brand-primary rounded-full"
          />
        </div>
        <div>
          <div class="font-semibold">Ida e Volta</div>
          <div class="text-sm text-muted-foreground">Trajeto completo</div>
        </div>
      </label>
    </div>
    <button
      class="btn btn-primary gradient-ocean w-full text-lg"
      @click="$emit('next')"
    >
      Próximo
      <ArrowRight class="ml-2 h-5 w-5" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { useCalculatorStore } from "@/stores/calculator";
import { ArrowRight } from "lucide-vue-next";

const calculatorStore = useCalculatorStore();
</script>
