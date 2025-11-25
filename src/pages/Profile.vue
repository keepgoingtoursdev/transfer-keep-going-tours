<template>
  <div class="min-h-screen pt-32 pb-20 px-4">
    <div class="container mx-auto max-w-2xl">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold mb-2">Meu Perfil</h1>
        <p class="text-muted-foreground">
          Atualize seus dados de contato e endereço.
        </p>
      </div>
      <div v-if="loadingProfile" class="card p-6 shadow-medium animate-pulse">
        <div class="h-6 bg-muted rounded w-1/3 mb-4"></div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="h-12 bg-muted rounded"></div>
          <div class="h-12 bg-muted rounded"></div>
          <div class="h-12 bg-muted rounded md:col-span-2"></div>
          <div class="h-12 bg-muted rounded md:col-span-2"></div>
        </div>
      </div>
      <div v-if="userId && !loadingProfile" class="card p-6 shadow-medium">
        <form
          class="grid grid-cols-1 md:grid-cols-2 gap-4"
          @submit.prevent="onSubmit"
        >
          <div class="md:col-span-2">
            <label class="block text-sm font-medium mb-1">Nome</label>
            <input
              v-model="form.name"
              type="text"
              class="w-full h-12 px-3 border border-gray-200 rounded-md bg-white"
            />
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium mb-1">E-mail</label>
            <input
              v-model="form.email"
              type="email"
              class="w-full h-12 px-3 border border-gray-200 rounded-md bg-white"
              disabled
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">CEP</label>
            <input
              :value="form.address_zip"
              type="text"
              class="w-full h-12 px-3 border border-gray-200 rounded-md bg-white"
              @input="onCepInput"
              @blur="onCepBlur"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Rua/Avenida</label>
            <input
              v-model="form.address_street"
              type="text"
              class="w-full h-12 px-3 border border-gray-200 rounded-md bg-white"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Número</label>
            <input
              v-model="form.address_number"
              type="text"
              class="w-full h-12 px-3 border border-gray-200 rounded-md bg-white"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Complemento</label>
            <input
              v-model="form.address_complement"
              type="text"
              class="w-full h-12 px-3 border border-gray-200 rounded-md bg-white"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Bairro</label>
            <input
              v-model="form.address_neighborhood"
              type="text"
              class="w-full h-12 px-3 border border-gray-200 rounded-md bg-white"
            />
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium mb-1">Cidade</label>
            <input
              v-model="form.address_city"
              type="text"
              class="w-full h-12 px-3 border border-gray-200 rounded-md bg-white"
            />
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium mb-1">Estado</label>
            <input
              v-model="form.address_state"
              type="text"
              class="w-full h-12 px-3 border border-gray-200 rounded-md bg-white"
            />
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium mb-1">País</label>
            <input
              v-model="form.address_country"
              type="text"
              class="w-full h-12 px-3 border border-gray-200 rounded-md bg-white"
            />
          </div>

          <div class="md:col-span-2 mt-2">
            <button
              class="btn w-full bg-brand-primary text-white hover:bg-brand-primary/90"
              :disabled="loading"
            >
              {{ loading ? "Salvando..." : "Salvar Alterações" }}
            </button>
          </div>
        </form>
      </div>
      <div v-else class="text-center text-muted-foreground">
        Carregando perfil...
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from "vue";
import { useToastStore } from "@/stores/toast";
import { useAuthStore } from "@/stores/auth";
import { supabase } from "@/lib/supabaseClient";
import { fetchViaCep } from "@/services/auth";
import { maskCep } from "@/utils/masks";

const toast = useToastStore();
const auth = useAuthStore();

const userId = ref<string | null>(null);
const loading = ref(false);
const loadingProfile = ref(true);
const form = reactive({
  name: "",
  email: "",
  address_zip: "",
  address_street: "",
  address_number: "",
  address_complement: "",
  address_neighborhood: "",
  address_city: "",
  address_state: "",
  address_country: "",
});

onMounted(async () => {
  await auth.loadSession();
  userId.value = auth.user?.id || null;
  if (!userId.value) return;
  // Carregar perfil
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId.value)
    .single();
  if (error) {
    console.error(error);
    return;
  }
  Object.assign(form, data || {});
  // Aplicar máscara de CEP
  form.address_zip = maskCep(form.address_zip || "");
  loadingProfile.value = false;
});

const onCepInput = (e: Event) => {
  const val = (e.target as HTMLInputElement).value;
  form.address_zip = maskCep(val);
};

const onCepBlur = async () => {
  const res = await fetchViaCep(form.address_zip);
  if (!res) return;
  form.address_city = res.localidade || form.address_city;
  form.address_state = res.uf || form.address_state;
  form.address_street = res.logradouro || form.address_street;
  form.address_neighborhood = res.bairro || form.address_neighborhood;
  form.address_complement = res.complemento || form.address_complement;
};

const onSubmit = async () => {
  if (!userId.value) return;
  loading.value = true;
  try {
    const payload = {
      name: form.name,
      address_zip: form.address_zip,
      address_city: form.address_city,
      address_state: form.address_state,
      address_street: form.address_street,
      address_number: form.address_number,
      address_complement: form.address_complement,
      address_neighborhood: form.address_neighborhood,
      address_country: form.address_country,
    };
    const { error } = await supabase
      .from("users")
      .update(payload)
      .eq("id", userId.value);
    if (error) throw error;
    toast.success("Perfil atualizado com sucesso!");
  } catch (e: any) {
    console.error(e);
    toast.error(e?.message || "Falha ao atualizar perfil");
  } finally {
    loading.value = false;
  }
};
</script>
