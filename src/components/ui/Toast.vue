<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-2 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-2 scale-95"
    >
      <div
        v-if="visible"
        :class="[
          'fixed top-4 right-4 z-50 max-w-sm w-full bg-white rounded-lg shadow-lg border border-gray-200 p-4',
          typeClasses,
        ]"
      >
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <CheckCircle
              v-if="type === 'success'"
              class="h-5 w-5 text-green-500"
            />
            <XCircle
              v-else-if="type === 'error'"
              class="h-5 w-5 text-red-500"
            />
            <AlertCircle
              v-else-if="type === 'warning'"
              class="h-5 w-5 text-yellow-500"
            />
            <Info v-else class="h-5 w-5 text-blue-500" />
          </div>
          <div class="ml-3 w-0 flex-1">
            <p v-if="title" class="text-sm font-medium text-gray-900">
              {{ title }}
            </p>
            <p class="text-sm text-gray-700" :class="{ 'mt-1': title }">
              {{ message }}
            </p>
          </div>
          <div class="ml-4 flex-shrink-0 flex">
            <button
              class="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              @click="close"
            >
              <span class="sr-only">Fechar</span>
              <X class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-vue-next";

export interface ToastProps {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title?: string;
  message: string;
  duration?: number;
  persistent?: boolean;
}

const props = withDefaults(defineProps<ToastProps>(), {
  duration: 5000,
  persistent: false,
  title: "",
});

const emit = defineEmits<{
  close: [id: string];
}>();

const visible = ref(false);

const typeClasses = computed(() => {
  switch (props.type) {
    case "success":
      return "border-l-4 border-l-green-500";
    case "error":
      return "border-l-4 border-l-red-500";
    case "warning":
      return "border-l-4 border-l-yellow-500";
    default:
      return "border-l-4 border-l-blue-500";
  }
});

const close = () => {
  visible.value = false;
  setTimeout(() => {
    emit("close", props.id);
  }, 200);
};

onMounted(() => {
  visible.value = true;

  if (!props.persistent && props.duration > 0) {
    setTimeout(() => {
      close();
    }, props.duration);
  }
});
</script>
