<template>
  <div class="min-h-screen pt-24">
    <!-- Hero Section -->
    <section
      class="py-20 px-4 bg-gradient-to-r from-brand-primary/10 to-brand-accent/10"
    >
      <div class="container mx-auto text-center">
        <h1 class="text-5xl font-bold mb-6">Nossos Serviços</h1>
        <p class="text-xl text-muted-foreground max-w-3xl mx-auto">
          Oferecemos diferentes opções de transporte executivo para atender
          todas as suas necessidades de transfer no Porto de Santos
        </p>
      </div>
    </section>

    <!-- Services Grid -->
    <section class="py-20 px-4">
      <div class="container mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <!-- Executivo -->
          <div
            class="card p-8 hover:shadow-large transition-smooth flex flex-col justify-between h-full"
          >
            <div class="flex items-center gap-4 mb-6">
              <div
                class="gradient-ocean w-16 h-16 rounded-full flex items-center justify-center"
              >
                <Car class="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 class="text-2xl font-bold">Sedan Executivo</h3>
                <p class="text-muted-foreground">Até 3 passageiros</p>
              </div>
            </div>

            <div class="mb-6">
              <h4 class="font-semibold mb-3">Características:</h4>
              <ul class="space-y-2">
                <li class="flex items-center gap-2">
                  <CheckCircle class="h-5 w-5 text-brand-primary" />
                  <span>Veículo sedan de luxo</span>
                </li>
                <li class="flex items-center gap-2">
                  <CheckCircle class="h-5 w-5 text-brand-primary" />
                  <span>Ar condicionado</span>
                </li>
                <li class="flex items-center gap-2">
                  <CheckCircle class="h-5 w-5 text-brand-primary" />
                  <span>Wi-Fi gratuito</span>
                </li>
                <li class="flex items-center gap-2">
                  <CheckCircle class="h-5 w-5 text-brand-primary" />
                  <span>Água mineral cortesia</span>
                </li>
                <li class="flex items-center gap-2">
                  <CheckCircle class="h-5 w-5 text-brand-primary" />
                  <span>Porta-malas para 3 bagagens grandes</span>
                </li>
              </ul>
            </div>

            <div class="mb-6">
              <h4 class="font-semibold mb-3">Ideal para:</h4>
              <p class="text-muted-foreground">
                Casais ou pequenos grupos que valorizam conforto e elegância.
                Perfeito para viagens executivas e ocasiões especiais.
              </p>
            </div>

            <div class="text-center">
              <router-link to="/calculadora">
                <button class="btn btn-primary">
                  Calcular Preço
                  <ArrowRight class="ml-2 h-4 w-4" />
                </button>
              </router-link>
            </div>
          </div>

          <!-- SUV privativo -->
          <div
            class="card p-8 hover:shadow-large transition-smooth border-2 border-brand-primary flex flex-col justify-between h-full"
          >
            <div class="flex items-center gap-4 mb-6">
              <div
                class="gradient-ocean w-16 h-16 rounded-full flex items-center justify-center"
              >
                <Truck class="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 class="text-2xl font-bold">SUV Premium</h3>
                <p class="text-muted-foreground">Até 6 passageiros</p>
              </div>
            </div>

            <div class="mb-6">
              <h4 class="font-semibold mb-3">Características:</h4>
              <ul class="space-y-2">
                <li class="flex items-center gap-2">
                  <CheckCircle class="h-5 w-5 text-brand-primary" />
                  <span>SUV de luxo com amplo espaço interno</span>
                </li>
                <li class="flex items-center gap-2">
                  <CheckCircle class="h-5 w-5 text-brand-primary" />
                  <span>Ar condicionado dual zone</span>
                </li>
                <li class="flex items-center gap-2">
                  <CheckCircle class="h-5 w-5 text-brand-primary" />
                  <span>Wi-Fi de alta velocidade</span>
                </li>
                <li class="flex items-center gap-2">
                  <CheckCircle class="h-5 w-5 text-brand-primary" />
                  <span>Água mineral e amenities</span>
                </li>
                <li class="flex items-center gap-2">
                  <CheckCircle class="h-5 w-5 text-brand-primary" />
                  <span>Porta-malas para 6 bagagens grandes</span>
                </li>
              </ul>
            </div>

            <div class="mb-6">
              <h4 class="font-semibold mb-3">Ideal para:</h4>
              <p class="text-muted-foreground">
                Famílias ou grupos médios que precisam de mais espaço e
                conforto. Excelente para viagens com muita bagagem.
              </p>
            </div>

            <div class="text-center">
              <router-link to="/calculadora">
                <button class="btn btn-primary">
                  Calcular Preço
                  <ArrowRight class="ml-2 h-4 w-4" />
                </button>
              </router-link>
            </div>
          </div>

          <!-- Van Executiva -->
          <div
            class="card p-8 hover:shadow-large transition-smooth flex flex-col justify-between h-full"
          >
            <div class="flex items-center gap-4 mb-6">
              <div
                class="gradient-ocean w-16 h-16 rounded-full flex items-center justify-center"
              >
                <Users class="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 class="text-2xl font-bold">Van Executiva</h3>
                <p class="text-muted-foreground">Até 8 passageiros</p>
              </div>
            </div>

            <div class="mb-6">
              <h4 class="font-semibold mb-3">Características:</h4>
              <ul class="space-y-2">
                <li class="flex items-center gap-2">
                  <CheckCircle class="h-5 w-5 text-brand-primary" />
                  <span>Van executiva com bancos reclináveis</span>
                </li>
                <li class="flex items-center gap-2">
                  <CheckCircle class="h-5 w-5 text-brand-primary" />
                  <span>Ar condicionado potente</span>
                </li>
                <li class="flex items-center gap-2">
                  <CheckCircle class="h-5 w-5 text-brand-primary" />
                  <span>Wi-Fi para todos os passageiros</span>
                </li>
                <li class="flex items-center gap-2">
                  <CheckCircle class="h-5 w-5 text-brand-primary" />
                  <span>Água mineral para todos</span>
                </li>
                <li class="flex items-center gap-2">
                  <CheckCircle class="h-5 w-5 text-brand-primary" />
                  <span>Bagageiro amplo para 8+ bagagens</span>
                </li>
              </ul>
            </div>

            <div class="mb-6">
              <h4 class="font-semibold mb-3">Ideal para:</h4>
              <p class="text-muted-foreground">
                Grupos grandes, famílias extensas ou empresas. Melhor
                custo-benefício para grupos numerosos.
              </p>
            </div>

            <div class="text-center">
              <router-link to="/calculadora">
                <button class="btn btn-primary">
                  Calcular Preço
                  <ArrowRight class="ml-2 h-4 w-4" />
                </button>
              </router-link>
            </div>
          </div>

          <!-- Serviços Especiais -->
          <div class="card p-8 hover:shadow-large transition-smooth">
            <div class="flex items-center gap-4 mb-6">
              <div
                class="gradient-ocean w-16 h-16 rounded-full flex items-center justify-center"
              >
                <Star class="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 class="text-2xl font-bold">Serviços Especiais</h3>
                <p class="text-muted-foreground">Sob consulta</p>
              </div>
            </div>

            <div class="mb-6">
              <h4 class="font-semibold mb-3">Oferecemos também:</h4>
              <ul class="space-y-2">
                <li class="flex items-center gap-2">
                  <CheckCircle class="h-5 w-5 text-brand-primary" />
                  <span>Transfer para aeroportos</span>
                </li>
                <li class="flex items-center gap-2">
                  <CheckCircle class="h-5 w-5 text-brand-primary" />
                  <span>City tours personalizados</span>
                </li>
                <li class="flex items-center gap-2">
                  <CheckCircle class="h-5 w-5 text-brand-primary" />
                  <span>Transporte para eventos</span>
                </li>
                <li class="flex items-center gap-2">
                  <CheckCircle class="h-5 w-5 text-brand-primary" />
                  <span>Serviços corporativos</span>
                </li>
                <li class="flex items-center gap-2">
                  <CheckCircle class="h-5 w-5 text-brand-primary" />
                  <span>Veículos adaptados (PCD)</span>
                </li>
              </ul>
            </div>

            <div class="mb-6">
              <h4 class="font-semibold mb-3">Consulte-nos:</h4>
              <p class="text-muted-foreground">
                Temos soluções personalizadas para suas necessidades
                específicas. Entre em contato para um orçamento personalizado.
              </p>
            </div>

            <div class="text-center">
              <router-link to="/contato">
                <button class="btn btn-outline">
                  Falar Conosco
                  <ArrowRight class="ml-2 h-4 w-4" />
                </button>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-20 px-4 bg-muted/30">
      <div class="container mx-auto">
        <h2 class="text-4xl font-bold text-center mb-12">
          Diferenciais dos Nossos Serviços
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div class="text-center">
            <div
              class="gradient-ocean w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Clock class="h-8 w-8 text-white" />
            </div>
            <h3 class="text-xl font-semibold mb-2">Pontualidade Garantida</h3>
            <p class="text-muted-foreground">
              Monitoramos horários de cruzeiros e chegamos sempre com
              antecedência
            </p>
          </div>

          <div class="text-center">
            <div
              class="gradient-ocean w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Shield class="h-8 w-8 text-white" />
            </div>
            <h3 class="text-xl font-semibold mb-2">Segurança Total</h3>
            <p class="text-muted-foreground">
              Motoristas habilitados, veículos revisados e seguro completo
            </p>
          </div>

          <div class="text-center">
            <div
              class="gradient-ocean w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Headphones class="h-8 w-8 text-white" />
            </div>
            <h3 class="text-xl font-semibold mb-2">Suporte 24/7</h3>
            <p class="text-muted-foreground">
              Atendimento disponível a qualquer hora para sua tranquilidade
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section
      class="py-20 px-4 bg-gradient-to-r from-brand-primary to-brand-accent text-white"
    >
      <div class="container mx-auto text-center">
        <h2 class="text-4xl font-bold mb-6">Pronto para Reservar?</h2>
        <p class="text-xl mb-8 opacity-90">
          Calcule o preço do seu transfer e garanta já sua viagem tranquila
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link to="/calculadora">
            <button
              class="bg-white text-brand-primary hover:bg-gray-100 transition-smooth font-semibold py-4 px-8 rounded-lg text-lg"
            >
              Calcular Preço
              <ArrowRight class="ml-2 h-5 w-5 inline" />
            </button>
          </router-link>
          <router-link to="/contato">
            <button
              class="border-2 border-white text-white hover:bg-white hover:text-brand-primary transition-smooth font-semibold py-4 px-8 rounded-lg text-lg"
            >
              Falar Conosco
            </button>
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import {
  Car,
  Truck,
  Users,
  Star,
  CheckCircle,
  ArrowRight,
  Clock,
  Shield,
  Headphones,
} from "lucide-vue-next";
</script>
