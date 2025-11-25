<template>
  <div class="fixed top-4 right-4 z-50 space-y-2">
    <Toast
      v-for="toast in toastStore.toasts"
      :key="toast.id"
      v-bind="toast"
      @close="toastStore.removeToast"
    />
  </div>
</template>

<script setup lang="ts">
import { useToastStore } from "@/stores/toast";
import Toast from "@/components/ui/Toast.vue";

const toastStore = useToastStore();
</script>
