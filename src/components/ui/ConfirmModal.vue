<template>
  <div v-if="open" class="fixed inset-0 z-[100]">
    <div class="absolute inset-0 bg-black/40" @click="$emit('close')"></div>
    <div class="absolute inset-0 flex items-center justify-center p-4">
      <div
        class="bg-white rounded-xl shadow-large w-full max-w-md border border-gray-200"
      >
        <div class="p-6">
          <h3 class="text-xl font-semibold mb-2">{{ title }}</h3>
          <p class="text-sm text-muted-foreground mb-6">{{ message }}</p>
          <div class="flex flex-col sm:flex-row gap-3">
            <button
              class="btn btn-outline w-full sm:flex-1"
              @click="$emit('close')"
            >
              {{ cancelText || "Cancelar" }}
            </button>
            <button
              class="btn btn-primary gradient-gold w-full sm:flex-1"
              @click="$emit('confirm')"
            >
              {{ confirmText || "Confirmar" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}>();

defineEmits<{
  (e: "close"): void;
  (e: "confirm"): void;
}>();
</script>
