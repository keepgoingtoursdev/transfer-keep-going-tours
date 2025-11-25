<template>
  <div class="min-h-screen pt-32 pb-20 px-4">
    <div class="container mx-auto max-w-5xl">
      <h1 class="text-4xl font-bold mb-6">Serviços</h1>
      <div class="card p-6 shadow-medium space-y-6">
        <p class="text-muted-foreground">
          Gerencie os serviços e seus valores base (base_price).
        </p>

        <!-- Add new service -->
        <div class="space-y-3">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div class="md:col-span-1">
              <label for="newServiceName" class="text-xs mb-1 block"
                >Nome</label
              >
              <input
                v-model="newService.name"
                class="h-12 px-3 border border-gray-200 rounded-md bg-white w-full"
                placeholder="Ex.: Transfer Privado"
              />
            </div>
            <div class="md:col-span-2">
              <label for="newServiceDescription" class="text-xs mb-1 block"
                >Descrição</label
              >
              <input
                v-model="newService.description"
                class="h-12 px-3 border border-gray-200 rounded-md bg-white w-full"
                placeholder="Opcional"
              />
            </div>
            <div class="md:col-span-1">
              <label for="newServiceBasePrice" class="text-xs mb-1 block"
                >Preço base (R$)</label
              >
              <input
                v-model.number="newService.base_price"
                type="number"
                step="0.01"
                class="h-12 px-3 border border-gray-200 rounded-md bg-white w-full"
                placeholder="0"
              />
            </div>
          </div>
          <div>
            <button
              class="btn btn-primary gradient-ocean btn-with-icon"
              @click="createService"
            >
              <Plus class="w-4 h-4" />
              Adicionar
            </button>
          </div>
        </div>

        <!-- Services table (desktop) -->
        <div class="hidden md:block overflow-x-auto">
          <table class="min-w-full text-left">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="py-3 px-3 text-sm font-semibold">Nome</th>
                <th class="py-3 px-3 text-sm font-semibold">Descrição</th>
                <th class="py-3 px-3 text-sm font-semibold">Preço base (R$)</th>
                <th class="py-3 px-3 text-sm font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="s in services"
                :key="s.id"
                class="border-b border-gray-100"
              >
                <td class="py-2 px-3">
                  <div class="font-semibold">{{ s.name }}</div>
                </td>
                <td class="py-2 px-3">
                  <div>{{ s.description }}</div>
                </td>
                <td class="py-2 px-3">
                  <div class="w-32">{{ s.base_price }}</div>
                </td>
                <td class="py-2 px-3">
                  <div class="flex items-center gap-2">
                    <button
                      class="btn btn-primary gradient-ocean btn-with-icon h-9 px-3 text-sm"
                      @click="openEdit(s)"
                    >
                      Editar
                    </button>
                    <button
                      class="btn btn-outline btn-with-icon h-9 px-3 text-sm text-red-600 border-red-300 hover:bg-red-50"
                      @click="requestRemoveService(s)"
                    >
                      <Trash2 class="w-4 h-4" />
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Services cards (mobile) -->
        <div class="md:hidden space-y-4">
          <div
            v-for="s in services"
            :key="s.id"
            class="border border-gray-200 rounded-lg p-4 shadow-sm"
          >
            <div class="grid grid-cols-1 gap-3">
              <div>
                <div class="text-xs mb-1">Nome</div>
                <div class="font-semibold">{{ s.name }}</div>
              </div>
              <div>
                <div class="text-xs mb-1">Descrição</div>
                <div>{{ s.description }}</div>
              </div>
              <div>
                <div class="text-xs mb-1">Preço base (R$)</div>
                <div>{{ s.base_price }}</div>
              </div>
              <div class="flex gap-3">
                <button
                  class="flex-1 btn btn-primary gradient-ocean btn-with-icon"
                  @click="openEdit(s)"
                >
                  Editar
                </button>
                <button
                  class="flex-1 btn btn-outline btn-with-icon text-red-600 border-red-300 hover:bg-red-50"
                  @click="requestRemoveService(s)"
                >
                  <Trash2 class="w-4 h-4" />
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Confirm Delete Modal -->
        <ConfirmModal
          :open="showDeleteModal"
          title="Excluir Serviço"
          message="Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita."
          confirm-text="Excluir"
          cancel-text="Cancelar"
          @close="
            showDeleteModal = false;
            serviceToDelete = null;
          "
          @confirm="confirmRemoveService"
        />
      </div>
    </div>
  </div>
  <Teleport to="body">
    <div v-if="editOpen" class="fixed inset-0 z-[100]">
      <div class="absolute inset-0 bg-black/40" @click="editOpen = false"></div>
      <div class="absolute inset-0 flex items-center justify-center p-4">
        <div
          class="bg-white rounded-xl shadow-large w-full max-w-md border border-gray-200"
        >
          <div class="p-6 space-y-3">
            <h3 class="text-lg font-semibold">Editar serviço</h3>
            <div>
              <label class="block text-sm mb-1">Nome</label>
              <input
                v-model="editForm.name"
                class="w-full h-10 border rounded px-3"
              />
            </div>
            <div>
              <label class="block text-sm mb-1">Descrição</label>
              <input
                v-model="editForm.description"
                class="w-full h-10 border rounded px-3"
              />
            </div>
            <div>
              <label class="block text-sm mb-1">Preço base (R$)</label>
              <input
                v-model.number="editForm.base_price"
                type="number"
                step="0.01"
                class="w-full h-10 border rounded px-3"
              />
            </div>
            <div class="flex gap-2 justify-end mt-4">
              <button class="btn btn-outline" @click="editOpen = false">
                Cancelar
              </button>
              <button class="btn btn-primary" @click="saveEdit">Salvar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Plus, Trash2 } from "lucide-vue-next";
import {
  fetchServices,
  insertService,
  updateService,
  deleteService,
  type ServiceRow,
} from "@/services/supabase";
import ConfirmModal from "@/components/ui/ConfirmModal.vue";
import { useToastStore } from "@/stores/toast";

const services = ref<ServiceRow[]>([]);
const toast = useToastStore();

const newService = ref<{
  name: string;
  description?: string | null;
  base_price: number;
}>({
  name: "",
  description: "",
  base_price: 0,
});

async function loadServices() {
  try {
    services.value = await fetchServices();
  } catch (err) {
    console.warn(err);
    toast.error("Falha ao carregar serviços");
  }
}

async function createService() {
  try {
    const [created] = await insertService({
      name: newService.value.name.trim(),
      description: newService.value.description || null,
      base_price: Number(newService.value.base_price || 0),
    });
    services.value.push(created);
    newService.value = { name: "", description: "", base_price: 0 };
    toast.success("Serviço adicionado com sucesso");
  } catch (err) {
    console.warn(err);
    toast.error("Erro ao adicionar serviço");
  }
}

const editOpen = ref(false);
const editTarget = ref<ServiceRow | null>(null);
const editForm = ref({ name: "", description: "", base_price: 0 });

function openEdit(s: ServiceRow) {
  editTarget.value = s;
  editForm.value = {
    name: s.name,
    description: s.description || "",
    base_price: Number(s.base_price || 0),
  };
  editOpen.value = true;
}

async function saveEdit() {
  if (!editTarget.value) return;
  try {
    await updateService(editTarget.value.id, {
      name: editForm.value.name,
      description: editForm.value.description || null,
      base_price: Number(editForm.value.base_price || 0),
    });
    toast.success("Serviço atualizado");
    editOpen.value = false;
    editTarget.value = null;
    await loadServices();
  } catch (err) {
    console.warn(err);
    toast.error("Erro ao salvar serviço");
  }
}

async function removeService(s: ServiceRow) {
  try {
    await deleteService(s.id);
    services.value = services.value.filter((x) => x.id !== s.id);
    toast.success("Serviço excluído");
  } catch (err) {
    console.warn(err);
    toast.error("Erro ao excluir serviço");
  }
}

onMounted(loadServices);
// Modal state
const showDeleteModal = ref(false);
const serviceToDelete = ref<ServiceRow | null>(null);

function requestRemoveService(s: ServiceRow) {
  serviceToDelete.value = s;
  showDeleteModal.value = true;
}

async function confirmRemoveService() {
  if (!serviceToDelete.value) return;
  await removeService(serviceToDelete.value);
  showDeleteModal.value = false;
  serviceToDelete.value = null;
}
</script>
