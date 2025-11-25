<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-bold text-center mb-6">Data do Transfer</h2>
    <div>
      <label for="date" class="text-base mb-2 block">
        {{
          calculatorStore.tripType === "returnonly"
            ? "Selecione a data da volta"
            : "Selecione a data"
        }}
      </label>
      <div class="relative">
        <input
          id="date"
          v-model="dateInput"
          type="text"
          placeholder="dd/mm/aaaa"
          readonly
          :disabled="!seasonStart || !seasonEnd"
          class="w-full h-12 px-3 pr-10 border border-gray-200 rounded-md bg-white cursor-pointer"
          @click="openDatePicker"
          @focus="openDatePicker"
        />
        <button
          type="button"
          class="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md text-muted-foreground hover:text-foreground focus:outline-none"
          :disabled="!seasonStart || !seasonEnd"
          aria-label="Abrir calendário"
          @click="openDatePicker"
        >
          <Calendar class="h-5 w-5" />
        </button>
        <CalendarPopover
          v-if="showDateCalendar"
          :selected-iso="calculatorStore.date"
          :min="seasonStart"
          :max="seasonEnd"
          @select="onDateSelected"
          @close="showDateCalendar = false"
        />
      </div>
      <p class="text-sm text-muted-foreground mt-2">
        Janela de temporada: {{ formatDateBR(seasonStart) }} a
        {{ formatDateBR(seasonEnd) }}
      </p>
      <p v-if="!seasonStart || !seasonEnd" class="text-sm text-red-600 mt-1">
        Datas de temporada não configuradas. Por favor, tente novamente mais
        tarde ou entre em contato.
      </p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div>
        <label class="text-sm mb-1 block">
          {{ requiresFlightInfo ? "Horário previsto de chegada" : "Horário" }}
        </label>
        <input
          v-model="timeInput"
          type="time"
          class="w-full h-10 px-3 border border-gray-200 rounded-md bg-white"
          required
        />
      </div>
    </div>
    <div class="flex gap-4">
      <button class="btn btn-outline flex-1 text-lg" @click="$emit('prev')">
        Voltar
      </button>
      <button
        class="btn btn-primary gradient-ocean flex-1 text-lg"
        :disabled="!seasonStart || !seasonEnd || !timeInput"
        @click="$emit('next')"
      >
        Próximo
        <ArrowRight class="ml-2 h-5 w-5" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useCalculatorStore } from "@/stores/calculator";
import { formatDateBR, parseDateBRToISO } from "@/utils/formatDateBR";
import CalendarPopover from "@/components/ui/CalendarPopover.vue";
import { ArrowRight, Calendar } from "lucide-vue-next";

const props = defineProps<{ seasonStart: string; seasonEnd: string }>();
const calculatorStore = useCalculatorStore();

const dateInput = ref<string>("");
const showDateCalendar = ref(false);
const timeInput = ref<string>("");

dateInput.value = formatDateBR(calculatorStore.date || "");
watch(
  () => calculatorStore.date,
  (iso) => {
    dateInput.value = formatDateBR(iso || "");
  },
);
watch(dateInput, (val) => {
  calculatorStore.setDate(parseDateBRToISO(val));
});

watch(timeInput, (val) => {
  if (requiresFlightInfo.value) {
    calculatorStore.setArrivalTime(val);
  } else {
    calculatorStore.setMeetingTime(val);
  }
});

const openDatePicker = () => {
  if (!props.seasonStart || !props.seasonEnd) return;
  showDateCalendar.value = true;
};
const onDateSelected = (iso: string) => {
  calculatorStore.setDate(iso);
  dateInput.value = formatDateBR(iso);
  showDateCalendar.value = false;
};

const isAirport = (name: string) =>
  (name || "").toLowerCase().includes("aeroporto");
const requiresFlightInfo = computed(() =>
  isAirport(calculatorStore.destination),
);

// initialize time input from store
timeInput.value = requiresFlightInfo.value
  ? calculatorStore.arrivalTime || ""
  : calculatorStore.meetingTime || "";
</script>
