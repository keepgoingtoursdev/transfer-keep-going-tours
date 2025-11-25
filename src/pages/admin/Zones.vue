<template>
  <div class="min-h-screen pt-32 pb-20 px-4">
    <div class="container mx-auto max-w-5xl">
      <h1 class="text-4xl font-bold mb-6">Zonas</h1>
      <div class="card p-6 shadow-medium space-y-6">
        <p class="text-muted-foreground">
          Gerencie as regiões com faixas de CEP e acréscimo para cálculo
          dinâmico.
        </p>

        <!-- Add new zone -->
        <div class="space-y-3">
          <div class="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div>
              <label class="text-xs mb-1 block">Nome</label>
              <input
                v-model="newZone.name"
                placeholder="Ex.: Zona Sul"
                class="h-12 px-3 border border-gray-200 rounded-md bg-white w-full"
              />
            </div>
            <div>
              <label class="text-xs mb-1 block">CEP inicial</label>
              <input
                v-model="newZone.cep_start"
                placeholder="00000-000"
                class="h-12 px-3 border border-gray-200 rounded-md bg-white w-full"
                @input="newZone.cep_start = maskCep(newZone.cep_start)"
              />
            </div>
            <div>
              <label class="text-xs mb-1 block">CEP final</label>
              <input
                v-model="newZone.cep_end"
                placeholder="00000-000"
                class="h-12 px-3 border border-gray-200 rounded-md bg-white w-full"
                @input="newZone.cep_end = maskCep(newZone.cep_end)"
              />
            </div>
            <div>
              <label class="text-xs mb-1 block">Acréscimo (R$)</label>
              <input
                v-model.number="newZone.price_add"
                placeholder="0"
                class="h-12 px-3 border border-gray-200 rounded-md bg-white w-full"
              />
            </div>
            <div>
              <button
                class="btn mt-6 btn-primary gradient-ocean w-full btn-with-icon"
                @click="createZone"
              >
                <Plus class="w-4 h-4" />
                Adicionar
              </button>
            </div>
          </div>
        </div>

        <!-- Zones table (desktop) -->
        <div class="hidden md:block overflow-x-auto">
          <table class="min-w-full text-left">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="py-3 px-3 text-sm font-semibold">Nome</th>
                <th class="py-3 px-3 text-sm font-semibold">CEP Inicial</th>
                <th class="py-3 px-3 text-sm font-semibold">CEP Final</th>
                <th class="py-3 px-3 text-sm font-semibold">Acréscimo (R$)</th>
                <th class="py-3 px-3 text-sm font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="z in zones"
                :key="z.id"
                class="border-b border-gray-100"
              >
                <td class="py-2 px-3">
                  <div class="font-semibold">{{ z.name }}</div>
                </td>
                <td class="py-2 px-3">
                  <div>{{ z.cep_start }}</div>
                </td>
                <td class="py-2 px-3">
                  <div>{{ z.cep_end }}</div>
                </td>
                <td class="py-2 px-3">
                  <div class="w-32">{{ z.price_add }}</div>
                </td>
                <td class="py-2 px-3">
                  <div class="flex items-center gap-2">
                    <button
                      class="btn btn-primary gradient-ocean btn-with-icon h-9 px-3 text-sm"
                      @click="openEdit(z)"
                    >
                      Editar
                    </button>
                    <button
                      class="btn btn-outline btn-with-icon h-9 px-3 text-sm text-red-600 border-red-300 hover:bg-red-50"
                      @click="requestRemoveZone(z)"
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

        <!-- Zones cards (mobile) -->
        <div class="md:hidden space-y-4">
          <div
            v-for="z in zones"
            :key="z.id"
            class="border border-gray-200 rounded-lg p-4 shadow-sm"
          >
            <div class="grid grid-cols-1 gap-3">
              <div>
                <div class="text-xs mb-1">Nome</div>
                <div class="font-semibold">{{ z.name }}</div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <div class="text-xs mb-1">CEP inicial</div>
                  <div>{{ z.cep_start }}</div>
                </div>
                <div>
                  <div class="text-xs mb-1">CEP final</div>
                  <div>{{ z.cep_end }}</div>
                </div>
              </div>
              <div>
                <div class="text-xs mb-1">Acréscimo (R$)</div>
                <div>{{ z.price_add }}</div>
              </div>
              <div class="flex gap-3">
                <button
                  class="flex-1 btn btn-primary gradient-gold btn-with-icon"
                  @click="openEdit(z)"
                >
                  Editar
                </button>
                <button
                  class="flex-1 btn btn-outline btn-with-icon text-red-600 border-red-300 hover:bg-red-50"
                  @click="requestRemoveZone(z)"
                >
                  <Trash2 class="w-4 h-4" />
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Confirm Delete Modal -->
  <ConfirmModal
    :open="showDeleteModal"
    title="Excluir Zona"
    message="Tem certeza que deseja excluir esta zona? Esta ação não pode ser desfeita."
    confirm-text="Excluir"
    cancel-text="Cancelar"
    @close="
      showDeleteModal = false;
      zoneToDelete = null;
    "
    @confirm="confirmRemoveZone"
  />
  <Teleport to="body">
    <div v-if="editOpen" class="fixed inset-0 z-[100]">
      <div class="absolute inset-0 bg-black/40" @click="editOpen = false"></div>
      <div class="absolute inset-0 flex items-center justify-center p-4">
        <div
          class="bg-white rounded-xl shadow-large w-full max-w-md border border-gray-200"
        >
          <div class="p-6 space-y-3">
            <h3 class="text-lg font-semibold">Editar zona</h3>
            <div>
              <label class="block text-sm mb-1">Nome</label>
              <input
                v-model="editForm.name"
                class="w-full h-10 border rounded px-3"
              />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm mb-1">CEP inicial</label>
                <input
                  v-model="editForm.cep_start"
                  class="w-full h-10 border rounded px-3"
                  @input="editForm.cep_start = maskCep(editForm.cep_start)"
                />
              </div>
              <div>
                <label class="block text-sm mb-1">CEP final</label>
                <input
                  v-model="editForm.cep_end"
                  class="w-full h-10 border rounded px-3"
                  @input="editForm.cep_end = maskCep(editForm.cep_end)"
                />
              </div>
            </div>
            <div>
              <label class="block text-sm mb-1">Acréscimo (R$)</label>
              <input
                v-model.number="editForm.price_add"
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
  fetchZones,
  insertZone,
  updateZone,
  deleteZone,
  type ZoneRow,
} from "@/services/supabase";
import { useToastStore } from "@/stores/toast";
import ConfirmModal from "@/components/ui/ConfirmModal.vue";

const zones = ref<ZoneRow[]>([]);
const toast = useToastStore();

const newZone = ref<{
  name: string;
  cep_start: string;
  cep_end: string;
  price_add: number | null;
}>({
  name: "",
  cep_start: "",
  cep_end: "",
  price_add: null,
});

const maskCep = (value: string) => {
  const digits = (value || "").replace(/\D/g, "").slice(0, 8);
  return digits.length > 5
    ? `${digits.slice(0, 5)}-${digits.slice(5)}`
    : digits;
};

async function load() {
  try {
    zones.value = await fetchZones();
  } catch (err) {
    console.warn(err);
    toast.error("Falha ao carregar zonas");
  }
}

async function createZone() {
  if (
    !newZone.value.name ||
    !newZone.value.cep_start ||
    !newZone.value.cep_end
  ) {
    toast.error("Preencha nome e faixas de CEP.");
    return;
  }
  try {
    await insertZone({
      name: newZone.value.name,
      cep_start: newZone.value.cep_start,
      cep_end: newZone.value.cep_end,
      price_add: newZone.value.price_add ?? 0,
    });
    toast.success("Zona criada.");
    newZone.value = {
      name: "",
      cep_start: "",
      cep_end: "",
      price_add: null,
    };
    await load();
  } catch (err) {
    console.warn(err);
    toast.error("Erro ao criar zona.");
  }
}

const editOpen = ref(false);
const editTarget = ref<ZoneRow | null>(null);
const editForm = ref({ name: "", cep_start: "", cep_end: "", price_add: 0 });

function openEdit(z: ZoneRow) {
  editTarget.value = z;
  editForm.value = {
    name: z.name,
    cep_start: z.cep_start,
    cep_end: z.cep_end,
    price_add: Number(z.price_add ?? 0),
  };
  editOpen.value = true;
}

async function saveEdit() {
  if (!editTarget.value) return;
  try {
    await updateZone(editTarget.value.id, {
      name: editForm.value.name,
      cep_start: editForm.value.cep_start,
      cep_end: editForm.value.cep_end,
      price_add: editForm.value.price_add ?? 0,
    });
    toast.success("Zona atualizada.");
    editOpen.value = false;
    editTarget.value = null;
    await load();
  } catch (err) {
    console.warn(err);
    toast.error("Erro ao atualizar zona.");
  }
}

// Modal de confirmação
// eslint-disable-next-line @typescript-eslint/no-unused-vars

const showDeleteModal = ref(false);
const zoneToDelete = ref<ZoneRow | null>(null);

function requestRemoveZone(z: ZoneRow) {
  zoneToDelete.value = z;
  showDeleteModal.value = true;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function confirmRemoveZone() {
  if (!zoneToDelete.value) return;
  try {
    await deleteZone(zoneToDelete.value.id);
    toast.success("Zona excluída.");
    showDeleteModal.value = false;
    zoneToDelete.value = null;
    await load();
  } catch (err) {
    console.warn(err);
    toast.error("Erro ao excluir zona.");
  }
}

onMounted(load);
</script>
