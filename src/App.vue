<template>
  <Layout>
    <router-view />
  </Layout>
  <ToastContainer />
</template>

<script setup lang="ts">
import Layout from "@/components/Layout.vue";
import ToastContainer from "@/components/ToastContainer.vue";
</script>
