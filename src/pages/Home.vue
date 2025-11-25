<template>
  <div class="min-h-screen">
    <!-- Hero Section -->
    <section class="relative pt-32 pb-20 px-4 overflow-hidden">
      <div class="absolute inset-0 gradient-hero opacity-10"></div>
      <div class="container mx-auto text-center relative z-10">
        <h1
          class="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in"
        >
          Transfers Privativos
          <span
            class="block mt-2 bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent"
          >
            Porto de Santos
          </span>
        </h1>
        <p
          class="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto"
        >
          Serviço com motoristas, veículos e atendimento diferenciados.
        </p>
        <div
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center"
        >
          <!-- Card 1: Grande São Paulo / Santos -->
          <div
            class="card p-6 text-left hover:shadow-medium transition-smooth border-2 hover:border-brand-primary/20 flex flex-col justify-between h-full"
          >
            <div class="flex items-center gap-3 mb-3">
              <Car class="h-8 w-8 text-brand-primary" />
              <h3 class="text-xl font-semibold">
                <!-- Grande São Paulo → Santos -->
                Cidades do ESP → Santos
              </h3>
            </div>
            <p class="text-muted-foreground mb-4">
              Fluxo normal da calculadora (ida para o Porto de Santos).
            </p>

            <button
              class="btn w-full bg-brand-primary text-white hover:bg-brand-primary/90 shadow-sm ring-1 ring-brand-primary/30"
              @click="handleStartNormal"
            >
              Iniciar Orçamento
              <ArrowRight class="ml-2 h-5 w-5 inline" />
            </button>
          </div>

          <!-- Card 2: Santos / São Paulo (Somente volta) -->
          <div
            class="card p-6 text-left hover:shadow-medium transition-smooth border-2 hover:border-brand-primary/20 flex flex-col justify-between h-full"
          >
            <div class="flex items-center gap-3 mb-3">
              <Ship class="h-8 w-8 text-brand-primary" />
              <h3 class="text-xl font-semibold">
                <!-- Santos → São Paulo -->
                Santos → Cidades do ESP
              </h3>
            </div>
            <p class="text-muted-foreground mb-4 flex flex-col gap-2">
              Inicia na calculadora com opção Somente Volta, pulando o primeiro
              passo.
              <strong class="text-brand-primary text-xs"
                >Reservas apenas com o mínimo de 24 horas de antecedência da
                data de término do cruzeiro.</strong
              >
            </p>

            <button
              class="btn w-full bg-brand-secondary text-white hover:bg-brand-secondary/90 shadow-sm ring-1 ring-brand-secondary/30"
              @click="handleStartReturnOnly"
            >
              Somente Volta
              <ArrowRight class="ml-2 h-5 w-5 inline" />
            </button>
          </div>

          <!-- Card 3: Cruzeiro + hospedagem -->
          <div
            class="card p-6 text-left hover:shadow-medium transition-smooth border-2 hover:border-brand-primary/20 flex flex-col justify-between h-full"
          >
            <div class="flex items-center gap-3 mb-3">
              <Users class="h-8 w-8 text-brand-primary" />
              <h3 class="text-xl font-semibold">
                Transfer + Santos (com hotel)
              </h3>
            </div>
            <p class="text-muted-foreground mb-4">
              Pacote integrado: escolha do veículo e hospedagem no final.
            </p>
            <button
              class="btn w-full bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm ring-1 ring-emerald-500/30"
              @click="handleStartLodging"
            >
              Iniciar com Hospedagem
              <ArrowRight class="ml-2 h-5 w-5 inline" />
            </button>
          </div>
        </div>
      </div>
      <div class="container mx-auto py-10">
        <div class="text-center">
          <h3 class="text-4xl mb-12">
            Origem de outros destinos, favor nos consultar
          </h3>
          <div class="flex justify-center">
            <a :href="WHATSAPP_URL" target="_blank" rel="noopener noreferrer">
              <button
                class="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg shadow-medium transition-smooth"
              >
                Falar no WhatsApp
                <i class="fa-brands fa-whatsapp text-white text-base"></i>
              </button>
            </a>
          </div>
        </div>
      </div>
    </section>
    <!-- Features -->
    <section class="py-20 px-4 bg-muted/30">
      <div class="container mx-auto">
        <h2 class="text-4xl font-bold text-center mb-4">
          Por Que Escolher a Transfer Cruzeiros Santos?
        </h2>
        <p
          class="text-lg text-muted-foreground text-center max-w-3xl mx-auto mb-12"
        >
          A primeira operadora a oferecer transfers privativos no exterior, com
          assistência 24h no Brasil. A garantia que você terá o melhor serviço
          em 150 países. 14 anos de atuação com zero registros em sites e órgãos
          de defesa do consumidor.
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            class="card p-6 text-center hover:shadow-medium transition-smooth border-2 hover:border-brand-primary/20"
          >
            <div
              class="gradient-ocean w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Clock class="h-8 w-8 text-white" />
            </div>
            <h3 class="text-xl font-semibold mb-2">Pontualidade</h3>
            <p class="text-muted-foreground">
              Chegamos sempre no horário combinado para não perder seu cruzeiro.
            </p>
          </div>

          <div
            class="card p-6 text-center hover:shadow-medium transition-smooth border-2 hover:border-brand-primary/20"
          >
            <div
              class="gradient-ocean w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Shield class="h-8 w-8 text-white" />
            </div>
            <h3 class="text-xl font-semibold mb-2">Segurança</h3>
            <p class="text-muted-foreground">
              Motoristas experientes e veículos revisados.
            </p>
            <p class="text-muted-foreground">
              <strong>EXCLUSIVO:</strong> solicite geolocalização do motorista
              para a sua segurança e tranquilidade, sem custo adicional.
            </p>
          </div>

          <div
            class="card p-6 text-center hover:shadow-medium transition-smooth border-2 hover:border-brand-primary/20"
          >
            <div
              class="gradient-ocean w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Ship class="h-8 w-8 text-white" />
            </div>
            <h3 class="text-xl font-semibold mb-2">Especialização</h3>
            <p class="text-muted-foreground">
              Especialistas em transfers para cruzeiros no Porto de Santos.
            </p>
          </div>

          <div
            class="card p-6 text-center hover:shadow-medium transition-smooth border-2 hover:border-brand-primary/20"
          >
            <div
              class="gradient-ocean w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Award class="h-8 w-8 text-white" />
            </div>
            <h3 class="text-xl font-semibold mb-2">Qualidade</h3>
            <p class="text-muted-foreground">
              Serviço privativo com veículos e atendimento exclusivo.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section
      class="py-10 px-4 bg-gradient-to-r from-brand-primary to-brand-accent text-white"
    >
      <div class="container mx-auto">
        <div class="text-center mb-10">
          <h2 class="text-4xl font-bold mb-4">Pronto para Viajar?</h2>
          <p class="text-xl opacity-90">
            Escolha abaixo a melhor opção para iniciar seu orçamento
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Card 1: Grande São Paulo / Santos -->
          <div
            class="card p-6 text-left hover:shadow-medium transition-smooth border-2 hover:border-brand-primary/20 flex flex-col justify-between h-full"
          >
            <div class="flex items-center gap-3 mb-3">
              <Car class="h-8 w-8 text-brand-primary" />
              <h3 class="text-xl font-semibold text-brand-primary">
                <!-- Grande São Paulo → Santos -->
                Cidades do ESP → Santos
              </h3>
            </div>
            <p class="text-muted-foreground mb-4">
              Fluxo normal da calculadora (ida para o Porto de Santos).
            </p>
            <button
              class="btn w-full bg-brand-primary text-white hover:bg-brand-primary/90 shadow-sm ring-1 ring-brand-primary/30"
              @click="handleStartNormal"
            >
              Iniciar Orçamento
              <ArrowRight class="ml-2 h-5 w-5 inline" />
            </button>
          </div>

          <!-- Card 2: Santos / São Paulo (Somente volta) -->
          <div
            class="card p-6 text-left hover:shadow-medium transition-smooth border-2 hover:border-brand-primary/20 flex flex-col justify-between h-full"
          >
            <div class="flex items-center gap-3 mb-3">
              <Ship class="h-8 w-8 text-brand-primary" />
              <h3 class="text-xl font-semibold text-brand-primary">
                <!-- Santos → São Paulo -->
                Santos → Cidades do ESP
              </h3>
            </div>
            <p class="text-muted-foreground mb-4 flex flex-col gap-2">
              Inicia na calculadora com opção Somente Volta, pulando o primeiro
              passo.
              <strong class="text-brand-primary text-xs"
                >Reservas apenas com o mínimo de 24 horas de antecedência da
                data de término do cruzeiro.</strong
              >
            </p>

            <button
              class="btn w-full bg-brand-secondary text-white hover:bg-brand-secondary/90 shadow-sm ring-1 ring-brand-secondary/30"
              @click="handleStartReturnOnly"
            >
              Somente Volta
              <ArrowRight class="ml-2 h-5 w-5 inline" />
            </button>
          </div>

          <!-- Card 3: Cruzeiro + hospedagem (Em breve) -->
          <div
            class="card p-6 text-left hover:shadow-medium transition-smooth border-2 hover:border-brand-primary/20 flex flex-col justify-between h-full"
          >
            <div class="flex items-center gap-3 mb-3">
              <Users class="h-8 w-8 text-brand-primary" />
              <h3 class="text-xl font-semibold text-brand-primary">
                Transfer + Santos (com hotel)
              </h3>
            </div>
            <p class="text-muted-foreground mb-4">
              Pacote integrado: escolha do veículo e hospedagem no final.
            </p>
            <button
              class="btn w-full bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm ring-1 ring-emerald-500/30"
              @click="handleStartLodging"
            >
              Iniciar com Hospedagem
              <ArrowRight class="ml-2 h-5 w-5 inline" />
            </button>
          </div>
        </div>
        <div class="container mx-auto py-10">
          <div class="text-center">
            <h3 class="text-4xl mb-12">
              Se você não conseguiu calcular, ou não souber o seu CEP, entre em
              contato conosco
            </h3>
            <div class="flex justify-center">
              <a :href="WHATSAPP_URL" target="_blank" rel="noopener noreferrer">
                <button
                  class="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg shadow-medium transition-smooth"
                >
                  Falar no WhatsApp
                  <i class="fa-brands fa-whatsapp text-white text-base"></i>
                </button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import {
  Ship,
  Clock,
  Shield,
  Award,
  ArrowRight,
  Car,
  Users,
} from "lucide-vue-next";
import { useRouter } from "vue-router";
import { useCalculatorStore } from "@/stores/calculator";
import { WHATSAPP_URL } from "@/constants/contacts";

const router = useRouter();
const calculatorStore = useCalculatorStore();

// Fluxo normal: reset e iniciar na calculadora pelo passo 1
const handleStartNormal = () => {
  calculatorStore.resetCalculator();
  router.push({ path: "/calculadora" });
};

// Fluxo Somente Volta: reset, marcar tripType e iniciar no passo 2
const handleStartReturnOnly = () => {
  calculatorStore.resetCalculator();
  calculatorStore.setTripType("returnonly");
  calculatorStore.step = 2;
  router.push({ path: "/calculadora" });
};
//const router = useRouter();

/* function handleStartNormal() {
  router.push({ name: "calculadora" });
} */

/* function handleStartReturnOnly() {
  router.push({ name: "calculadora", query: { mode: "returnonly" } });
} */

function handleStartLodging() {
  router.push({ name: "calculadora", query: { lodging: "true" } });
}
</script>
