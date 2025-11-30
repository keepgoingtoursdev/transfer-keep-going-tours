<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-bold text-center mb-6">Escolha a Hospedagem</h2>
    <p class="text-center text-muted-foreground mb-2">
      Data do trajeto: <strong>{{ formatDateBR(tripDate) }}</strong> ·
      Passageiros: <strong>{{ passengers }}</strong>
    </p>
    <div class="space-y-6">
      <div
        v-for="l in lodgings"
        :key="l.id"
        class="rounded-lg border shadow-sm p-4 md:p-6 bg-white"
      >
        <div
          class="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div v-if="(l.images || []).length" class="md:w-1/3">
            <div class="relative rounded border overflow-hidden">
              <img
                :src="toDataUrl(l.images![currentIndex[l.id] || 0])"
                alt="Imagem da hospedagem"
                class="w-full h-40 object-cover cursor-pointer"
                @click="openViewer(l)"
              />
              <div
                class="absolute inset-x-2 bottom-0 flex justify-center gap-1 p-1"
              >
                <span
                  v-for="(img, idx) in l.images"
                  :key="idx"
                  :class="
                    idx === (currentIndex[l.id] || 0)
                      ? 'bg-primary'
                      : 'bg-gray-300'
                  "
                  class="w-2 h-2 rounded-full"
                ></span>
              </div>
              <button
                class="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 border rounded-full w-8 h-8 flex items-center justify-center text-sm transition-none active:-translate-y-1/2"
                aria-label="Imagem anterior"
                @click="prev(l.id, l.images!.length)"
              >
                ◀
              </button>
              <button
                class="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 border rounded-full w-8 h-8 flex items-center justify-center text-sm transition-none active:-translate-y-1/2"
                aria-label="Próxima imagem"
                @click="next(l.id, l.images!.length)"
              >
                ▶
              </button>
            </div>
          </div>
          <!-- Informações -->
          <div :class="(l.images || []).length ? 'md:w-2/3' : 'md:w-full'">
            <div class="text-xl font-bold mb-2">{{ l.name }}</div>
            <div
              v-if="l.description"
              class="text-sm text-muted-foreground mb-2"
            >
              {{ l.description }}
            </div>
            <div class="flex items-center gap-6 text-lg">
              <div class="flex items-center gap-2">
                <Users class="h-6 w-6" />
                <div>
                  <div class="leading-none">{{ l.pax_per_apartment }}</div>
                  <div class="text-sm text-muted-foreground -mt-0.5">
                    pessoas por apto
                  </div>
                </div>
              </div>
              <!--   <div class="flex items-center gap-2">
                <DollarSign class="h-6 w-6" />
                <div>
                  <div class="leading-none">
                    {{ formatCurrency(l.price_per_apartment) }}
                  </div>
                  <div class="text-sm text-muted-foreground -mt-0.5">
                    por apto / noite
                  </div>
                </div>
              </div> -->
            </div>
            <div class="mt-3 text-sm text-muted-foreground">
              Necessários:
              <strong>{{ getApartmentsNeeded(l) }}</strong> apartamentos
              <div class="flex items-center gap-2 mt-1">
                <AlertCircle class="h-5 w-5 text-yellow-500" />
                <strong>Mais de uma noite, favor solicitar</strong>
              </div>
            </div>
          </div>

          <!-- Botão -->
          <div class="md:w-1/3 text-right">
            <div class="mt-1 text-sm text-muted-foreground">
              <!--   Total (transfer + hospedagem): -->
              Total (transfer + hospedagem + transfer hotel em Santos/porto):
              <div class="text-2xl font-extrabold text-pink-600">
                {{ formatCurrency(transferPrice + getLodgingTotal(l)) }}
              </div>
            </div>
            <button
              class="btn btn-primary gradient-ocean mt-3"
              @click="onChoose(l)"
            >
              Reservar
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="flex gap-4">
      <button class="btn btn-outline flex-1 text-lg" @click="$emit('prev')">
        Voltar
      </button>
    </div>
    <!-- Viewer Modal (teleport para body, ocupa toda a tela) -->
    <Teleport to="body">
      <div
        v-if="viewerOpen"
        class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70"
        @click.self="closeViewer"
      >
        <div
          class="relative bg-white rounded-lg shadow-large max-w-5xl w-full p-4"
        >
          <img
            :src="toDataUrl(viewerLodging?.images?.[viewerIndex] || '')"
            alt="Imagem"
            class="w-full max-h-[80vh] object-contain"
          />
          <button
            class="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 border rounded-full w-10 h-10 flex items-center justify-center text-base transition-none active:-translate-y-1/2"
            @click="viewerPrev"
          >
            ◀
          </button>
          <button
            class="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 border rounded-full w-10 h-10 flex items-center justify-center text-base transition-none active:-translate-y-1/2"
            @click="viewerNext"
          >
            ▶
          </button>
          <button
            class="absolute top-3 right-3 bg-white/90 border rounded px-3 py-1 text-sm"
            @click="closeViewer"
          >
            Fechar
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { Users, DollarSign, AlertCircle } from "lucide-vue-next";
import type { LodgingRow } from "@/services/supabase";
import { formatDateBR } from "@/utils/formatDateBR";
import { reactive, ref } from "vue";

const props = defineProps<{
  lodgings: LodgingRow[];
  passengers: number;
  tripDate: string;
  transferPrice: number;
}>();

const emit = defineEmits<{
  (
    e: "finish",
    payload: {
      lodging: LodgingRow;
      apartmentsCount: number;
      lodgingTotal: number;
    },
  ): void;
  (e: "prev"): void;
}>();

const formatCurrency = (value: number) =>
  `R$${Math.round(value).toLocaleString("pt-BR")}`;

function getApartmentsNeeded(l: LodgingRow) {
  const pax = props.passengers || 0;
  const cap = l.pax_per_apartment || 1;
  return Math.max(1, Math.ceil(pax / cap));
}

function getLodgingTotal(l: LodgingRow) {
  const count = getApartmentsNeeded(l);
  const unit = Number(l.price_per_apartment || 0);
  return count * unit;
}

function onChoose(l: LodgingRow) {
  emit("finish", {
    lodging: l,
    apartmentsCount: getApartmentsNeeded(l),
    lodgingTotal: getLodgingTotal(l),
  });
}

const currentIndex = reactive<Record<string, number>>({});
function prev(id: string, len: number) {
  const idx = currentIndex[id] || 0;
  currentIndex[id] = (idx - 1 + len) % len;
}
function next(id: string, len: number) {
  const idx = currentIndex[id] || 0;
  currentIndex[id] = (idx + 1) % len;
}
function toDataUrl(base64?: string) {
  if (!base64) return "";
  return `data:image/*;base64,${base64}`;
}

const viewerOpen = ref(false);
const viewerLodging = ref<LodgingRow | null>(null);
const viewerIndex = ref(0);
function openViewer(l: LodgingRow) {
  viewerLodging.value = l;
  viewerIndex.value = currentIndex[l.id] || 0;
  viewerOpen.value = true;
}
function closeViewer() {
  viewerOpen.value = false;
}
function viewerPrev() {
  const imgs = viewerLodging.value?.images || [];
  const len = imgs.length;
  if (!len) return;
  viewerIndex.value = (viewerIndex.value - 1 + len) % len;
}
function viewerNext() {
  const imgs = viewerLodging.value?.images || [];
  const len = imgs.length;
  if (!len) return;
  viewerIndex.value = (viewerIndex.value + 1) % len;
}
</script>
