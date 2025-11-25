<template>
  <div class="min-h-screen pt-32 pb-20 px-4">
    <div class="container mx-auto max-w-5xl">
      <h1 class="text-4xl font-bold mb-6">Veículos</h1>
      <div class="card p-6 shadow-medium space-y-6">
        <p class="text-muted-foreground">
          Gerencie a frota utilizada nos serviços.
        </p>

        <!-- Add new vehicle -->
        <div class="space-y-3">
          <div class="grid grid-cols-1 md:grid-cols-6 gap-3">
            <div class="md:col-span-2">
              <label for="vehicle-name" class="text-xs mb-1 block">Nome</label>
              <input
                id="vehicle-name"
                v-model="newVehicle.name"
                class="h-12 px-3 border border-gray-200 rounded-md bg-white w-full"
                placeholder="Ex.: Sedan Executivo"
              />
            </div>
            <div class="md:col-span-2">
              <label for="vehicle-description" class="text-xs mb-1 block"
                >Descrição</label
              >
              <input
                id="vehicle-description"
                v-model="newVehicle.description"
                class="h-12 px-3 border border-gray-200 rounded-md bg-white w-full"
                placeholder="Opcional"
              />
            </div>
            <div>
              <label for="vehicle-capacity" class="text-xs mb-1 block"
                >Capacidade</label
              >
              <input
                id="vehicle-capacity"
                v-model.number="newVehicle.capacity_max"
                type="number"
                class="h-12 px-3 border border-gray-200 rounded-md bg-white w-full"
                placeholder="0"
              />
            </div>
            <div>
              <label for="vehicle-suitcases" class="text-xs mb-1 block"
                >Malas (suitcases)</label
              >
              <input
                id="vehicle-suitcases"
                v-model.number="newVehicle.suitcases"
                type="number"
                class="h-12 px-3 border border-gray-200 rounded-md bg-white w-full"
                placeholder="0"
              />
            </div>
            <div>
              <label for="vehicle-price-add" class="text-xs mb-1 block"
                >Acréscimo (R$)</label
              >
              <input
                id="vehicle-price-add"
                v-model.number="newVehicle.price_add"
                type="number"
                step="0.01"
                class="h-12 px-3 border border-gray-200 rounded-md bg-white w-full"
                placeholder="0"
              />
            </div>
            <div class="md:col-span-2">
              <label for="vehicle-service-id" class="text-xs mb-1 block"
                >Serviço (vinculado)</label
              >
              <select
                id="vehicle-service-id"
                v-model="newVehicle.service_id"
                class="h-12 px-3 border border-gray-200 rounded-md bg-white w-full"
              >
                <option :value="null">Selecione</option>
                <option v-for="s in services" :key="s.id" :value="s.id">
                  {{ s.name }}
                </option>
              </select>
            </div>
            <div class="md:col-span-6">
              <label class="inline-flex items-center gap-2 text-sm">
                <input v-model="newVehicle.active" type="checkbox" />
                Ativo
              </label>
            </div>
          </div>
          <div>
            <button
              type="button"
              class="btn btn-primary gradient-ocean btn-with-icon"
              @click="createVehicle"
            >
              <Plus class="w-4 h-4" />
              Adicionar
            </button>
          </div>
        </div>

        <!-- Vehicles list (desktop, grid sem scroll) -->
        <div class="hidden md:block space-y-3">
          <div
            v-for="v in vehicles"
            :key="v.id"
            class="border border-gray-200 rounded-lg p-4 shadow-sm"
          >
            <!-- Linha 1: Nome, Descrição, Serviço, Ativo -->
            <div class="grid grid-cols-12 gap-3 items-start">
              <div class="col-span-3">
                <div class="text-xs mb-1">Nome</div>
                <div class="font-semibold">{{ v.name }}</div>
              </div>
              <div class="col-span-4">
                <div class="text-xs mb-1">Descrição</div>
                <div>{{ v.description }}</div>
              </div>
              <div class="col-span-4">
                <div class="text-xs mb-1">Serviço</div>
                <div>{{ serviceName(v.service_id) }}</div>
              </div>
              <div class="md:col-span-1">
                <span
                  :class="
                    v.active
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                      : 'bg-red-100 text-red-700 border-red-200'
                  "
                  class="inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-semibold border"
                >
                  <span
                    :class="v.active ? 'bg-emerald-500' : 'bg-red-500'"
                    class="w-2 h-2 rounded-full"
                  ></span>
                  {{ v.active ? "Ativo" : "Inativo" }}
                </span>
              </div>
            </div>

            <!-- Linha 2: Capacidade, Acréscimo, Ações -->
            <div class="grid grid-cols-12 gap-3 mt-3 items-end">
              <div class="col-span-2">
                <div class="text-xs mb-1">Capacidade</div>
                <div>{{ v.capacity_max }}</div>
              </div>
              <div class="col-span-2">
                <div class="text-xs mb-1">Malas (suitcases)</div>
                <div>{{ v.suitcases }}</div>
              </div>
              <div class="col-span-2">
                <div class="text-xs mb-1">Acréscimo (R$)</div>
                <div>{{ v.price_add }}</div>
              </div>
              <div class="col-span-6 flex items-center gap-2 justify-end">
                <button
                  class="btn btn-primary gradient-ocean btn-with-icon h-9 px-3 text-sm"
                  @click="openEdit(v)"
                >
                  Editar
                </button>
                <button
                  class="btn btn-outline btn-with-icon h-9 px-3 text-sm text-red-600 border-red-300 hover:bg-red-50"
                  @click="requestRemoveVehicle(v)"
                >
                  <Trash2 class="w-4 h-4" />
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Vehicles cards (mobile) -->
        <div class="md:hidden space-y-4">
          <div
            v-for="v in vehicles"
            :key="v.id"
            class="border border-gray-200 rounded-lg p-4 shadow-sm"
          >
            <div class="grid grid-cols-1 gap-3">
              <div>
                <div class="text-xs mb-1">Nome</div>
                <div class="font-semibold">{{ v.name }}</div>
              </div>
              <div>
                <div class="text-xs mb-1">Descrição</div>
                <div>{{ v.description }}</div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <div class="text-xs mb-1">Capacidade</div>
                  <div>{{ v.capacity_max }}</div>
                </div>
                <div>
                  <div class="text-xs mb-1">Malas (suitcases)</div>
                  <div>{{ v.suitcases }}</div>
                </div>
                <div>
                  <div class="text-xs mb-1">Acréscimo (R$)</div>
                  <div>{{ v.price_add }}</div>
                </div>
              </div>
              <div>
                <label
                  :for="'vehicle-service-' + v.id"
                  class="text-xs mb-1 block"
                  >Serviço</label
                >
                <select
                  v-model="v.service_id"
                  class="h-10 px-2 border border-gray-200 rounded-md bg-white w-full"
                >
                  <option :value="null">Selecione</option>
                  <option v-for="s in services" :key="s.id" :value="s.id">
                    {{ s.name }}
                  </option>
                </select>
              </div>
              <div>
                <div class="text-xs mb-1">Status</div>
                <span
                  :class="
                    v.active
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                      : 'bg-red-100 text-red-700 border-red-200'
                  "
                  class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border"
                >
                  <span
                    :class="v.active ? 'bg-emerald-500' : 'bg-red-500'"
                    class="w-2 h-2 rounded-full"
                  ></span>
                  {{ v.active ? "Ativo" : "Inativo" }}
                </span>
              </div>
              <div class="flex gap-3">
                <button
                  class="flex-1 btn btn-primary gradient-ocean btn-with-icon"
                  @click="openEdit(v)"
                >
                  Editar
                </button>
                <button
                  class="flex-1 btn btn-outline btn-with-icon text-red-600 border-red-300 hover:bg-red-50"
                  @click="requestRemoveVehicle(v)"
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
          title="Excluir Veículo"
          message="Tem certeza que deseja excluir este veículo? Esta ação não pode ser desfeita."
          confirm-text="Excluir"
          cancel-text="Cancelar"
          @close="
            showDeleteModal = false;
            vehicleToDelete = null;
          "
          @confirm="confirmRemoveVehicle"
        />
      </div>
    </div>
  </div>

  <!-- Edit Modal -->
  <Teleport to="body">
    <div v-if="showEditModal" class="fixed inset-0 z-[100]">
      <div class="absolute inset-0 bg-black/40" @click="closeEdit"></div>
      <div class="absolute inset-0 flex items-center justify-center p-4">
        <div
          class="bg-white rounded-xl shadow-large w-full max-w-2xl border border-gray-200"
        >
          <div class="p-6 space-y-3">
            <h3 class="text-lg font-semibold">Editar veículo</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label class="text-xs mb-1 block">Nome</label>
                <input
                  v-model="editVehicle!.name"
                  class="h-10 px-2 border border-gray-200 rounded-md bg-white w-full"
                />
              </div>
              <div>
                <label class="text-xs mb-1 block">Descrição</label>
                <input
                  v-model="editVehicle!.description"
                  class="h-10 px-2 border border-gray-200 rounded-md bg-white w-full"
                />
              </div>
              <div>
                <label class="text-xs mb-1 block">Capacidade</label>
                <input
                  v-model.number="editVehicle!.capacity_max"
                  type="number"
                  class="h-10 px-2 border border-gray-200 rounded-md bg-white w-full"
                />
              </div>
              <div>
                <label class="text-xs mb-1 block">Malas (suitcases)</label>
                <input
                  v-model.number="editVehicle!.suitcases"
                  type="number"
                  class="h-10 px-2 border border-gray-200 rounded-md bg-white w-full"
                />
              </div>
              <div>
                <label class="text-xs mb-1 block">Acréscimo (R$)</label>
                <input
                  v-model.number="editVehicle!.price_add"
                  type="number"
                  step="0.01"
                  class="h-10 px-2 border border-gray-200 rounded-md bg-white w-full"
                />
              </div>
              <div>
                <label class="text-xs mb-1 block">Serviço</label>
                <select
                  v-model="editVehicle!.service_id"
                  class="h-10 px-2 border border-gray-200 rounded-md bg-white w-full"
                >
                  <option :value="null">Selecione</option>
                  <option v-for="s in services" :key="s.id" :value="s.id">
                    {{ s.name }}
                  </option>
                </select>
              </div>
              <div class="md:col-span-2">
                <label class="inline-flex items-center gap-2 text-sm">
                  <input v-model="editVehicle!.active" type="checkbox" /> Ativo
                </label>
              </div>
            </div>
            <div class="flex gap-2 justify-end mt-4">
              <button class="btn btn-outline" @click="closeEdit">
                Cancelar
              </button>
              <button class="btn btn-primary" @click="saveEditVehicle">
                Salvar
              </button>
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
  fetchVehicles,
  fetchVehiclesAdmin,
  insertVehicle,
  updateVehicle,
  deleteVehicle,
  fetchServices,
  type VehicleRow,
  type ServiceRow,
} from "@/services/supabase";
import ConfirmModal from "@/components/ui/ConfirmModal.vue";
import { useToastStore } from "@/stores/toast";

const vehicles = ref<VehicleRow[]>([]);
const services = ref<ServiceRow[]>([]);
const toast = useToastStore();

const newVehicle = ref<{
  name: string;
  description?: string | null;
  capacity_max: number;
  suitcases?: number;
  price_add: number;
  active: boolean;
  service_id?: string | null;
}>({
  name: "",
  description: "",
  capacity_max: 0,
  suitcases: 0,
  price_add: 0,
  active: true,
  service_id: null,
});

async function loadVehicles() {
  try {
    const [vh, sv] = await Promise.all([fetchVehiclesAdmin(), fetchServices()]);
    vehicles.value = vh;
    services.value = sv;
  } catch (err) {
    console.warn(err);
    toast.error("Falha ao carregar veículos");
  }
}

function serviceName(id?: string | null) {
  if (!id) return "Não vinculado";
  const svc = services.value.find((s) => s.id === id);
  return svc ? svc.name : "Não vinculado";
}

async function createVehicle() {
  try {
    if (!newVehicle.value.service_id) {
      toast.error(
        "Selecione o serviço vinculado ao veículo antes de adicionar",
      );
      return;
    }
    const [created] = await insertVehicle({
      name: newVehicle.value.name.trim(),
      description: newVehicle.value.description || null,
      capacity_max: Number(newVehicle.value.capacity_max || 0),
      suitcases: Number(newVehicle.value.suitcases || 0),
      price_add: Number(newVehicle.value.price_add || 0),
      active: !!newVehicle.value.active,
      service_id: newVehicle.value.service_id || null,
    });
    vehicles.value.push(created);
    newVehicle.value = {
      name: "",
      description: "",
      capacity_max: 0,
      suitcases: 0,
      price_add: 0,
      active: true,
    };
    toast.success("Veículo adicionado com sucesso");
  } catch (err) {
    console.warn(err);
    toast.error("Erro ao adicionar veículo");
  }
}

async function saveVehicle(v: VehicleRow) {
  try {
    if (!v.service_id) {
      toast.error("Este veículo precisa estar vinculado a um serviço");
      return;
    }
    await updateVehicle(v.id, {
      name: v.name,
      description: v.description || null,
      capacity_max: Number(v.capacity_max || 0),
      suitcases: Number(v.suitcases || 0),
      price_add: Number(v.price_add || 0),
      active: !!v.active,
      service_id: v.service_id || null,
    });
    toast.success("Veículo atualizado");
  } catch (err) {
    console.warn(err);
    toast.error("Erro ao salvar veículo");
  }
}

async function removeVehicle(v: VehicleRow) {
  try {
    await deleteVehicle(v.id);
    vehicles.value = vehicles.value.filter((x) => x.id !== v.id);
    toast.success("Veículo excluído");
  } catch (err) {
    console.warn(err);
    toast.error("Erro ao excluir veículo");
  }
}

onMounted(loadVehicles);

// Modal state
const showDeleteModal = ref(false);
const vehicleToDelete = ref<VehicleRow | null>(null);

const showEditModal = ref(false);
const editVehicle = ref<VehicleRow | null>(null);

function openEdit(v: VehicleRow) {
  editVehicle.value = { ...v };
  showEditModal.value = true;
}
function closeEdit() {
  showEditModal.value = false;
  editVehicle.value = null;
}
async function saveEditVehicle() {
  if (!editVehicle.value) return;
  try {
    if (!editVehicle.value.service_id) {
      toast.error("Este veículo precisa estar vinculado a um serviço");
      return;
    }
    await updateVehicle(editVehicle.value.id, {
      name: editVehicle.value.name,
      description: editVehicle.value.description || null,
      capacity_max: Number(editVehicle.value.capacity_max || 0),
      suitcases: Number(editVehicle.value.suitcases || 0),
      price_add: Number(editVehicle.value.price_add || 0),
      active: !!editVehicle.value.active,
      service_id: editVehicle.value.service_id || null,
    });
    toast.success("Veículo atualizado");
    closeEdit();
    await loadVehicles();
  } catch (err) {
    console.warn(err);
    toast.error("Erro ao salvar veículo");
  }
}

function requestRemoveVehicle(v: VehicleRow) {
  vehicleToDelete.value = v;
  showDeleteModal.value = true;
}

async function confirmRemoveVehicle() {
  if (!vehicleToDelete.value) return;
  await removeVehicle(vehicleToDelete.value);
  showDeleteModal.value = false;
  vehicleToDelete.value = null;
}
</script>
