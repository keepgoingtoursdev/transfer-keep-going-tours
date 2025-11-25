<template>
  <div class="space-y-4 text-left">
    <h3 class="text-xl font-semibold">Adicionar Volta</h3>
    <div>
      <label
        for="returnCep"
        class="flex items-center justify-between w-100 text-base mb-2 block"
        >CEP de Destino (Volta)
        <button
          type="button"
          class="btn btn-outline text-xs text-brand-primary"
          @click="loadDestinations"
        >
          Carregar destinos
        </button>
      </label>
      <div class="mt-1 flex items-center gap-2">
        <div class="mt-1 flex items-center gap-2">
          <span class="text-xs text-muted-foreground"
            >Não encontrou o CEP desejado? Toque em "Carregar destinos".</span
          >
        </div>
      </div>
      <div class="relative">
        <input
          id="returnCep"
          ref="returnInputRef"
          :value="returnCep"
          type="tel"
          inputmode="numeric"
          enterkeyhint="done"
          placeholder="Digite o CEP (apenas números)"
          class="w-full h-12 px-3 border border-gray-200 rounded-md bg-white"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          maxlength="9"
          pattern="\d{5}-?\d{3}"
          @input="onCepInput"
          @keyup="onCepKeyup"
          @change="onCepChange"
          @paste="onCepPaste"
          @focus="showSuggestions = true"
          @blur="onBlurInput"
        />

        <!-- Lista de destinos cadastrados (autocomplete visual - volta) -->
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
        Região (volta):
        <span class="font-semibold">{{
          returnZone ? returnZone.name : "Não encontrada"
        }}</span>
      </p>
    </div>
    <div>
      <label for="returnDate" class="text-base mb-2 block">Data (Volta)</label>
      <div class="relative">
        <input
          id="returnDate"
          :value="returnDateInput"
          type="text"
          placeholder="dd/mm/aaaa"
          readonly
          :disabled="!seasonStart || !seasonEnd"
          class="w-full h-12 px-3 pr-10 border border-gray-200 rounded-md bg-white cursor-pointer"
          @click="openReturnDatePicker"
          @focus="openReturnDatePicker"
        />
        <button
          type="button"
          class="absolute right-2 top-1/4 -translate-y-1/2 p-2 rounded-md text-muted-foreground hover:text-foreground focus:outline-none"
          :disabled="!seasonStart || !seasonEnd"
          aria-label="Abrir calendário"
          @click="openReturnDatePicker"
        >
          <Calendar class="h-5 w-5" />
        </button>
        <CalendarPopover
          v-if="showReturnCalendar"
          :selected-iso="returnDate"
          :min="seasonStart || undefined"
          :max="seasonEnd || undefined"
          :inline="true"
          @select="onReturnDateSelected"
          @close="showReturnCalendar = false"
        />
      </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label for="returnPassengers" class="text-base mb-2 block"
          >Passageiros (Volta)</label
        >
        <select
          id="returnPassengers"
          :value="returnPassengers"
          class="w-full h-12 px-3 border border-gray-200 rounded-md bg-white"
          @change="onPassengersChange"
        >
          <option value="">Selecione</option>
          <option v-for="i in 10" :key="i" :value="i.toString()">
            {{ i }} passageiro{{ i > 1 ? "s" : "" }}
          </option>
        </select>
      </div>
    </div>

    <!-- Veículos (Volta) em cards, semelhantes ao Step 6 -->
    <div class="space-y-4 mt-2">
      <label class="text-base font-medium block">Veículo (Volta)</label>
      <div class="space-y-6">
        <div
          v-for="vehicle in vehicleTypeOptions"
          :key="vehicle"
          :class="[
            'rounded-lg border shadow-sm p-4 md:p-6 bg-white transition-smooth',
            returnVehicleType === vehicle
              ? 'border-brand-primary ring-1 ring-brand-primary/30'
              : 'border-gray-200',
          ]"
        >
          <div
            class="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <!-- Imagem -->
            <div class="flex items-center gap-4 md:w-1/3">
              <img
                class="w-32 h-20 md:w-40 md:h-24 object-cover rounded-md border"
                :src="getVehicleImage(vehicle)"
                :alt="vehicle"
                loading="lazy"
                @error="(e) => onVehicleImageError(e, vehicle)"
              />
            </div>

            <!-- Informações -->
            <div class="md:w-1/2">
              <div class="text-xl font-bold mb-2">{{ vehicle }}</div>
              <div class="flex items-center gap-6 text-lg">
                <div class="flex items-center gap-2">
                  <Users class="h-6 w-6" />
                  <div>
                    <div class="leading-none">
                      {{ getVehicleCapacity(vehicle) }}
                    </div>
                    <div class="text-sm text-muted-foreground -mt-0.5">
                      assentos
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <Briefcase class="h-6 w-6" />
                  <div>
                    <div class="leading-none">
                      {{ getSuitcases(vehicle) }}
                    </div>
                    <div class="text-sm text-muted-foreground -mt-0.5">
                      malas grandes
                    </div>
                  </div>
                </div>
                <div class="relative group text-gray-400">
                  <button
                    type="button"
                    class="p-1 rounded-md hover:bg-muted"
                    @click="openLuggageModal"
                  >
                    <Info
                      class="h-5 w-5"
                      aria-describedby="tip-vehicle-info-return"
                    />
                  </button>
                  <div
                    id="tip-vehicle-info-return"
                    role="tooltip"
                    class="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition"
                  >
                    abrir medidas das malas
                  </div>
                </div>
              </div>
            </div>

            <!-- Preço e botão -->
            <div class="md:w-1/3 text-right">
              <div class="text-sm text-muted-foreground">Preço estimado</div>
              <div class="text-2xl font-extrabold text-pink-600">
                {{
                  getEstimatedVehiclePriceFn
                    ? getEstimatedVehiclePriceFn(vehicle)
                    : ""
                }}
              </div>
              <button
                class="btn btn-primary gradient-ocean mt-3"
                @click="onSelectReturnVehicle(vehicle)"
              >
                Selecionar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="flex gap-4">
      <button
        class="btn btn-primary gradient-ocean flex-1 text-lg"
        @click="$emit('add')"
      >
        Adicionar Volta
      </button>
    </div>

    <!-- Modal de medidas das malas (teleportado para body para evitar problemas de z-index) -->
    <Teleport to="body">
      <div
        v-if="showLuggageModal"
        class="fixed inset-0 z-[1000]"
        role="dialog"
        aria-modal="true"
      >
        <div
          class="modal-backdrop fixed inset-0 bg-black/50"
          @click="closeLuggageModal"
        ></div>
        <div
          class="relative flex items-center justify-center min-h-screen p-4 pointer-events-none"
        >
          <div
            class="card bg-white rounded-lg shadow-large border w-full max-w-3xl pointer-events-auto"
          >
            <div class="flex items-center justify-between px-4 py-3 border-b">
              <div class="font-semibold">Medidas das malas</div>
              <button
                type="button"
                class="btn btn-outline px-3 py-1.5"
                @click="closeLuggageModal"
              >
                Fechar
              </button>
            </div>
            <div class="p-4">
              <img
                src="/images/malas.png"
                alt="Tabela de medidas das malas"
                class="w-full h-auto rounded-md"
              />
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import CalendarPopover from "@/components/ui/CalendarPopover.vue";
import {
  Calendar,
  Plane,
  Building,
  Users,
  Briefcase,
  Info,
} from "lucide-vue-next";
import { formatDateBR } from "@/utils/formatDateBR";
import type { ZoneRow } from "@/services/supabase";

const props = defineProps<{
  seasonStart: string | null;
  seasonEnd: string | null;
  vehicleTypeOptions: string[];
  returnCep: string;
  returnZone: ZoneRow | null;
  returnDate: string;
  returnPassengers: string;
  returnVehicleType: string;
  zones?: ZoneRow[];
  getEstimatedVehiclePrice?: (vehicleName: string) => string;
  // Funções opcionais para buscar capacidade (assentos) e malas do veículo (DB)
  getVehicleCapacity?: (vehicle: string) => number;
  getVehicleSuitcases?: (vehicle: string) => number;
}>();

const emit = defineEmits<{
  (e: "update:returnCep", value: string): void;
  (e: "update:returnDate", value: string): void;
  (e: "update:returnPassengers", value: string): void;
  (e: "update:returnVehicleType", value: string): void;
  (e: "add"): void;
}>();

const showReturnCalendar = ref(false);
const returnDateInput = ref<string>("");
const showSuggestions = ref(false);
const keepSuggestionsOpen = ref(false);
const returnInputRef = ref<HTMLInputElement | null>(null);
const zones = computed(() => (props.zones || []) as ZoneRow[]);
const getEstimatedVehiclePriceFn = computed(
  () => props.getEstimatedVehiclePrice,
);

watch(
  () => props.returnDate,
  (iso) => {
    returnDateInput.value = formatDateBR(iso || "");
  },
  { immediate: true },
);

const openReturnDatePicker = () => {
  if (!props.seasonStart || !props.seasonEnd) return;
  showReturnCalendar.value = true;
};

const onReturnDateSelected = (iso: string) => {
  emit("update:returnDate", iso);
  returnDateInput.value = formatDateBR(iso);
  showReturnCalendar.value = false;
};

const maskCep = (value: string) => {
  const digits = (value || "").replace(/\D/g, "").slice(0, 8);
  return digits.length > 5
    ? `${digits.slice(0, 5)}-${digits.slice(5)}`
    : digits;
};

const onCepInput = (e: Event) => {
  const val = (e.target as HTMLInputElement).value;
  const masked = maskCep(val);
  emit("update:returnCep", masked);
};

const onPassengersChange = (e: Event) => {
  emit("update:returnPassengers", (e.target as HTMLSelectElement).value);
};

const onVehicleChange = (e: Event) => {
  emit("update:returnVehicleType", (e.target as HTMLSelectElement).value);
};

// Seleciona veículo via card
const onSelectReturnVehicle = (vehicle: string) => {
  emit("update:returnVehicleType", vehicle);
};

// Autocomplete de destinos por zonas (igual ao Step2)
const normalizeCep = (value: string) =>
  (value || "").replace(/\D/g, "").slice(0, 8);
const digitsCep = computed(() => normalizeCep(props.returnCep));
const matchesCepRange = (z: ZoneRow, cep: string) => {
  if (!cep || cep.length !== 8) return false;
  const s = normalizeCep(z.cep_start);
  const e = normalizeCep(z.cep_end);
  return cep >= s && cep <= e;
};
const isAirport = (name: string) =>
  (name || "").toLowerCase().includes("aeroporto");

const filteredDestinations = computed<
  {
    id?: string;
    name: string;
    cep_start?: string;
    cep_end?: string;
  }[]
>(() => {
  if (!zones.value.length) return [];
  const cep = digitsCep.value;
  if (!cep || cep.length !== 8) {
    return zones.value.map((z) => ({
      id: z.id,
      name: z.name,
      cep_start: z.cep_start,
      cep_end: z.cep_end,
    }));
  }
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

function selectDestination(item: {
  id?: string;
  name: string;
  cep_start?: string;
  cep_end?: string;
}) {
  const currentDigits = digitsCep.value;
  const hasFullCep = currentDigits && currentDigits.length === 8;
  const hasRange = !!item.cep_start && !!item.cep_end;
  if (hasFullCep && hasRange) {
    const start = normalizeCep(item.cep_start!);
    const end = normalizeCep(item.cep_end!);
    const inRange = currentDigits >= start && currentDigits <= end;
    if (!inRange && item.cep_start) {
      const masked = maskCep(item.cep_start);
      emit("update:returnCep", masked);
    }
  } else if (item.cep_start) {
    const masked = maskCep(item.cep_start);
    emit("update:returnCep", masked);
  }
  showSuggestions.value = false;
}

// Helpers para input robusto (mobile)
function onCepKeyup(e: KeyboardEvent) {
  const target = e.target as HTMLInputElement;
  const masked = maskCep(target.value);
  emit("update:returnCep", masked);
  showSuggestions.value = true;
}

function onCepChange(e: Event) {
  const target = e.target as HTMLInputElement;
  const masked = maskCep(target.value);
  emit("update:returnCep", masked);
}

function onCepPaste(e: ClipboardEvent) {
  const data = e.clipboardData?.getData("text") || "";
  const digits = (data || "").replace(/\D/g, "");
  const masked = maskCep(digits);
  emit("update:returnCep", masked);
  e.preventDefault();
  showSuggestions.value = true;
}

function loadDestinations() {
  keepSuggestionsOpen.value = true;
  emit("update:returnCep", "");
  showSuggestions.value = true;
  returnInputRef.value?.focus();
  setTimeout(() => {
    keepSuggestionsOpen.value = false;
  }, 250);
}

// Dados de veículos: capacidade, malas, imagem (semelhante ao Step6)
const getVehicleCapacity = (vehicle: string) => {
  if (typeof props.getVehicleCapacity === "function") {
    const dbCap = Number(props.getVehicleCapacity(vehicle) || 0);
    if (!Number.isNaN(dbCap) && dbCap > 0) return dbCap;
  }
  const name = (vehicle || "").toLowerCase();
  if (name.includes("van")) return 12;
  if (name.includes("suv")) return 5;
  return 4;
};

const getSuitcases = (vehicle: string) => {
  if (typeof props.getVehicleSuitcases === "function") {
    const val = Number(props.getVehicleSuitcases(vehicle) || 0);
    if (!Number.isNaN(val) && val >= 0) return val;
  }
  return 0;
};

const getVehicleImage = (vehicle: string) => {
  const cap = getVehicleCapacity(vehicle);
  if (cap <= 3) return "/images/sedan.jpg";
  if (cap <= 6) return "/images/suv.png";
  return "/images/van.jpg";
};
const onVehicleImageError = (e: Event, vehicle: string) => {
  const name = (vehicle || "").toLowerCase();
  const target = e.target as HTMLImageElement;
  if (name.includes("van")) target.src = "/images/van.jpg";
  else if (name.includes("suv")) target.src = "/images/suv.png";
  else target.src = "/images/sedan.jpg";
};

// Modal simples para exibir imagem de medidas das malas (consistência visual com Step6)
const showLuggageModal = ref(false);
function openLuggageModal() {
  showLuggageModal.value = true;
}
function closeLuggageModal() {
  showLuggageModal.value = false;
}
</script>
