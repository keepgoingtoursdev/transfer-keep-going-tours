<template>
  <div class="min-h-screen pt-24">
    <!-- Hero Section -->
    <section
      class="py-20 px-4 bg-gradient-to-r from-brand-primary/10 to-brand-accent/10"
    >
      <div class="container mx-auto text-center">
        <h1 class="text-5xl font-bold mb-6">Entre em Contato</h1>
        <p class="text-xl text-muted-foreground max-w-3xl mx-auto">
          Estamos prontos para atendê-lo 24 horas por dia, 7 dias por semana.
          Entre em contato conosco para reservas, dúvidas ou orçamentos
          personalizados.
        </p>
      </div>
    </section>

    <!-- Contact Info & Form -->
    <section class="py-20 px-4">
      <div class="container mx-auto max-w-6xl">
        <div class="grid grid-cols-1 lg:grid-cols-1 gap-12">
          <!-- Contact Information -->
          <div class="space-y-8">
            <div>
              <h2 class="text-3xl font-bold mb-6">Informações de Contato</h2>
              <p class="text-muted-foreground mb-8">
                Nossa equipe está sempre disponível para garantir que sua viagem
                seja perfeita. Escolha a forma de contato que preferir.
              </p>
            </div>

            <!-- Contact Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="card p-8 hover:shadow-medium transition-smooth">
                <h3 class="text-2xl font-bold mb-2">São Paulo</h3>
                <p class="text-2xl font-extrabold text-gray-800">
                  Informações & Reservas
                </p>
                <div class="flex items-center gap-3 mt-4">
                  <i class="fa-brands fa-whatsapp text-green-600 text-2xl"></i>
                  <a
                    href="https://wa.me/551151189912"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-muted-foreground text-lg hover:underline"
                  >
                    (11) 5118-9912
                  </a>
                </div>
              </div>

              <div class="card p-8 hover:shadow-medium transition-smooth">
                <h3 class="text-2xl font-bold mb-2">Base Santos</h3>
                <p class="text-2xl font-extrabold text-gray-800">
                  Suporte para cruzeiristas com reservas
                </p>
                <div class="flex items-center gap-3 mt-4">
                  <i class="fa-brands fa-whatsapp text-green-600 text-2xl"></i>
                  <a
                    href="https://wa.me/5513988256446"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-muted-foreground text-lg hover:underline"
                  >
                    (13) 98825-6446
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- Contact Form -->
          <!--  <div class="card p-8">
            <h2 class="text-3xl font-bold mb-6">Envie uma Mensagem</h2>
            <form class="space-y-6" @submit.prevent="handleSubmit">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="name" class="block text-sm font-medium mb-2"
                    >Nome *</label
                  >
                  <input
                    id="name"
                    v-model="form.name"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    placeholder="Seu nome completo"
                  />
                </div>
                <div>
                  <label for="phone" class="block text-sm font-medium mb-2"
                    >Telefone *</label
                  >
                  <input
                    id="phone"
                    v-model="form.phone"
                    type="tel"
                    required
                    class="w-full px-3 py-2 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    placeholder="(13) 99999-9999"
                  />
                </div>
              </div>

              <div>
                <label for="email" class="block text-sm font-medium mb-2"
                  >E-mail *</label
                >
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  required
                  class="w-full px-3 py-2 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label for="subject" class="block text-sm font-medium mb-2"
                  >Assunto</label
                >
                <select
                  id="subject"
                  v-model="form.subject"
                  class="w-full px-3 py-2 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                >
                  <option value="">Selecione um assunto</option>
                  <option value="reserva">Nova Reserva</option>
                  <option value="orcamento">Orçamento Personalizado</option>
                  <option value="duvida">Dúvidas Gerais</option>
                  <option value="suporte">Suporte</option>
                  <option value="outro">Outro</option>
                </select>
              </div>

              <div>
                <label for="message" class="block text-sm font-medium mb-2"
                  >Mensagem *</label
                >
                <textarea
                  id="message"
                  v-model="form.message"
                  required
                  rows="5"
                  class="w-full px-3 py-2 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
                  placeholder="Descreva sua necessidade, data da viagem, horário, origem, destino e qualquer informação relevante..."
                ></textarea>
              </div>

              <div class="flex items-center gap-2">
                <input
                  id="privacy"
                  v-model="form.privacy"
                  type="checkbox"
                  required
                  class="w-4 h-4 text-brand-primary border-gray-200 rounded focus:ring-brand-primary"
                />
                <label for="privacy" class="text-sm text-muted-foreground">
                  Concordo com o tratamento dos meus dados pessoais conforme
                  nossa política de privacidade *
                </label>
              </div>

              <button
                type="submit"
                :disabled="isSubmitting"
                class="btn btn-primary gradient-ocean w-full text-lg"
              >
                <span v-if="!isSubmitting">
                  Enviar Mensagem
                  <Send class="ml-2 h-5 w-5" />
                </span>
                <span v-else> Enviando... </span>
              </button>
            </form>
          </div> -->
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <!--   <section class="py-20 px-4 bg-muted/30">
      <div class="container mx-auto max-w-4xl">
        <h2 class="text-4xl font-bold text-center mb-12">
          Perguntas Frequentes
        </h2>

        <div class="space-y-6">
          <div class="card p-6">
            <h3 class="font-semibold text-lg mb-2">Como faço uma reserva?</h3>
            <p class="text-muted-foreground">
              Você pode fazer uma reserva através do nosso WhatsApp, telefone,
              e-mail ou preenchendo o formulário acima. Recomendamos reservar
              com pelo menos 24 horas de antecedência.
            </p>
          </div>

          <div class="card p-6">
            <h3 class="font-semibold text-lg mb-2">
              Qual é a política de cancelamento?
            </h3>
            <p class="text-muted-foreground">
              Cancelamentos com mais de 24 horas de antecedência não têm custo.
              Cancelamentos com menos de 24 horas podem ter taxa de 50% do
              valor.
            </p>
          </div>

          <div class="card p-6">
            <h3 class="font-semibold text-lg mb-2">
              Vocês acompanham os horários dos cruzeiros?
            </h3>
            <p class="text-muted-foreground">
              Sim! Monitoramos os horários de chegada e partida dos cruzeiros em
              tempo real para garantir que você não perca seu embarque.
            </p>
          </div>

          <div class="card p-6">
            <h3 class="font-semibold text-lg mb-2">
              Quais formas de pagamento vocês aceitam?
            </h3>
            <p class="text-muted-foreground">
              Aceitamos dinheiro, cartão de débito/crédito, PIX e transferência
              bancária. O pagamento pode ser feito no momento do serviço ou
              antecipadamente.
            </p>
          </div>

          <div class="card p-6">
            <h3 class="font-semibold text-lg mb-2">E se meu voo atrasar?</h3>
            <p class="text-muted-foreground">
              Monitoramos voos em tempo real. Se houver atraso, ajustamos
              automaticamente o horário do seu transfer sem custo adicional.
            </p>
          </div>
        </div>
      </div>
    </section> -->

    <!-- CTA Section -->
    <section
      class="py-20 px-4 bg-gradient-to-r from-brand-primary to-brand-accent text-white"
    >
      <div class="container mx-auto text-center">
        <h2 class="text-4xl font-bold mb-6">Pronto para Viajar?</h2>
        <p class="text-xl mb-8 opacity-90">
          Entre em contato agora e garanta seu transfer com total tranquilidade
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a :href="WHATSAPP_URL" target="_blank" rel="noopener noreferrer">
            <button
              class="bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-smooth"
            >
              WhatsApp
              <i class="fa-brands fa-whatsapp ml-2 text-white text-base"></i>
            </button>
          </a>
          <!--  <a href="tel:+5513999887766">
            <button
              class="bg-white text-brand-primary hover:bg-gray-100 transition-smooth font-semibold py-4 px-8 rounded-lg text-lg"
            >
              Ligar Agora
              <Phone class="ml-2 h-5 w-5 inline" />
            </button>
          </a> -->
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { WHATSAPP_URL } from "@/constants/contacts";
</script>
