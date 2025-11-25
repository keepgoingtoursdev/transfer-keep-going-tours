<template>
  <div class="min-h-screen flex flex-col relative overflow-hidden">
    <div
      class="absolute inset-0 gradient-hero opacity-40 pointer-events-none"
    ></div>
    <Navbar v-show="showChrome" />
    <main class="flex-1 relative z-10">
      <slot />
    </main>
    <Footer v-show="showChrome" />
  </div>
</template>

<script setup lang="ts">
import Navbar from "./Navbar.vue";
import Footer from "./Footer.vue";
import { useRoute } from "vue-router";
import { computed } from "vue";

const route = useRoute();
// Esconde Navbar/Footer nas páginas de autenticação para um foco maior
const showChrome = computed(
  () =>
    ![
      "/admin/login",
      "/cadastro",
      "/recuperar-senha",
      "/redefinir-senha",
      "/not-found",
    ].includes(route.path),
);
</script>
