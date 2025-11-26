<template>
  <div class="min-h-screen pt-32 pb-20 px-4">
    <div class="container mx-auto max-w-4xl">
      <div
        class="transform-gpu origin-top scale-[0.95] sm:scale-[0.9] md:scale-[0.875] lg:scale-[0.85] xl:scale-[0.8]"
      >
        <div class="text-center mb-12">
          <Calculator class="h-16 w-16 text-brand-primary mx-auto mb-4" />
          <h1 class="text-5xl font-bold mb-4">Calculadora de Preços</h1>
          <p class="text-xl text-muted-foreground">
            Conheça, online, o valor dos nossos serviços.
          </p>
        </div>

        <div ref="calcCardRef" class="card p-8 shadow-large">
          <!-- Progress Bar -->
          <div v-if="currentVisibleIndex !== 6" class="mb-8">
            <div class="flex justify-between mb-2">
              <div
                v-for="item in progressItems"
                :key="item.s"
                :class="[
                  'flex-1 h-2 rounded-full mx-1 transition-smooth',
                  item.active ? 'bg-brand-primary' : 'bg-muted',
                ]"
              />
            </div>
            <p class="text-sm text-muted-foreground text-center">
              Passo {{ currentVisibleIndex }} de {{ visibleSteps.length }}
            </p>
          </div>

          <!-- Transição suave entre passos da calculadora -->
          <Transition
            mode="out-in"
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-300 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 translate-y-2"
          >
            <div :key="calculatorStore.step">
              <!-- Step 1: Trip Type -->
              <Step1TripType
                v-if="calculatorStore.step === 1"
                @next="handleNext"
              />

              <!-- Step 2: CEP (origem/destino) -->
              <Step2Cep
                v-if="calculatorStore.step === 2"
                :origin-zone-name="originZone ? originZone.name : null"
                :zones="zonesDb"
                @prev="calculatorStore.previousStep()"
                @next="handleNext"
              />

              <!-- Step 3: Data (restrita por temporada) -->
              <Step3Date
                v-if="calculatorStore.step === 3"
                :season-start="seasonStart"
                :season-end="seasonEnd"
                @prev="calculatorStore.previousStep()"
                @next="handleNext"
              />

              <!-- Step 4: Passengers -->
              <Step4Passengers
                v-if="calculatorStore.step === 4"
                @prev="calculatorStore.previousStep()"
                @next="handleNext"
              />

              <!-- Step 6: Vehicle Type -->
              <Step6VehicleType
                v-if="calculatorStore.step === 6"
                :vehicle-type-options="vehicleTypeOptions"
                :get-estimated-vehicle-price="getEstimatedVehiclePrice"
                :get-vehicle-capacity="getVehicleCapacityMax"
                :get-vehicle-suitcases="getVehicleSuitcases"
                @prev="calculatorStore.previousStep()"
                @calculate="handleCalculate"
              />

              <!-- Step 8: Hospedagem (modo cruzeiro + hospedagem) -->
              <Step8Lodging
                v-if="calculatorStore.step === 8 && withLodging"
                :lodgings="lodgingsDb"
                :passengers="Number(calculatorStore.passengers || '0')"
                :trip-date="calculatorStore.date"
                :transfer-price="
                  estimateLegPriceDb(originZone, calculatorStore.vehicleType)
                "
                @prev="calculatorStore.step = 6"
                @finish="handleFinishLodging"
              />

              <!-- Step 7: Result -->
              <div
                v-if="calculatorStore.step === 7 && calculatorStore.result"
                ref="resultSectionRef"
                class="space-y-6"
              >
                <Step7Result
                  :origin-zone="originZone"
                  :has-return="hasReturn"
                  :return-cep="returnCep"
                  :return-zone="returnZone"
                  :return-date="returnDate"
                  :return-passengers="returnPassengers"
                  :return-vehicle-type="returnVehicleType"
                  :get-service-name-for-vehicle="getServiceNameForVehicle"
                  :on-reset="handleReset"
                  :on-send-quote="openReservationForm"
                />

                <!-- Adicionar Volta -->
                <Step7AddReturn
                  v-if="calculatorStore.tripType === 'roundtrip' && !hasReturn"
                  :season-start="seasonStart"
                  :season-end="seasonEnd"
                  :vehicle-type-options="returnVehicleTypeOptions"
                  :zones="zonesDb"
                  :return-cep="returnCep"
                  :return-zone="returnZone"
                  :return-date="returnDate"
                  :return-passengers="returnPassengers"
                  :return-vehicle-type="returnVehicleType"
                  :get-estimated-vehicle-price="
                    getEstimatedPriceForReturnVehicle
                  "
                  :get-vehicle-capacity="getVehicleCapacityMax"
                  :get-vehicle-suitcases="getVehicleSuitcases"
                  @update:return-cep="(v: string) => (returnCep = v)"
                  @update:return-date="(v: string) => (returnDate = v)"
                  @update:return-passengers="
                    (v: string) => (returnPassengers = v)
                  "
                  @update:return-vehicle-type="
                    (v: string) => (returnVehicleType = v)
                  "
                  @add="addReturnLeg"
                />
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </div>

  <Teleport to="body">
    <div v-if="showReservationModal" class="fixed inset-0 z-[1000]">
      <div
        class="absolute inset-0 bg-black/40"
        @click="closeReservationForm"
      ></div>
      <div class="absolute inset-0 flex items-center justify-center p-4">
        <div
          class="bg-white rounded-2xl shadow-large w-full max-w-lg border border-gray-200"
        >
          <div class="p-6 space-y-4">
            <h3
              class="text-2xl font-bold bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent"
            >
              Solicitar Reserva
            </h3>
            <p class="text-sm text-muted-foreground">
              Informe seus dados para agilizar o atendimento via WhatsApp.
            </p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="md:col-span-2">
                <label class="text-sm mb-1 block">Nome</label>
                <input
                  v-model="contactName"
                  class="h-12 px-3 border border-gray-200 rounded-md bg-white w-full"
                  placeholder="Seu nome"
                />
              </div>
              <div>
                <label class="text-sm mb-1 block">Telefone</label>
                <input
                  v-model="contactPhone"
                  class="h-12 px-3 border border-gray-200 rounded-md bg-white w-full"
                  placeholder="(DDD) 90000-0000"
                />
              </div>
              <div>
                <label class="text-sm mb-1 block">Estado (UF)</label>
                <select
                  v-model="contactState"
                  class="h-12 px-3 border border-gray-200 rounded-md bg-white w-full"
                >
                  <option value="">Selecione</option>
                  <option v-for="s in BR_STATES" :key="s.uf" :value="s.uf">
                    {{ s.name }} ({{ s.uf }})
                  </option>
                </select>
              </div>

              <div class="md:col-span-2">
                <label class="text-sm mb-1 block">Observação </label>
                <textarea
                  v-model="contactObservation"
                  class="h-12 px-3 border border-gray-200 rounded-md bg-white w-full"
                  placeholder="Qualquer observação que você queira fazer."
                />
              </div>
            </div>
            <div class="flex gap-3 justify-end pt-2">
              <button class="btn btn-outline" @click="closeReservationForm">
                Cancelar
              </button>
              <button
                class="btn btn-primary gradient-ocean"
                @click="submitReservationForm"
              >
                Enviar pelo WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useCalculatorStore } from "@/stores/calculator";
import { useToastStore } from "@/stores/toast";
import { useRoute } from "vue-router";
import {
  fetchZones,
  fetchVehicles,
  fetchServices,
  fetchLodgings,
  findZoneByCepFromDb,
  getSeasonDates,
  type VehicleRow,
  type ZoneRow,
  type ServiceRow,
  type LodgingRow,
} from "@/services/supabase";
import { formatDateBR } from "@/utils/formatDateBR";
// Step components (refactor structure)
import Step1TripType from "./components/Step1TripType.vue";
import Step2Cep from "./components/Step2Cep.vue";
import Step3Date from "./components/Step3Date.vue";
import Step4Passengers from "./components/Step4Passengers.vue";
import Step6VehicleType from "./components/Step6VehicleType.vue";
import Step7Result from "./components/Step7Result.vue";
import Step7AddReturn from "./components/Step7AddReturn.vue";
import { computed, ref, onMounted, onUnmounted, watch, nextTick } from "vue";
import Step8Lodging from "@/pages/Calculadora/components/Step8Lodging.vue";
import { WHATSAPP_NUMBER } from "@/constants/contacts";

const calculatorStore = useCalculatorStore();
const toastStore = useToastStore();
const BR_STATES = [
  { uf: "AC", name: "Acre" },
  { uf: "AL", name: "Alagoas" },
  { uf: "AP", name: "Amapá" },
  { uf: "AM", name: "Amazonas" },
  { uf: "BA", name: "Bahia" },
  { uf: "CE", name: "Ceará" },
  { uf: "DF", name: "Distrito Federal" },
  { uf: "ES", name: "Espírito Santo" },
  { uf: "GO", name: "Goiás" },
  { uf: "MA", name: "Maranhão" },
  { uf: "MT", name: "Mato Grosso" },
  { uf: "MS", name: "Mato Grosso do Sul" },
  { uf: "MG", name: "Minas Gerais" },
  { uf: "PA", name: "Pará" },
  { uf: "PB", name: "Paraíba" },
  { uf: "PR", name: "Paraná" },
  { uf: "PE", name: "Pernambuco" },
  { uf: "PI", name: "Piauí" },
  { uf: "RJ", name: "Rio de Janeiro" },
  { uf: "RN", name: "Rio Grande do Norte" },
  { uf: "RO", name: "Rondônia" },
  { uf: "RS", name: "Rio Grande do Sul" },
  { uf: "RR", name: "Roraima" },
  { uf: "SC", name: "Santa Catarina" },
  { uf: "SE", name: "Sergipe" },
  { uf: "SP", name: "São Paulo" },
  { uf: "TO", name: "Tocantins" },
];

// Barra de progresso: esconder Step 5 (Serviço) enquanto desabilitado
const route = useRoute();
const withLodging = computed(() => route.query.lodging === "true");
const visibleSteps = computed<number[]>(() =>
  withLodging.value ? [1, 2, 3, 4, 6, 8, 7] : [1, 2, 3, 4, 6, 7],
);
const currentVisibleIndex = computed<number>(() => {
  const idx = visibleSteps.value.indexOf(calculatorStore.step);
  return idx >= 0 ? idx + 1 : visibleSteps.value.length;
});
const progressItems = computed(() =>
  visibleSteps.value.map((s, i) => ({
    s,
    active: i < currentVisibleIndex.value,
  })),
);

// Dados vindos do Supabase
const zonesDb = ref<ZoneRow[]>([]);
const vehiclesDb = ref<VehicleRow[]>([]);
const servicesDb = ref<ServiceRow[]>([]);
const lodgingsDb = ref<LodgingRow[]>([]);

const originZone = computed(() => {
  if (zonesDb.value.length)
    return findZoneByCepFromDb(zonesDb.value, calculatorStore.origin);
  return null;
});
const hasReturn = ref(false);
const returnCep = ref("");
const returnZone = computed(() =>
  findZoneByCepFromDb(zonesDb.value, returnCep.value),
);
const vehicleTypeOptions = computed(() => {
  if (!vehiclesDb.value.length)
    return ["Sedan Executivo", "SUV Premium", "Van (até 12 pax)"];
  // Serviço desabilitado: filtra apenas por capacidade
  const pax = Number(calculatorStore.passengers || "0");
  const list = vehiclesDb.value.filter((v) => !pax || v.capacity_max >= pax);
  return list.map((v) => v.name);
});
const returnPassengers = ref("");
const returnVehicleType = ref("");
// Opções de veículo para a volta (filtradas pela quantidade de passageiros da volta quando informado)
const returnVehicleTypeOptions = computed(() => {
  if (!vehiclesDb.value.length)
    return ["Sedan Executivo", "SUV Premium", "Van (até 12 pax)"];
  const pax = Number(
    returnPassengers.value || calculatorStore.passengers || "0",
  );
  const list = vehiclesDb.value.filter((v) => !pax || v.capacity_max >= pax);
  return list.map((v) => v.name);
});

// Step 3 controla seu próprio calendário de data; removidos estados auxiliares locais

// Datas de temporada
const seasonStart = ref<string>("");
const seasonEnd = ref<string>("");
const returnDate = ref<string>("");
// Step 7 (Adicionar Volta) controla seu próprio calendário via componente

const isDateInSeason = (dateStr: string) => {
  if (!dateStr || !seasonStart.value || !seasonEnd.value) return false;
  return dateStr >= seasonStart.value && dateStr <= seasonEnd.value;
};

// A sincronização da data de volta é feita dentro do componente Step7AddReturn

const showReservationModal = ref(false);
const contactName = ref("");
const contactPhone = ref("");
const contactState = ref("");
const contactObservation = ref("");
const hpField = ref("");
let formOpenedAt = 0;

function openReservationForm() {
  showReservationModal.value = true;
  hpField.value = "";
  formOpenedAt = Date.now();
}
function closeReservationForm() {
  showReservationModal.value = false;
}

const handleNext = () => {
  if (calculatorStore.step === 1) {
    if (!calculatorStore.tripType) {
      toastStore.warning("Selecione o Tipo de Serviço");
      return;
    }
  } else if (calculatorStore.step === 2) {
    if (!calculatorStore.origin) {
      toastStore.warning(
        calculatorStore.tripType === "returnonly"
          ? "Informe o CEP de destino"
          : "Informe o CEP de origem",
      );
      return;
    }
    if (!originZone.value) {
      toastStore.warning(
        calculatorStore.tripType === "returnonly"
          ? "CEP de destino fora das faixas atendidas. Verifique o número ou entre em contato."
          : "CEP fora das faixas atendidas. Verifique o número ou entre em contato.",
      );
      return;
    }
  } else if (calculatorStore.step === 3) {
    if (!calculatorStore.date) {
      toastStore.warning(
        calculatorStore.tripType === "returnonly"
          ? "Selecione a data da volta"
          : "Selecione a data do transfer",
      );
      return;
    }
    if (!isDateInSeason(calculatorStore.date)) {
      toastStore.warning(
        calculatorStore.tripType === "returnonly"
          ? "A data da volta precisa estar dentro da temporada definida."
          : "A data precisa estar dentro da temporada definida.",
      );
      return;
    }
  } else if (calculatorStore.step === 4) {
    if (!calculatorStore.passengers || Number(calculatorStore.passengers) < 1) {
      toastStore.warning("Informe a quantidade de passageiros");
      return;
    }
  } else if (calculatorStore.step === 5) {
    // Etapa de serviço desabilitada: seguir adiante
  }

  // Pular a etapa 5 quando desabilitada
  if (calculatorStore.step === 4) {
    calculatorStore.step = 6;
  } else {
    calculatorStore.nextStep();
  }
};

const handleCalculate = () => {
  if (!calculatorStore.vehicleType) {
    toastStore.warning("Selecione o tipo de veículo");
    return;
  }
  // No modo com hospedagem, após escolher o veículo, segue para a etapa de hospedagem
  if (withLodging.value) {
    calculatorStore.step = 8;
    return;
  }
  // Se "Somente Volta", o CEP informado representa o destino e calculamos a volta
  const range = estimateTripTotalDb({
    zone: originZone.value,
    vehicleName: calculatorStore.vehicleType,
  });
  calculatorStore.setResult(range);
  // Validação do vínculo de serviço com o veículo
  const vObj = vehiclesDb.value.find(
    (v) => v.name === calculatorStore.vehicleType,
  );
  if (!vObj || !vObj.service_id) {
    toastStore.error(
      "Veículo sem serviço vinculado. Atualize no Admin Veículos.",
    );
    return;
  }
  calculatorStore.step = 7;
  hasReturn.value = false;
  toastStore.success("Orçamento calculado com sucesso!");
};

// Finaliza orçamento incluindo hospedagem
const handleFinishLodging = (payload: {
  lodging: LodgingRow;
  apartmentsCount: number;
  lodgingTotal: number;
}) => {
  const transfer = estimateLegPriceDb(
    originZone.value,
    calculatorStore.vehicleType,
  );
  const total = transfer + payload.lodgingTotal;
  const minPrice = Math.round(total * 0.95);
  const maxPrice = Math.round(total * 1.15);
  calculatorStore.setResult({ minPrice, maxPrice, total });
  if (typeof calculatorStore.setLodgingSelection === "function") {
    calculatorStore.setLodgingSelection(
      payload.lodging.name,
      payload.apartmentsCount,
      payload.lodgingTotal,
    );
  }
  calculatorStore.step = 7;
  toastStore.success("Orçamento (transfer + hospedagem) calculado!");
};

const handleReset = () => {
  calculatorStore.resetCalculator();
  // Resetar também os dados da volta (controlados localmente neste componente)
  hasReturn.value = false;
  returnCep.value = "";
  returnPassengers.value = "";
  returnVehicleType.value = "";
  returnDate.value = "";
  toastStore.info("Calculadora reiniciada");
};

const getEstimatedVehiclePrice = (vehicle: string) => {
  const price = estimateLegPriceDb(originZone.value, vehicle);
  return formatCurrencyNoDecimals(price);
};

// Preço estimado da volta (exibe ao lado das opções de veículo na seleção de retorno)
const getEstimatedPriceForReturnVehicle = (vehicle: string) => {
  const price = estimateLegPriceDb(returnZone.value, vehicle);
  return formatCurrencyNoDecimals(price);
};

// Formata moeda sem casas decimais, seguindo o exemplo (R$1.600)
const formatCurrencyNoDecimals = (value: number) =>
  `R$${Math.round(value).toLocaleString("pt-BR")}`;

const getServiceNameForVehicle = (vehicle: string) => {
  const v = vehiclesDb.value.find((x) => x.name === vehicle);
  if (!v || !v.service_id) return "Não vinculado";
  const svc = servicesDb.value.find((s) => s.id === v.service_id);
  return svc ? svc.name : "Não vinculado";
};

const addReturnLeg = () => {
  if (!returnCep.value) {
    toastStore.warning("Informe o CEP de destino da volta");
    return;
  }
  if (!returnZone.value) {
    toastStore.warning(
      "CEP da volta fora das faixas atendidas. Verifique o número ou entre em contato.",
    );
    return;
  }
  const vName = returnVehicleType.value || calculatorStore.vehicleType;
  if (!vName) {
    toastStore.warning(
      "Selecione o veículo para a volta ou mantenha o mesmo da ida",
    );
    return;
  }
  // Validação de capacidade do veículo na volta
  const vObj = vehiclesDb.value.find((v) => v.name === vName);
  const pax = Number(
    returnPassengers.value || calculatorStore.passengers || "0",
  );
  if (vObj && pax > vObj.capacity_max) {
    toastStore.warning(
      `O veículo selecionado suporta até ${vObj.capacity_max} passageiros na volta.`,
    );
    return;
  }
  const range = estimateTripTotalDb(
    { zone: originZone.value, vehicleName: calculatorStore.vehicleType },
    { zone: returnZone.value, vehicleName: vName },
  );
  // Se houver hospedagem selecionada, somar ao total final
  if (withLodging.value && (calculatorStore as any).lodgingTotal != null) {
    const leg1 = estimateLegPriceDb(
      originZone.value,
      calculatorStore.vehicleType,
    );
    const leg2 = estimateLegPriceDb(returnZone.value, vName);
    const lodgingTotal = Number((calculatorStore as any).lodgingTotal || 0);
    let total = leg1 + leg2 + lodgingTotal;
    const minPrice = Math.round(total * 0.95);
    const maxPrice = Math.round(total * 1.15);
    calculatorStore.setResult({ minPrice, maxPrice, total });
  } else {
    calculatorStore.setResult(range);
  }
  hasReturn.value = true;
  toastStore.success("Volta adicionada ao orçamento!");
  nextTick(() => {
    resultSectionRef.value?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  });
};

// Centraliza o card ao avançar nos passos
const calcCardRef = ref<HTMLElement | null>(null);
const resultSectionRef = ref<HTMLElement | null>(null);
watch(
  () => calculatorStore.step,
  async () => {
    await nextTick();
    calcCardRef.value?.scrollIntoView({ behavior: "smooth", block: "center" });
  },
);

const buildQuoteMessage = () => {
  const result = calculatorStore.result;
  const total = result ? result.total.toLocaleString("pt-BR") : "";
  const paxIda = calculatorStore.passengers || "";
  const veiculoIda = calculatorStore.vehicleType || "";
  const servicoIda = getServiceNameForVehicle(veiculoIda);
  const origemCep = calculatorStore.origin || "";
  const origemRegiao = originZone.value
    ? originZone.value.name
    : "Não encontrada";
  const dataIdaBR = formatDateBR(calculatorStore.date || "");

  let text = `Olá! Gostaria de solicitar reserva.\n\n`;
  if (calculatorStore.tripType === "returnonly") {
    const destinoVoltaCep = origemCep;
    const destinoVoltaRegiao = origemRegiao;
    const paxVolta = paxIda;
    const veiculoVolta = veiculoIda;
    const servicoVolta = getServiceNameForVehicle(veiculoVolta);
    const dataVoltaBR = dataIdaBR;
    text +=
      `Tipo de Serviço: Somente Volta\n` +
      `Volta: Porto de Santos -> Destino CEP ${destinoVoltaCep} (Região: ${destinoVoltaRegiao})\n` +
      `Data (volta): ${dataVoltaBR}\n` +
      `Passageiros (volta): ${paxVolta}\n` +
      `Serviço (volta): ${servicoVolta}\n` +
      `Veículo (volta): ${veiculoVolta}`;
  } else {
    text +=
      `Tipo de Serviço: ${calculatorStore.tripType === "roundtrip" ? "Ida e Volta" : "Somente Ida"}\n` +
      //`Nome: ${name}\n` +
      //`Endereço: ${address} - ${addressState}\n` +
      `Ida: Origem CEP ${origemCep} (Região: ${origemRegiao}) -> Porto de Santos\n` +
      `Data (ida): ${dataIdaBR}\n` +
      `Passageiros (ida): ${paxIda}\n` +
      `Serviço (ida): ${servicoIda}\n` +
      `Veículo (ida): ${veiculoIda}`;
  }

  if (calculatorStore.tripType === "roundtrip") {
    const destinoVoltaCep = returnCep.value || "";
    const destinoVoltaRegiao = returnZone.value
      ? returnZone.value.name
      : "Não encontrada";
    const paxVolta = returnPassengers.value || paxIda;
    const veiculoVolta = returnVehicleType.value || veiculoIda;
    const servicoVolta = getServiceNameForVehicle(veiculoVolta);
    const dataVoltaBR = formatDateBR(returnDate.value || "");
    text +=
      `\nVolta: Porto de Santos -> Destino CEP ${destinoVoltaCep} (Região: ${destinoVoltaRegiao})` +
      `\nData (volta): ${dataVoltaBR}` +
      `\nPassageiros (volta): ${paxVolta}` +
      `\nServiço (volta): ${servicoVolta}` +
      `\nVeículo (volta): ${veiculoVolta}`;
  }

  // Dados de voo (quando destino selecionado for aeroporto)
  const destName = (calculatorStore as any).destination || "";
  if ((destName || "").toLowerCase().includes("aeroporto")) {
    const cia = (calculatorStore as any).airline || "";
    const voo = (calculatorStore as any).flightNumber || "";
    const hora = (calculatorStore as any).arrivalTime || "";
    text += `\n\nDados do voo:`;
    text += `\nCia. Aérea: ${cia || "—"}`;
    text += `\nNo. Vôo: ${voo || "—"}`;
    text += `\nHorário previsto de chegada: ${hora || "—"}`;
  }
  // Ponto de encontro (quando não for aeroporto)
  else {
    const rua = (calculatorStore as any).meetingStreet || "";
    const numero = (calculatorStore as any).meetingNumber || "";
    const bairro = (calculatorStore as any).meetingNeighborhood || "";
    const cidade = (calculatorStore as any).meetingCity || "";
    const uf = (calculatorStore as any).meetingState || "";
    const hora = (calculatorStore as any).meetingTime || "";
    text += `\n\nPonto de encontro:`;
    text += `\nEndereço: ${rua || "—"}, Nº ${numero || "—"}`;
    text += `\nBairro: ${bairro || "—"}`;
    text += `\nCidade: ${cidade || "—"}`;
    text += `\nEstado (UF): ${uf || "—"}`;
    text += `\nHorário: ${hora || "—"}`;
  }

  // Hospedagem (quando selecionada)
  /*   if (
    (calculatorStore as any).lodgingName &&
    ((calculatorStore as any).lodgingTotal || 0) >= 0
  ) {
    const aptos = (calculatorStore as any).lodgingApartments || 0;
    const hospedagemTotal = (calculatorStore as any).lodgingTotal || 0;
    const hospedagemTotalBR = hospedagemTotal.toLocaleString("pt-BR");
    text +=
      `\n\nHospedagem: ${(calculatorStore as any).lodgingName}` +
      `\nApartamentos necessários: ${aptos}` +
      `\nTotal hospedagem: R$ ${hospedagemTotalBR}`;
  } */

  if (total) {
    text += `\n\nPreço: R$ ${total}`;
  }
  text += `\n\nObservações: estimativa sujeita a alterações (horário, pedágios, paradas).`;
  return text;
};

function buildContactPrefix() {
  const n = (contactName.value || "").trim();
  const p = (contactPhone.value || "").trim();
  const s = (contactState.value || "").trim();
  const o = (contactObservation.value || "").trim();

  let prefix = "";
  if (n || p || s || o) {
    prefix = `Dados de contato:\nNome: ${n || "—"}\nTelefone: ${p || "—"}\nEstado: ${s || "—"}\nObservação: ${o || "—"}\n\n`;
  }
  return prefix;
}

async function submitReservationForm() {
  if (hpField.value) {
    toastStore.warning("Verificação falhou. Tente novamente.");
    return;
  }
  if (Date.now() - formOpenedAt < 2000) {
    toastStore.warning("Preencha os dados com atenção antes de enviar.");
    return;
  }
  const phoneDigits = (contactPhone.value || "").replace(/\D/g, "");
  if (
    !contactName.value ||
    !phoneDigits ||
    phoneDigits.length < 10 ||
    !contactState.value
  ) {
    toastStore.warning("Preencha nome, telefone e estado (UF)");
    return;
  }

  const prefix = buildContactPrefix();
  const msg = prefix + buildQuoteMessage();
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  showReservationModal.value = false;
  window.open(url, "_blank");
}

// Helpers baseados em dados do Supabase
// Observação: zone.price_add agora é usado diretamente do banco (Admin Zonas)

// getServiceBasePrice removido: cálculo usa o serviço vinculado diretamente ao veículo
// Obtém o base_price do serviço vinculado ao veículo (via service_id)
const getBasePriceForVehicle = (vehicleName: string) => {
  const v = getVehicleData(vehicleName);
  if (!v || !v.service_id) return 0; // service_id obrigatório
  const svc = servicesDb.value.find((s) => s.id === v.service_id);
  return svc ? Number(svc.base_price || 0) : 0;
};

const getVehicleData = (vehicleName: string) => {
  return vehiclesDb.value.find((v) => v.name === vehicleName) || null;
};

// Obtém capacity_max (assentos) do veículo a partir do banco
const getVehicleCapacityMax = (vehicleName: string): number => {
  const v = getVehicleData(vehicleName);
  const cap = v ? Number(v.capacity_max || 0) : 0;
  // Caso não exista info no banco, utiliza um fallback simples
  if (!cap) {
    const n = (vehicleName || "").toLowerCase();
    if (n.includes("van")) return 12;
    if (n.includes("suv")) return 5;
    return 4;
  }
  return cap;
};

// Obtém quantidade de malas (suitcases) do veículo a partir do banco
const getVehicleSuitcases = (vehicleName: string): number => {
  const v = getVehicleData(vehicleName);
  const bags =
    v && typeof v.suitcases !== "undefined" ? Number(v.suitcases) : 0;
  return Number.isFinite(bags) && bags >= 0 ? bags : 0;
};

function estimateLegPriceDb(zone: ZoneRow | null, vehicleName: string): number {
  const base = getBasePriceForVehicle(vehicleName);
  const v = getVehicleData(vehicleName);
  const vehicleAdd = v ? Number(v.price_add || 0) : 0;
  // Usa o acréscimo configurado na própria zona (Supabase). Caso não exista, aplica um padrão.
  const zoneAdd = zone && zone.price_add != null ? Number(zone.price_add) : 0;
  return base + vehicleAdd + zoneAdd;
}

function estimateTripTotalDb(
  firstLeg: { zone: ZoneRow | null; vehicleName: string },
  secondLeg?: { zone: ZoneRow | null; vehicleName: string },
) {
  const p1 = estimateLegPriceDb(firstLeg.zone, firstLeg.vehicleName);
  let total = p1;
  if (secondLeg) {
    const p2 = estimateLegPriceDb(secondLeg.zone, secondLeg.vehicleName);
    total += p2;
  }
  const minPrice = Math.round(total * 0.95);
  const maxPrice = Math.round(total * 1.15);
  return { minPrice, maxPrice, total };
}

onMounted(async () => {
  // Define modo hospedagem a partir da rota
  if (typeof calculatorStore.enableLodging === "function") {
    calculatorStore.enableLodging(withLodging.value);
  }
  try {
    const [zn, sv, vh, season] = await Promise.all([
      fetchZones(),
      fetchServices(),
      fetchVehicles(),
      getSeasonDates(),
    ]);
    zonesDb.value = zn;
    servicesDb.value = sv;
    vehiclesDb.value = vh;
    seasonStart.value = season.start || "";
    seasonEnd.value = season.end || "";
    if (withLodging.value) {
      try {
        lodgingsDb.value = await fetchLodgings();
      } catch (e) {
        console.warn("[Calculadora] Falha ao carregar hospedagens:", e);
      }
    }
  } catch (err) {
    console.warn("[Calculadora] Falha ao carregar dados do Supabase:", err);
  }
});

onUnmounted(() => calculatorStore.resetCalculator());
</script>
