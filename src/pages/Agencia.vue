<template>
  <div class="min-h-screen pt-32 pb-20 px-4">
    <div class="container mx-auto max-w-2xl">
      <div class="card p-8 shadow-large">
        <h1 class="text-3xl font-bold mb-6">Agência de viagens</h1>
        <p class="text-muted-foreground mb-6">
          Preencha os dados da agência para iniciar o orçamento.
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="md:col-span-2">
            <label class="text-sm mb-1 block">Nome da agência</label>
            <input
              v-model="agencyName"
              class="h-12 px-3 border border-gray-200 rounded-md bg-white w-full"
              placeholder="Ex.: Agência Transfer"
            />
          </div>
          <div>
            <label class="text-sm mb-1 block">Cidade</label>
            <input
              v-model="agencyCity"
              class="h-12 px-3 border border-gray-200 rounded-md bg-white w-full"
              placeholder="Ex.: Santos"
            />
          </div>
          <div>
            <label class="text-sm mb-1 block">Estado (UF)</label>
            <select
              v-model="agencyState"
              class="h-12 px-3 border border-gray-200 rounded-md bg-white w-full"
            >
              <option value="">Selecione</option>
              <option v-for="s in BR_STATES" :key="s.uf" :value="s.uf">
                {{ s.name }} ({{ s.uf }})
              </option>
            </select>
          </div>
          <div class="md:col-span-2">
            <label class="text-sm mb-1 block">WhatsApp (com DDD)</label>
            <input
              v-model="agencyWhatsapp"
              class="h-12 px-3 border border-gray-200 rounded-md bg-white w-full"
              placeholder="(DDD) 90000-0000"
            />
          </div>
        </div>
        <div class="flex gap-3 justify-end pt-6">
          <button class="btn btn-outline" @click="goBack">Cancelar</button>
          <button class="btn btn-primary gradient-ocean" @click="startBudget">
            Continuar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BR_STATES } from "@/constants/br";
import { useCalculatorStore } from "@/stores/calculator";
import { useToastStore } from "@/stores/toast";
import { useRouter } from "vue-router";
import { ref } from "vue";

const router = useRouter();
const toast = useToastStore();
const calc = useCalculatorStore();

const agencyName = ref("");
const agencyCity = ref("");
const agencyState = ref("");
const agencyWhatsapp = ref("");

function goBack() {
  router.push({ path: "/" });
}

function startBudget() {
  const phoneDigits = (agencyWhatsapp.value || "").replace(/\D/g, "");
  if (
    !agencyName.value ||
    !agencyCity.value ||
    !agencyState.value ||
    phoneDigits.length < 10
  ) {
    toast.warning("Preencha nome, cidade, estado e WhatsApp válido");
    return;
  }
  calc.resetCalculator();
  calc.setAgencyName(agencyName.value.trim());
  calc.setAgencyCity(agencyCity.value.trim());
  calc.setAgencyState(agencyState.value.trim());
  calc.setAgencyWhatsapp(phoneDigits);
  calc.setTripType("oneway");
  router.push({ path: "/calculadora" });
}
</script>
