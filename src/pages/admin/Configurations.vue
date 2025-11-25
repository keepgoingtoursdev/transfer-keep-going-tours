<template>
  <div class="min-h-screen pt-32 pb-20 px-4">
    <div class="container mx-auto max-w-3xl">
      <h1 class="text-4xl font-bold mb-6">Configurações</h1>
      <div class="card p-6 shadow-medium space-y-4">
        <p class="text-muted-foreground">
          Edite as datas de temporada usadas para restringir o calendário na
          Calculadora.
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="seasonStart" class="text-sm mb-1 block"
              >Data de início</label
            >
            <input
              id="seasonStart"
              v-model="seasonStartBR"
              type="text"
              inputmode="numeric"
              autocomplete="off"
              placeholder="dd/mm/aaaa"
              class="w-full h-12 px-3 border border-gray-200 rounded-md bg-white"
              @input="onSeasonStartInput"
            />
          </div>
          <div>
            <label for="seasonEnd" class="text-sm mb-1 block"
              >Data de término</label
            >
            <input
              id="seasonEnd"
              v-model="seasonEndBR"
              type="text"
              inputmode="numeric"
              autocomplete="off"
              placeholder="dd/mm/aaaa"
              class="w-full h-12 px-3 border border-gray-200 rounded-md bg-white"
              @input="onSeasonEndInput"
            />
          </div>
        </div>
        <div class="flex gap-4">
          <button class="btn btn-primary gradient-ocean flex-1" @click="save">
            Salvar
          </button>
          <button class="btn btn-outline flex-1" @click="load">
            Recarregar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { fetchConfigurations, upsertConfiguration } from "@/services/supabase";
import { useToastStore } from "@/stores/toast";
import { formatDateBR, parseDateBRToISO } from "@/utils/formatDateBR";
import { maskDateBR } from "@/utils/masks";

// Internamente mantemos ISO (yyyy-mm-dd), exibimos e editamos em BR (dd/mm/aaaa)
const seasonStartISO = ref("");
const seasonEndISO = ref("");
const seasonStartBR = ref("");
const seasonEndBR = ref("");
const toast = useToastStore();

async function load() {
  try {
    const configs = await fetchConfigurations([
      "season_start_date",
      "season_end_date",
    ]);
    seasonStartISO.value =
      configs.find((c) => c.key === "season_start_date")?.value || "";
    seasonEndISO.value =
      configs.find((c) => c.key === "season_end_date")?.value || "";
    seasonStartBR.value = formatDateBR(seasonStartISO.value);
    seasonEndBR.value = formatDateBR(seasonEndISO.value);
  } catch (err) {
    console.warn(err);
    toast.error("Falha ao carregar configurações");
  }
}

async function save() {
  if (!seasonStartBR.value || !seasonEndBR.value) {
    toast.error("Preencha ambas as datas.");
    return;
  }
  try {
    // Converte para ISO antes de salvar
    const startISO = parseDateBRToISO(seasonStartBR.value);
    const endISO = parseDateBRToISO(seasonEndBR.value);
    if (!startISO || !endISO) {
      toast.error("Datas inválidas. Use o formato dd/mm/aaaa.");
      return;
    }
    await upsertConfiguration("season_start_date", startISO);
    await upsertConfiguration("season_end_date", endISO);
    toast.success("Configurações salvas com sucesso.");
  } catch (err) {
    console.warn(err);
    toast.error("Erro ao salvar configurações.");
  }
}

function onSeasonStartInput(e: Event) {
  const target = e.target as HTMLInputElement;
  seasonStartBR.value = maskDateBR(target.value);
}

function onSeasonEndInput(e: Event) {
  const target = e.target as HTMLInputElement;
  seasonEndBR.value = maskDateBR(target.value);
}

onMounted(load);
</script>
