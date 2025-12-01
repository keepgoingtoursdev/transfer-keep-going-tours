<template>
  <!-- Popover: pode ser inline (ancorado ao input) ou overlay centralizado -->
  <div
    :class="[
      inline
        ? 'absolute left-0 right-0 top-full mt-2 z-50 flex justify-center'
        : 'fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-6',
    ]"
  >
    <div
      class="card border border-gray-200 rounded-lg bg-white shadow-large w-full max-w-[20rem] sm:max-w-[28rem] md:max-w-[32rem]"
    >
      <div class="flex items-center justify-between px-4 py-3 border-b">
        <button
          type="button"
          class="btn btn-outline px-3 py-1.5 rounded-md"
          :disabled="!canPrevMonth"
          @click="prevMonth"
        >
          <span aria-hidden="true">‹</span>
          <span class="sr-only">Mês anterior</span>
        </button>
        <div class="font-semibold capitalize text-lg">
          {{ monthYearLabel }}
        </div>
        <button
          type="button"
          class="btn btn-outline px-3 py-1.5 rounded-md"
          :disabled="!canNextMonth"
          @click="nextMonth"
        >
          <span aria-hidden="true">›</span>
          <span class="sr-only">Próximo mês</span>
        </button>
      </div>
      <div class="px-4 py-3">
        <div
          class="grid grid-cols-7 text-center text-sm md:text-base text-muted-foreground mb-3"
        >
          <div v-for="d in weekDays" :key="d">{{ d }}</div>
        </div>
        <div class="grid grid-cols-7 gap-2">
          <div v-for="cell in cells" :key="cell.key" class="">
            <button
              v-if="cell.day"
              type="button"
              :class="[
                'w-full h-12 md:h-12 rounded-md text-sm md:text-base',
                cell.selected
                  ? 'bg-brand-primary text-white'
                  : 'hover:bg-muted',
                cell.disabled
                  ? 'opacity-40 cursor-not-allowed'
                  : 'cursor-pointer',
              ]"
              :disabled="cell.disabled"
              @click="selectDay(cell)"
            >
              {{ cell.day }}
            </button>
            <div v-else class="h-12 md:h-12" />
          </div>
        </div>
      </div>
      <div class="px-4 py-3 border-t flex justify-end">
        <button type="button" class="btn btn-outline" @click="$emit('close')">
          Fechar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineEmits, defineProps, ref, watch } from "vue";

type CalendarCell = {
  key: string;
  day?: number;
  date: Date | null;
  disabled: boolean;
  selected: boolean;
};

const props = defineProps<{
  selectedIso?: string;
  min?: string;
  max?: string;
  inline?: boolean;
}>();

const emit = defineEmits<{
  (e: "select", iso: string): void;
  (e: "close"): void;
}>();

const viewDate = ref(initViewDate());

watch(
  () => props.selectedIso,
  (iso) => {
    const d = isoToDate(iso);
    if (d) viewDate.value = new Date(d.getFullYear(), d.getMonth(), 1);
  },
);

function initViewDate(): Date {
  const selected = isoToDate(props.selectedIso);
  const now = new Date();
  const base = selected || now;
  const min = isoToDate(props.min);
  const max = isoToDate(props.max);
  let d = new Date(base.getFullYear(), base.getMonth(), 1);
  if (min) {
    const minMonth = new Date(min.getFullYear(), min.getMonth(), 1);
    if (d < minMonth) d = minMonth;
  }
  if (max) {
    const maxMonth = new Date(max.getFullYear(), max.getMonth(), 1);
    if (d > maxMonth) d = maxMonth;
  }
  return d;
}

function isoToDate(iso?: string): Date | null {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function dateToIso(d: Date): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const monthYearLabel = computed(() => {
  return viewDate.value.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
});

const weekDays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

const minDate = computed(() => isoToDate(props.min));
const maxDate = computed(() => isoToDate(props.max));

const canPrevMonth = computed(() => {
  if (!minDate.value) return true;
  const prev = new Date(viewDate.value);
  prev.setMonth(prev.getMonth() - 1);
  return (
    prev >= new Date(minDate.value.getFullYear(), minDate.value.getMonth(), 1)
  );
});
const canNextMonth = computed(() => {
  if (!maxDate.value) return true;
  const next = new Date(viewDate.value);
  next.setMonth(next.getMonth() + 1);
  return (
    next <= new Date(maxDate.value.getFullYear(), maxDate.value.getMonth(), 1)
  );
});

function prevMonth() {
  if (!canPrevMonth.value) return;
  const y = viewDate.value.getFullYear();
  const m = viewDate.value.getMonth() - 1;
  viewDate.value = new Date(y, m, 1);
}
function nextMonth() {
  if (!canNextMonth.value) return;
  const y = viewDate.value.getFullYear();
  const m = viewDate.value.getMonth() + 1;
  viewDate.value = new Date(y, m, 1);
}

const cells = computed<CalendarCell[]>(() => {
  const result: CalendarCell[] = [];
  const year = viewDate.value.getFullYear();
  const month = viewDate.value.getMonth();
  const first = new Date(year, month, 1);
  // Monday as first day
  const startOffset = (first.getDay() + 6) % 7; // 0..6 where Monday=0
  for (let i = 0; i < startOffset; i++) {
    result.push({ key: `p-${i}`, date: null, disabled: true, selected: false });
  }
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const selected = isoToDate(props.selectedIso);
  for (let d = 1; d <= daysInMonth; d++) {
    const cur = new Date(year, month, d);
    const iso = dateToIso(cur);
    const disabled =
      (minDate.value && iso < dateToIso(minDate.value)) ||
      (maxDate.value && iso > dateToIso(maxDate.value));
    const selectedFlag =
      !!selected &&
      selected.getFullYear() === year &&
      selected.getMonth() === month &&
      selected.getDate() === d;
    result.push({
      key: `d-${iso}`,
      day: d,
      date: cur,
      disabled: disabled ?? false,
      selected: selectedFlag,
    });
  }
  return result;
});

function selectDay(cell: CalendarCell) {
  if (!cell.date || cell.disabled) return;
  const iso = dateToIso(cell.date);
  emit("select", iso);
  emit("close");
}
</script>

<style scoped>
.btn.btn-outline {
  border: 1px solid #e5e7eb; /* gray-200 */
}
.hover\:bg-muted:hover {
  background-color: #f5f5f5;
}
</style>
