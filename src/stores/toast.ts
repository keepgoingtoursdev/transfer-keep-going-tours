import { defineStore } from "pinia";
import { ref } from "vue";

export interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title?: string;
  message: string;
  duration?: number;
  persistent?: boolean;
}

export const useToastStore = defineStore("toast", () => {
  const toasts = ref<Toast[]>([]);

  const addToast = (toast: Omit<Toast, "id">) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      id,
      duration: 4000,
      persistent: false,
      ...toast,
    };

    toasts.value.push(newToast);
    return id;
  };

  const removeToast = (id: string) => {
    const index = toasts.value.findIndex((toast) => toast.id === id);
    if (index > -1) {
      toasts.value.splice(index, 1);
    }
  };

  const clearAll = () => {
    toasts.value = [];
  };

  // Métodos de conveniência
  const success = (
    message: string,
    title?: string,
    options?: Partial<Toast>,
  ) => {
    return addToast({
      type: "success",
      message,
      title,
      ...options,
    });
  };

  const error = (message: string, title?: string, options?: Partial<Toast>) => {
    return addToast({
      type: "error",
      message,
      title,
      duration: 4000, // Erros ficam mais tempo
      ...options,
    });
  };

  const warning = (
    message: string,
    title?: string,
    options?: Partial<Toast>,
  ) => {
    return addToast({
      type: "warning",
      message,
      title,
      ...options,
    });
  };

  const info = (message: string, title?: string, options?: Partial<Toast>) => {
    return addToast({
      type: "info",
      message,
      title,
      ...options,
    });
  };

  return {
    toasts,
    addToast,
    removeToast,
    clearAll,
    success,
    error,
    warning,
    info,
  };
});
