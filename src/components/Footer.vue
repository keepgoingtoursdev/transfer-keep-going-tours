<template>
  <footer class="bg-white">
    <div class="container mx-auto px-4 py-6">
      <!-- Top: logo + social -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <img
            src="/images/Logo_KG.png"
            alt="Keep Going Tours"
            class="h-10 w-auto"
          />
        </div>
        <div class="flex items-center gap-4 text-foreground/80">
          <a
            href="https://instagram.com/keepgoingtours"
            target="_blank"
            rel="noopener"
            aria-label="Instagram"
            class="hover:text-primary transition-smooth"
          >
            <Instagram class="h-5 w-5" />
          </a>
          <a
            :href="WHATSAPP_URL"
            target="_blank"
            rel="noopener"
            aria-label="WhatsApp"
            class="hover:text-primary transition-smooth"
          >
          </a>
          <a
            href="mailto:kg@keepgoingtours.com.br"
            aria-label="E-mail"
            class="hover:text-primary transition-smooth"
          >
            <Mail class="h-5 w-5" />
          </a>
        </div>
      </div>

      <div class="border-t border-border mb-4"></div>

      <div
        class="grid grid-cols-1 md:grid-cols-4 gap-6 text-foreground text-center md:text-left"
      >
        <div class="space-y-2 text-sm leading-relaxed">
          <p class="font-semibold">© Todos os direitos reservados</p>
          <p class="font-medium">Keep Going Tours - São Paulo/SP</p>
          <p class="font-semibold">CNPJ 41.133.027/0001-30</p>
          <p>
            CNPJ/CADASTUR: CNPJ Inicial : 13.532.509/00-27 - Linktur
            (Abril/2011)
          </p>
        </div>
        <div class="space-y-2 text-sm leading-relaxed">
          <!-- <p class="font-semibold">Assinatura</p> -->
          <p class="flex items-center justify-center md:justify-start gap-2">
            <span class="font-semibold">Reservas</span>
            <i class="fa-brands fa-whatsapp"></i>
            <a href="https://wa.me/551151189912" class="hover:text-primary"
              >(11) 5118.9912</a
            >
          </p>
          <p class="flex items-center justify-center md:justify-start gap-2">
            <span class="font-semibold">Base Santos</span>
            <i class="fa-brands fa-whatsapp"></i>
            <a href="https://wa.me/5513988256446" class="hover:text-primary"
              >(13) 98825.6446</a
            >
          </p>
          <p class="text-muted-foreground">
            Somente para clientes com reservas
          </p>
        </div>
        <div class="space-y-2 text-sm leading-relaxed">
          <p>
            <a href="mailto:kg@keepgoingtours.com.br" class="hover:text-primary"
              >kg@keepgoingtours.com.br</a
            >
          </p>
          <p>
            <a
              href="https://keepgoingtours.com.br"
              target="_blank"
              rel="noopener"
              class="hover:text-primary"
              >www.keepgoingtours.com.br</a
            >
          </p>
          <p class="flex items-center justify-center md:justify-start gap-2">
            <Instagram class="h-4 w-4" />
            <a
              href="https://instagram.com/keepgoingtours"
              target="_blank"
              rel="noopener"
              class="hover:text-primary"
              >@keepgoingtours</a
            >
          </p>
        </div>
        <div>
          <h3 class="text-base font-semibold mb-2">Links rápidos</h3>
          <nav class="space-y-1 text-sm">
            <router-link
              to="/"
              class="block hover:text-primary transition-smooth"
              >Home</router-link
            >
            <router-link
              to="/calculadora"
              class="block hover:text-primary transition-smooth"
              >Calculadora</router-link
            >
          </nav>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { Instagram, Mail } from "lucide-vue-next";
import { WHATSAPP_URL } from "@/constants/contacts";
</script>
