import { defineStore } from "pinia";
import { ref, computed } from "vue";

export interface PriceData {
  minPrice: number;
  maxPrice: number;
  total: number;
}

export interface CalculatorState {
  step: number;
  tripType: "oneway" | "roundtrip" | "returnonly";
  origin: string;
  destination: string;
  date: string;
  returnDate: string;
  // Dados da volta (quando aplicável)
  returnCep?: string;
  returnPassengers?: string;
  returnVehicleType?: string;
  passengers: string;
  vehicleType: string;
  result: PriceData | null;
  // Modo hospedagem (opcional)
  lodgingEnabled?: boolean;
  lodgingName?: string;
  lodgingApartments?: number;
  lodgingTotal?: number;
  // Dados de voo (quando origem/destino for aeroporto)
  airline?: string;
  flightNumber?: string;
  arrivalTime?: string;
  // Ponto de encontro (quando não for aeroporto)
  meetingStreet?: string;
  meetingNumber?: string;
  meetingTime?: string;
  meetingNeighborhood?: string;
  meetingState?: string;
}

export const useCalculatorStore = defineStore("calculator", () => {
  // State
  const step = ref(1);
  const tripType = ref<"oneway" | "roundtrip" | "returnonly">("oneway");
  const origin = ref("");
  const destination = ref("");
  const date = ref("");
  const returnDate = ref("");
  // Dados da volta (controlados principalmente no index.vue, mantemos aqui para reset global)
  const returnCep = ref("");
  const returnPassengers = ref("");
  const returnVehicleType = ref("");
  const passengers = ref("");
  // serviceId removido: serviço é inferido a partir do veículo
  const vehicleType = ref("");
  const result = ref<PriceData | null>(null);
  const lodgingEnabled = ref<boolean>(false);
  const lodgingName = ref<string>("");
  const lodgingApartments = ref<number>(0);
  const lodgingTotal = ref<number>(0);
  const airline = ref<string>("");
  const flightNumber = ref<string>("");
  const arrivalTime = ref<string>("");
  const meetingStreet = ref<string>("");
  const meetingNumber = ref<string>("");
  const meetingTime = ref<string>("");
  const meetingNeighborhood = ref<string>("");
  const meetingState = ref<string>("");
  const meetingCity = ref<string>("");

  // Getters
  const isStepValid = computed(() => {
    switch (step.value) {
      case 1:
        return !!tripType.value;
      case 2:
        // No novo fluxo, no passo 2 apenas o CEP de origem é necessário.
        return !!origin.value;
      case 3:
        return !!date.value;
      case 4:
        return !!passengers.value;
      // Step 5 removido
      case 6:
        return !!vehicleType.value;
      default:
        return false;
    }
  });

  const canProceed = computed(() => isStepValid.value);

  // Actions
  function nextStep() {
    if (!canProceed.value) return;
    if (step.value === 4) {
      // pular etapa 5 (serviço) desabilitada
      step.value = 6;
      return;
    }
    if (step.value < 7) {
      // avanço padrão
      step.value++;
      // se por algum motivo cair na etapa 5, pular para 6
      if (step.value === 5) step.value = 6;
    }
  }

  function previousStep() {
    if (step.value <= 1) return;
    if (step.value === 6) {
      // voltar da etapa 6 diretamente para 4 (etapa 5 removida)
      console.log("voltar da etapa 6 diretamente para 4");
      step.value = 4;
      return;
    }
    if (step.value === 5) {
      // se estiver na 5, voltar para 4
      step.value = 4;
      return;
    }
    step.value--;
  }

  function resetCalculator() {
    step.value = 1;
    tripType.value = "oneway";
    origin.value = "";
    destination.value = "";
    date.value = "";
    returnDate.value = "";
    // Reset explícito dos dados de volta
    returnCep.value = "";
    returnPassengers.value = "";
    returnVehicleType.value = "";
    passengers.value = "";
    vehicleType.value = "";
    result.value = null;
    lodgingEnabled.value = false;
    lodgingName.value = "";
    lodgingApartments.value = 0;
    lodgingTotal.value = 0;
    airline.value = "";
    flightNumber.value = "";
    arrivalTime.value = "";
    meetingStreet.value = "";
    meetingNumber.value = "";
    meetingTime.value = "";
    meetingNeighborhood.value = "";
    meetingState.value = "";
    meetingCity.value = "";
  }

  function setTripType(type: "oneway" | "roundtrip" | "returnonly") {
    tripType.value = type;
  }

  function setOrigin(value: string) {
    origin.value = value;
  }

  function setDestination(value: string) {
    destination.value = value;
  }

  function setDate(value: string) {
    date.value = value;
  }

  function setReturnDate(value: string) {
    returnDate.value = value;
  }

  function setReturnCep(value: string) {
    returnCep.value = value;
  }

  function setReturnPassengers(value: string) {
    returnPassengers.value = value;
  }

  function setReturnVehicleType(value: string) {
    returnVehicleType.value = value;
  }

  function setPassengers(value: string) {
    passengers.value = value;
  }

  function setVehicleType(value: string) {
    vehicleType.value = value;
  }

  function setResult(value: PriceData) {
    result.value = value;
  }

  function setAirline(value: string) {
    airline.value = value;
  }
  function setFlightNumber(value: string) {
    flightNumber.value = value;
  }
  function setArrivalTime(value: string) {
    arrivalTime.value = value;
  }
  function setMeetingStreet(value: string) {
    meetingStreet.value = value;
  }
  function setMeetingNumber(value: string) {
    meetingNumber.value = value;
  }
  function setMeetingTime(value: string) {
    meetingTime.value = value;
  }
  function setMeetingNeighborhood(value: string) {
    meetingNeighborhood.value = value;
  }
  function setMeetingState(value: string) {
    meetingState.value = value;
  }
  function setMeetingCity(value: string) {
    meetingCity.value = value;
  }

  function enableLodging(flag: boolean) {
    lodgingEnabled.value = !!flag;
  }

  function setLodgingSelection(
    name: string,
    apartments: number,
    total: number,
  ) {
    lodgingName.value = name;
    lodgingApartments.value = apartments;
    lodgingTotal.value = total;
  }

  return {
    // State
    step,
    tripType,
    origin,
    destination,
    date,
    returnDate,
    returnCep,
    returnPassengers,
    returnVehicleType,
    passengers,
    vehicleType,
    result,
    lodgingEnabled,
    lodgingName,
    lodgingApartments,
    lodgingTotal,
    airline,
    flightNumber,
    arrivalTime,
    meetingStreet,
    meetingNumber,
    meetingTime,
    meetingNeighborhood,
    meetingState,
    meetingCity,
    // Getters
    isStepValid,
    canProceed,
    // Actions
    nextStep,
    previousStep,
    resetCalculator,
    setTripType,
    setOrigin,
    setDestination,
    setDate,
    setReturnDate,
    setReturnCep,
    setReturnPassengers,
    setReturnVehicleType,
    setPassengers,
    setVehicleType,
    setResult,
    setAirline,
    setFlightNumber,
    setArrivalTime,
    setMeetingStreet,
    setMeetingNumber,
    setMeetingTime,
    setMeetingNeighborhood,
    setMeetingState,
    setMeetingCity,
    enableLodging,
    setLodgingSelection,
  };
});
