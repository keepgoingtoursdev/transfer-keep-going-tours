<template>
  <div class="min-h-screen pt-32 pb-20 px-4">
    <div class="container mx-auto max-w-2xl">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold mb-2">Criar Conta</h1>
        <p class="text-muted-foreground">
          Cadastre-se para agilizar seus pedidos de transfer.
        </p>
      </div>
      <div class="card p-6 shadow-medium">
        <form
          class="grid grid-cols-1 md:grid-cols-2 gap-4"
          @submit.prevent="onSubmit"
        >
          <div class="md:col-span-2">
            <label class="block text-sm font-medium mb-1">Nome</label>
            <input
              v-model="form.name"
              type="text"
              required
              class="w-full h-12 px-3 border border-gray-200 rounded-md bg-white"
              placeholder="Seu nome"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">E-mail</label>
            <input
              v-model="form.email"
              type="email"
              required
              class="w-full h-12 px-3 border border-gray-200 rounded-md bg-white"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">CEP</label>
            <input
              :value="form.address_zip"
              type="text"
              class="w-full h-12 px-3 border border-gray-200 rounded-md bg-white"
              placeholder="00000-000"
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
              placeholder="Logradouro"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Número</label>
            <input
              v-model="form.address_number"
              type="text"
              class="w-full h-12 px-3 border border-gray-200 rounded-md bg-white"
              placeholder="Número"
            />
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium mb-1">Complemento</label>
            <input
              v-model="form.address_complement"
              type="text"
              class="w-full h-12 px-3 border border-gray-200 rounded-md bg-white"
              placeholder="Apartamento, bloco, ponto de referência"
            />
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium mb-1">Bairro</label>
            <input
              v-model="form.address_neighborhood"
              type="text"
              class="w-full h-12 px-3 border border-gray-200 rounded-md bg-white"
              placeholder="Bairro"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Cidade</label>
            <input
              v-model="form.address_city"
              type="text"
              required
              class="w-full h-12 px-3 border border-gray-200 rounded-md bg-white"
              placeholder="Cidade"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Estado</label>
            <input
              v-model="form.address_state"
              type="text"
              required
              class="w-full h-12 px-3 border border-gray-200 rounded-md bg-white"
              placeholder="UF"
            />
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium mb-1">País</label>
            <input
              v-model="form.address_country"
              type="text"
              class="w-full h-12 px-3 border border-gray-200 rounded-md bg-white"
              placeholder="Brasil"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Senha</label>
            <input
              v-model="password"
              type="password"
              required
              class="w-full h-12 px-3 border border-gray-200 rounded-md bg-white"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1"
              >Confirmar Senha</label
            >
            <input
              v-model="confirmPassword"
              type="password"
              required
              class="w-full h-12 px-3 border border-gray-200 rounded-md bg-white"
              placeholder="••••••••"
            />
          </div>

          <div class="md:col-span-2 mt-2">
            <button
              class="btn w-full bg-brand-primary text-white hover:bg-brand-primary/90"
              :disabled="loading"
            >
              {{ loading ? "Cadastrando..." : "Criar Conta" }}
            </button>
          </div>
        </form>
        <p class="text-sm text-muted-foreground mt-4 text-center">
          Já tem conta?
          <router-link
            class="text-brand-primary hover:underline"
            to="/admin/login"
            >Entrar</router-link
          >
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useToastStore } from "@/stores/toast";
import { fetchViaCep, signUpWithProfile } from "@/services/auth";
import { maskCep } from "@/utils/masks";

const router = useRouter();
const toast = useToastStore();

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
  address_country: "Brasil",
});

const password = ref("");
const confirmPassword = ref("");
const loading = ref(false);

const onCepBlur = async () => {
  const res = await fetchViaCep(form.address_zip);
  if (!res) {
    return;
  }
  form.address_city = res.localidade || form.address_city;
  form.address_state = res.uf || form.address_state;
  form.address_street = res.logradouro || form.address_street;
  form.address_neighborhood = res.bairro || form.address_neighborhood;
  form.address_complement = res.complemento || form.address_complement;
};

const onCepInput = (e: Event) => {
  const val = (e.target as HTMLInputElement).value;
  form.address_zip = maskCep(val);
};

const onSubmit = async () => {
  if (password.value !== confirmPassword.value) {
    toast.warning("As senhas não coincidem");
    return;
  }
  if (!form.name || !form.email || !form.address_city || !form.address_state) {
    toast.warning("Preencha os campos obrigatórios");
    return;
  }
  loading.value = true;
  try {
    await signUpWithProfile(
      {
        name: form.name,
        email: form.email,
        address_zip: form.address_zip,
        address_street: form.address_street,
        address_number: form.address_number,
        address_complement: form.address_complement,
        address_neighborhood: form.address_neighborhood,
        address_city: form.address_city,
        address_state: form.address_state,
        address_country: form.address_country,
      },
      password.value,
    );
    toast.success("Cadastro realizado! Verifique seu e-mail para confirmar.");
    setTimeout(() => {
      router.push({ path: "/" });
    }, 2000);
  } catch (e: any) {
    console.error(e);
    toast.error(e?.message || "Falha no cadastro");
  } finally {
    loading.value = false;
  }
};
</script>
