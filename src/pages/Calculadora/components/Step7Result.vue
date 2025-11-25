<template>
  <div v-if="calculatorStore.result" class="space-y-6 text-center">
    <h2 class="text-2xl font-bold mb-6">Valor do serviço</h2>
    <div
      :class="[
        'p-8 rounded-xl shadow-xl border',
        'bg-card text-foreground border-brand-primary/20 ring-1 ring-brand-primary/15',
      ]"
    >
      <p class="text-xl mb-2 font-medium">
        {{
          calculatorStore.tripType === "roundtrip" && !hasReturn
            ? "Preço da ida"
            : calculatorStore.tripType === "returnonly"
              ? "Preço da volta"
              : "Valor do serviço"
        }}
      </p>
      <div
        class="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 text-foreground"
      >
        R$ {{ calculatorStore.result.total.toLocaleString("pt-BR") }}
        <!--  R$ {{ calculatorStore.result.minPrice.toLocaleString("pt-BR") }} - R$
        {{ calculatorStore.result.maxPrice.toLocaleString("pt-BR") }} -->
      </div>
      <p
        v-if="calculatorStore.tripType === 'roundtrip' && hasReturn"
        class="text-foreground text-lg mt-4 font-medium"
      >
        (Ida e volta incluso)
      </p>
      <div
        v-else-if="calculatorStore.tripType === 'roundtrip' && !hasReturn"
        class="mt-4 bg-amber-500/80 border rounded-md p-3 text-md"
      >
        Para o tipo "Ida e Volta", este valor corresponde apenas à ida. Adicione
        o percurso de volta abaixo para ver o total e habilitar a solicitação de
        reserva.
      </div>
      <!-- Resumo -->
      <div class="mt-6 text-left text-muted-foreground">
        <h3 class="text-lg font-semibold mb-2">Resumo</h3>
        <ul class="space-y-1 text-sm sm:text-base">
          <li>
            <span class="font-medium">Tipo:</span>
            {{
              calculatorStore.tripType === "roundtrip"
                ? "Ida e Volta"
                : calculatorStore.tripType === "returnonly"
                  ? "Somente Volta"
                  : "Somente Ida"
            }}
          </li>
          <template v-if="calculatorStore.tripType !== 'returnonly'">
            <li>
              <span class="font-medium">Origem:</span>
              CEP {{ calculatorStore.origin }} (Região:
              {{ originZone ? originZone.name : "Não encontrada" }})
            </li>
            <li>
              <span class="font-medium">Data (ida):</span>
              {{ formatDateBR(calculatorStore.date) }}
            </li>
            <li>
              <span class="font-medium">Passageiros (ida):</span>
              {{ calculatorStore.passengers }}
            </li>
            <li>
              <span class="font-medium">Serviço (ida):</span>
              {{ getServiceNameForVehicle(calculatorStore.vehicleType) }}
            </li>
            <li>
              <span class="font-medium">Veículo (ida):</span>
              {{ calculatorStore.vehicleType }}
            </li>
          </template>
          <template v-else>
            <li>
              <span class="font-medium">Volta:</span>
              Porto de Santos → CEP {{ calculatorStore.origin }} (Região:
              {{ originZone ? originZone.name : "Não encontrada" }})
            </li>
            <li>
              <span class="font-medium">Data (volta):</span>
              {{ formatDateBR(calculatorStore.date) }}
            </li>
            <li>
              <span class="font-medium">Passageiros (volta):</span>
              {{ calculatorStore.passengers }}
            </li>
            <li>
              <span class="font-medium">Serviço (volta):</span>
              {{ getServiceNameForVehicle(calculatorStore.vehicleType) }}
            </li>
            <li>
              <span class="font-medium">Veículo (volta):</span>
              {{ calculatorStore.vehicleType }}
            </li>
          </template>
          <template v-if="calculatorStore.tripType === 'roundtrip'">
            <template v-if="hasReturn">
              <li class="mt-2">
                <span class="font-medium">Volta:</span>
                Porto de Santos → CEP {{ returnCep }} (Região:
                {{ returnZone ? returnZone.name : "Não encontrada" }})
              </li>
              <li>
                <span class="font-medium">Data (volta):</span>
                {{ formatDateBR(returnDate) }}
              </li>
              <li>
                <span class="font-medium">Passageiros (volta):</span>
                {{ returnPassengers || calculatorStore.passengers }}
              </li>
              <li>
                <span class="font-medium">Serviço (volta):</span>
                {{
                  getServiceNameForVehicle(
                    returnVehicleType || calculatorStore.vehicleType,
                  )
                }}
              </li>
              <li>
                <span class="font-medium">Veículo (volta):</span>
                {{ returnVehicleType || calculatorStore.vehicleType }}
              </li>
            </template>
            <template v-else>
              <li class="mt-2">
                <span class="font-medium">Volta:</span> pendente — preencha os
                dados abaixo
              </li>
            </template>
          </template>
          <!-- Hospedagem (quando habilitado) -->
          <template
            v-if="calculatorStore.lodgingEnabled && calculatorStore.lodgingName"
          >
            <li class="mt-2">
              <span class="font-medium">Hospedagem:</span>
              {{ calculatorStore.lodgingName }}
            </li>
            <li>
              <span class="font-medium">Apartamentos necessários:</span>
              {{ calculatorStore.lodgingApartments }}
            </li>
            <!--  <li>
              <span class="font-medium">Total hospedagem:</span>
              R$
              {{ (calculatorStore.lodgingTotal || 0).toLocaleString("pt-BR") }}
            </li> -->
          </template>
          <template
            v-if="isAirport(calculatorStore.destination) || isAirportLabel"
          >
            <li class="mt-2">
              <span class="font-medium">Cia. Aérea:</span>
              {{ calculatorStore.airline || "—" }}
            </li>
            <li>
              <span class="font-medium">No. Vôo:</span>
              {{ calculatorStore.flightNumber || "—" }}
            </li>
            <li>
              <span class="font-medium">Horário previsto de chegada:</span>
              {{ calculatorStore.arrivalTime || "—" }}
            </li>
          </template>
          <template v-if="!isAirport(calculatorStore.destination)">
            <li class="mt-2">
              <span class="font-medium">Ponto de encontro:</span>
              {{ calculatorStore.meetingStreet || "—" }}, Nº
              {{ calculatorStore.meetingNumber || "—" }}
            </li>
            <li>
              <span class="font-medium">Bairro:</span>
              {{ calculatorStore.meetingNeighborhood || "—" }}
            </li>
            <li>
              <span class="font-medium">Cidade:</span>
              {{ calculatorStore.meetingCity || "—" }}
            </li>
            <li>
              <span class="font-medium">Estado (UF):</span>
              {{ calculatorStore.meetingState || "—" }}
            </li>
            <li>
              <span class="font-medium">Horário:</span>
              {{ calculatorStore.meetingTime || "—" }}
            </li>
          </template>
        </ul>
      </div>

      <div class="mt-6 text-left text-muted-foreground">
        <h3 class="text-lg font-semibold mb-2">Formas de pagamento</h3>
        <ul class="space-y-1 text-sm sm:text-base">
          <li>À vista (PIX): 5% de desconto</li>
          <li>3x no cartão de crédito sem acréscimo</li>
          <li>Até 12x no cartão de crédito</li>
        </ul>
      </div>

      <!--  <div class="bg-muted p-4 rounded-lg text-left mt-3">
        <p class="text-sm text-muted-foreground">
          <strong>Importante:</strong> Este é um orçamento aproximado. O valor
          final pode variar conforme horário, pedágios, paradas extras e outras
          especificidades. Entre em contato para confirmar o valor exato.
        </p>
      </div> -->

      <div
        class="mt-3 bg-amber-100 border border-amber-200 p-3 rounded-md text-left"
      >
        <p class="text-sm text-amber-800">
          <strong>ATENÇÃO:</strong> o valor apresentado está sujeito ao
          pagamento da reserva e/ou disponibilidade. Reservamo-nos o direito de
          retificar valores informados, por eventuais falhas do sistema.
        </p>
      </div>

      <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-3">
        <button
          class="btn btn-outline w-full sm:flex-1 text-base sm:text-lg border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white"
          @click="onReset"
        >
          Nova Cotação
        </button>
        <div class="w-full sm:flex-1">
          <button
            :class="[
              'btn btn-primary gradient-ocean w-full text-base sm:text-lg',
              calculatorStore.tripType === 'roundtrip' && !hasReturn
                ? 'opacity-60 cursor-not-allowed'
                : '',
            ]"
            :disabled="calculatorStore.tripType === 'roundtrip' && !hasReturn"
            @click="onSendQuote"
          >
            <span class="hidden sm:inline">
              {{
                calculatorStore.tripType === "roundtrip" && !hasReturn
                  ? "Quero Reservar (após adicionar volta)"
                  : "Quero Reservar"
              }}
            </span>
            <span class="sm:hidden">
              {{
                calculatorStore.tripType === "roundtrip" && !hasReturn
                  ? "Quero Reservar"
                  : "Quero Reservar"
              }}
            </span>
          </button>
        </div>
      </div>

      <p
        v-if="calculatorStore.tripType === 'roundtrip' && !hasReturn"
        class="text-xs text-muted-foreground mt-2 text-center"
      >
        Adicione o percurso de volta para habilitar a solicitação.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCalculatorStore } from "@/stores/calculator";
import { formatDateBR } from "@/utils/formatDateBR";
import type { ZoneRow } from "@/services/supabase";
import { useAuthStore } from "@/stores/auth";

const props = defineProps<{
  originZone: ZoneRow | null;
  hasReturn: boolean;
  returnCep: string;
  returnZone: ZoneRow | null;
  returnDate: string;
  returnPassengers: string;
  returnVehicleType: string;
  onReset: () => void;
  onSendQuote: () => void;
  getServiceNameForVehicle: (vehicle: string) => string;
}>();

const calculatorStore = useCalculatorStore();
const auth = useAuthStore();

// Reutiliza helpers do page via import de serviços
// helper repassado pelo page
const getServiceNameForVehicle = (vehicle: string) =>
  props.getServiceNameForVehicle(vehicle);
const isAirport = (name: string) =>
  (name || "").toLowerCase().includes("aeroporto");
const isAirportLabel = false;
</script>
