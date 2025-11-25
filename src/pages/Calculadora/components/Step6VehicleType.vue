<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-bold text-center mb-6">Tipo de Veículo</h2>
    <div class="space-y-6">
      <div
        v-for="vehicle in vehicleTypeOptions"
        :key="vehicle"
        class="rounded-lg border shadow-sm p-4 md:p-6 bg-white"
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
                  <Info class="h-5 w-5" aria-describedby="tip-vehicle-info" />
                </button>
                <div
                  id="tip-vehicle-info"
                  role="tooltip"
                  class="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition"
                >
                  abrir medidas das malas
                </div>
              </div>
            </div>
            <!--  <div class="text-sm text-emerald-600 mt-3">
              Cancelamento gratuito até 24 horas antes
            </div> -->
          </div>

          <!-- Preço e botão -->
          <div class="md:w-1/3 text-right">
            <div class="text-sm text-muted-foreground">
              Preço total por veículo
            </div>
            <div class="text-2xl font-extrabold text-pink-600">
              {{ getEstimatedVehiclePrice(vehicle) }}
            </div>
            <button
              class="btn btn-primary gradient-ocean mt-3"
              @click="onReserve(vehicle)"
            >
              Reservar
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="flex gap-4">
      <button
        class="btn btn-primary gradient-ocean flex-1 text-lg flex items-center justify-center gap-2"
        @click="$emit('prev')"
      >
        <ArrowLeft class="h-5 w-5" />
        Voltar
      </button>
      <!--  <button
        class="btn btn-primary gradient-ocean flex-1 text-lg"
        @click="$emit('calculate')"
      >
        Calcular Preço
        <DollarSign class="ml-2 h-5 w-5" />
      </button> -->
    </div>
    <!-- Modal de medidas das malas (teleportado para body para evitar problemas de z-index/stacking context) -->
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
import { Users, Briefcase, Info, DollarSign, ArrowLeft } from "lucide-vue-next";
import { useCalculatorStore } from "@/stores/calculator";
import { ref } from "vue";

const props = defineProps<{
  vehicleTypeOptions: string[];
  originZoneName?: string | null;
  getEstimatedVehiclePrice: (vehicle: string) => string;
  // Função opcional para obter capacidade diretamente do banco de dados (capacity_max)
  getVehicleCapacity?: (vehicle: string) => number;
  // Função opcional para obter quantidade de malas (suitcases) do banco
  getVehicleSuitcases?: (vehicle: string) => number;
}>();

const emit = defineEmits<{ (e: "calculate"): void; (e: "prev"): void }>();
const calculatorStore = useCalculatorStore();

const onReserve = (vehicle: string) => {
  calculatorStore.setVehicleType(vehicle);
  emit("calculate");
};

// Obtém capacidade do veículo preferindo a função vinda do index.vue (DB: capacity_max)
const getVehicleCapacity = (vehicle: string) => {
  console.log("getVehicleCapacity", vehicle);
  if (typeof props.getVehicleCapacity === "function") {
    const dbCap = Number(props.getVehicleCapacity(vehicle) || 0);
    if (!Number.isNaN(dbCap) && dbCap > 0) return dbCap;
  }
  // Fallback heurístico caso não haja dado do banco
  const name = (vehicle || "").toLowerCase();
  if (name.includes("van")) return 12;
  if (name.includes("suv")) return 5;
  return 4;
};

// Obtém quantidade de malas diretamente do banco se disponível; caso contrário, 0
const getSuitcases = (vehicle: string) => {
  if (typeof props.getVehicleSuitcases === "function") {
    const val = Number(props.getVehicleSuitcases(vehicle) || 0);
    if (!Number.isNaN(val) && val >= 0) return val;
  }
  return 0;
};

const getVehicleImage = (vehicle: string) => {
  const cap = getVehicleCapacity(vehicle);
  // Em apps Vite, arquivos em /public são servidos a partir de "/"
  if (cap <= 3) return "/images/sedan.jpg";
  if (cap <= 6) return "/images/suv.png";
  return "/images/van.jpg";
};
const onVehicleImageError = (e: Event, vehicle: string) => {
  // Fallback 100% local para evitar depender de hosts externos (Unsplash)
  const name = (vehicle || "").toLowerCase();
  const target = e.target as HTMLImageElement;
  if (name.includes("van")) target.src = "/images/van.jpg";
  else if (name.includes("suv")) target.src = "/images/suv.png";
  else target.src = "/images/sedan.jpg";
};

// Modal simples para exibir imagem de medidas das malas
const showLuggageModal = ref(false);
function openLuggageModal() {
  showLuggageModal.value = true;
}
function closeLuggageModal() {
  showLuggageModal.value = false;
}
</script>

<style scoped>
.modal-backdrop {
  background: rgba(0, 0, 0, 0.35);
}
</style>
