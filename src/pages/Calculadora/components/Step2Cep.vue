<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-bold text-center mb-6">
      {{
        calculatorStore.tripType === "returnonly"
          ? "Origem (Porto) e Destino"
          : "Origem e Destino"
      }}
    </h2>
    <div class="space-y-4">
      <div>
        <label
          for="originCep"
          class="flex items-center justify-between w-100 text-base mb-2 block"
        >
          {{
            calculatorStore.tripType === "returnonly"
              ? "CEP de Destino"
              : "CEP de Origem"
          }}
          <button
            type="button"
            class="btn btn-primary text-xs px-4 py-2 shadow hover:shadow-md transition"
            @click="loadDestinations"
          >
            Carregar destinos
          </button>
        </label>
        <div class="mt-1 flex items-center gap-2">
          <span class="text-xs text-muted-foreground"
            >Não encontrou o CEP desejado? Toque em "Carregar destinos".</span
          >
        </div>

        <div class="relative">
          <input
            id="originCep"
            ref="originInputRef"
            v-model="calculatorStore.origin"
            type="tel"
            inputmode="numeric"
            enterkeyhint="done"
            placeholder="Digite o CEP (apenas números)"
            class="w-full h-12 px-3 border border-gray-200 rounded-md bg-white"
            name="cep-origin-no-autofill"
            autocomplete="off"
            aria-autocomplete="none"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
            maxlength="9"
            pattern="\d{5}-?\d{3}"
            @input="calculatorStore.origin = maskCep(calculatorStore.origin)"
            @keyup="onCepKeyup"
            @change="onCepChange"
            @paste="onCepPaste"
            @focus="showSuggestions = true"
            @blur="onBlurInput"
          />

          <!-- Lista de destinos cadastrados (autocomplete visual) -->
          <div
            v-if="showSuggestions && filteredDestinations.length"
            class="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-large z-20 max-h-56 overflow-auto"
          >
            <button
              v-for="d in filteredDestinations"
              :key="d.id || d.name"
              type="button"
              class="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-brand-light/40"
              @mousedown.prevent="selectDestination(d)"
            >
              <component
                :is="isAirport(d.name) ? Plane : Building"
                class="w-4 h-4 text-muted-foreground"
              />
              <span class="text-sm">{{ d.name }}</span>
            </button>
          </div>
        </div>
        <p class="text-sm text-muted-foreground mt-2">
          Região:
          <span class="font-semibold">{{
            originZoneName || "Não encontrada"
          }}</span>
        </p>
        <div
          v-if="isAirport(calculatorStore.destination)"
          class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3"
        >
          <div>
            <label class="text-sm mb-1 block">Cia. Aérea</label>
            <input
              v-model="calculatorStore.airline"
              class="w-full h-10 px-3 border border-gray-200 rounded-md bg-white"
              placeholder="Ex.: LATAM"
              required
            />
          </div>
          <div>
            <label class="text-sm mb-1 block">No. Vôo</label>
            <input
              v-model="calculatorStore.flightNumber"
              class="w-full h-10 px-3 border border-gray-200 rounded-md bg-white"
              placeholder="Ex.: LA1234"
            />
          </div>
        </div>
        <div v-else class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div class="md:col-span-3">
            <h4 class="text-base font-semibold mb-2">Ponto de encontro</h4>
          </div>
          <div>
            <label class="text-sm mb-1 block">Endereço</label>
            <input
              v-model="calculatorStore.meetingStreet"
              class="w-full h-10 px-3 border border-gray-200 rounded-md bg-white"
              placeholder="Rua/Avenida"
              required
            />
          </div>
          <div>
            <label class="text-sm mb-1 block">Número</label>
            <input
              v-model="calculatorStore.meetingNumber"
              class="w-full h-10 px-3 border border-gray-200 rounded-md bg-white"
              placeholder="Número"
              required
            />
          </div>
          <div>
            <label class="text-sm mb-1 block">Bairro</label>
            <input
              v-model="calculatorStore.meetingNeighborhood"
              class="w-full h-10 px-3 border border-gray-200 rounded-md bg-white"
              placeholder="Bairro"
              required
            />
          </div>
          <div>
            <label class="text-sm mb-1 block">Cidade</label>
            <input
              v-model="calculatorStore.meetingCity"
              class="w-full h-10 px-3 border border-gray-200 rounded-md bg-white"
              placeholder="Cidade"
              required
            />
          </div>
          <div>
            <label class="text-sm mb-1 block">Estado (UF)</label>
            <select
              v-model="calculatorStore.meetingState"
              class="w-full h-10 px-3 border border-gray-200 rounded-md bg-white"
              required
            >
              <option value="">Selecione</option>
              <option v-for="s in BR_STATES" :key="s.uf" :value="s.uf">
                {{ s.name }} ({{ s.uf }})
              </option>
            </select>
          </div>
        </div>
      </div>
      <div>
        <label class="text-base mb-2 block">
          {{ calculatorStore.tripType === "returnonly" ? "Origem" : "Destino" }}
        </label>
        <div
          class="w-full h-12 px-3 border border-gray-200 rounded-md bg-white flex items-center"
        >
          Porto de Santos
        </div>
      </div>
    </div>
    <div class="flex gap-4">
      <button class="btn btn-outline flex-1 text-lg" @click="$emit('prev')">
        Voltar
      </button>
      <button
        class="btn btn-primary gradient-ocean flex-1 text-lg"
        :disabled="
          (requiresFlightInfo && !calculatorStore.airline) ||
          (!requiresFlightInfo &&
            (!calculatorStore.meetingStreet ||
              !calculatorStore.meetingNumber ||
              !calculatorStore.meetingCity ||
              !calculatorStore.meetingNeighborhood ||
              !calculatorStore.meetingState))
        "
        @click="onNext"
      >
        Próximo
        <ArrowRight class="ml-2 h-5 w-5" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCalculatorStore } from "@/stores/calculator";
import { ArrowRight, Plane, Building } from "lucide-vue-next";
import { ref, computed } from "vue";
import { useToastStore } from "@/stores/toast";
import { fetchViaCep } from "@/services/auth";
import { BR_STATES } from "@/constants/br";
import type { ZoneRow } from "@/services/supabase";

const props = defineProps<{
  originZoneName: string | null;
  zones?: ZoneRow[];
}>();
const calculatorStore = useCalculatorStore();
const toastStore = useToastStore();

const showSuggestions = ref(false);
const keepSuggestionsOpen = ref(false);
const originInputRef = ref<HTMLInputElement | null>(null);
// Torna reativo: props.zones pode chegar após o primeiro render;
// usar computed garante atualização automática da lista
const zones = computed(() => (props.zones || []) as ZoneRow[]);

const loadDestinations = () => {
  keepSuggestionsOpen.value = true;
  calculatorStore.origin = "";
  showSuggestions.value = true;
  originInputRef.value?.focus();
  setTimeout(() => {
    keepSuggestionsOpen.value = false;
  }, 250);
};

const maskCep = (value: string) => {
  const digits = (value || "").replace(/\D/g, "").slice(0, 8);
  return digits.length > 5
    ? `${digits.slice(0, 5)}-${digits.slice(5)}`
    : digits;
};

const isAirport = (name: string) =>
  (name || "").toLowerCase().includes("aeroporto");
const selectDestination = (item: {
  id?: string;
  name: string;
  cep_start?: string;
  cep_end?: string;
}) => {
  const name = item.name;
  calculatorStore.setDestination(name);
  const currentDigits = digitsCep.value;
  const hasFullCep = currentDigits && currentDigits.length === 8;
  const hasRange = !!item.cep_start && !!item.cep_end;
  if (hasFullCep && hasRange) {
    const start = normalizeCep(item.cep_start!);
    const end = normalizeCep(item.cep_end!);
    const inRange = currentDigits >= start && currentDigits <= end;
    if (!inRange && item.cep_start) {
      calculatorStore.origin = maskCep(item.cep_start);
    }
  } else if (item.cep_start) {
    calculatorStore.origin = maskCep(item.cep_start);
  }
  showSuggestions.value = false;
};

// CEP helpers e filtro por range das zonas
const normalizeCep = (value: string) =>
  (value || "").replace(/\D/g, "").slice(0, 8);
const digitsCep = computed(() => normalizeCep(calculatorStore.origin));
const matchesCepRange = (z: ZoneRow, cep: string) => {
  if (!cep || cep.length !== 8) return false;
  const s = normalizeCep(z.cep_start);
  const e = normalizeCep(z.cep_end);
  return cep >= s && cep <= e;
};

const filteredDestinations = computed<
  { id?: string; name: string; cep_start?: string; cep_end?: string }[]
>(() => {
  if (!zones.value.length) return [];
  const cep = digitsCep.value;
  if (!cep || cep.length !== 8)
    return zones.value.map((z) => ({
      id: z.id,
      name: z.name,
      cep_start: z.cep_start,
      cep_end: z.cep_end,
    }));
  const list = zones.value.filter((z) => matchesCepRange(z, cep));
  return (list.length ? list : zones.value).map((z) => ({
    id: z.id,
    name: z.name,
    cep_start: z.cep_start,
    cep_end: z.cep_end,
  }));
});

function onBlurInput() {
  setTimeout(() => {
    if (!keepSuggestionsOpen.value) showSuggestions.value = false;
  }, 100);
}

function onCepKeyup() {
  calculatorStore.origin = maskCep(calculatorStore.origin);
  showSuggestions.value = true;
}

function onCepChange() {
  calculatorStore.origin = maskCep(calculatorStore.origin);
  autoFillMeetingFromCep();
}

function onCepPaste(e: ClipboardEvent) {
  const data = e.clipboardData?.getData("text") || "";
  const digits = (data || "").replace(/\D/g, "");
  calculatorStore.origin = maskCep(digits);
  e.preventDefault();
  showSuggestions.value = true;
  autoFillMeetingFromCep();
}

const requiresFlightInfo = computed(() =>
  isAirport(calculatorStore.destination),
);

function onNext() {
  if (requiresFlightInfo.value && !calculatorStore.airline) {
    toastStore.warning("Preencha a Cia. Aérea");
    return;
  }
  if (
    !requiresFlightInfo.value &&
    (!calculatorStore.meetingStreet ||
      !calculatorStore.meetingNumber ||
      !calculatorStore.meetingCity)
  ) {
    toastStore.warning(
      "Preencha endereço, número e cidade do ponto de encontro",
    );
    return;
  }
  // emitir evento para avançar
  // @ts-ignore
  // eslint-disable-next-line vue/valid-define-emits
  const evt = new CustomEvent("next", { bubbles: true });
  originInputRef.value?.dispatchEvent(evt);
}

async function autoFillMeetingFromCep() {
  const cepDigits = (calculatorStore.origin || "").replace(/\D/g, "");
  if (cepDigits.length !== 8) return;
  const res = await fetchViaCep(cepDigits);
  if (!res) return;
  calculatorStore.meetingStreet =
    res.logradouro || calculatorStore.meetingStreet || "";
  calculatorStore.meetingNeighborhood =
    res.bairro || calculatorStore.meetingNeighborhood || "";
  calculatorStore.meetingState = res.uf || calculatorStore.meetingState || "";
  calculatorStore.meetingCity =
    res.localidade || calculatorStore.meetingCity || "";
}
</script>
