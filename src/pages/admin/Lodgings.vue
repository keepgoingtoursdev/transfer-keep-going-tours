<template>
  <div class="min-h-screen pt-32 pb-20 px-2">
    <div class="container mx-auto max-w-5xl">
      <h1 class="text-2xl font-bold mb-4">Hospedagens</h1>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Formulário de criação -->
        <div class="card p-4 border shadow-sm">
          <h2 class="text-lg font-semibold mb-3">Nova hospedagem</h2>
          <div class="space-y-3">
            <div>
              <label class="block text-sm mb-1" for="lodging-name">Nome</label>
              <input
                id="lodging-name"
                v-model="newLodging.name"
                type="text"
                class="w-full h-10 border rounded px-3"
                placeholder="Ex.: Apartamento Standard"
              />
            </div>
            <div>
              <label class="block text-sm mb-1" for="lodging-description"
                >Descrição</label
              >
              <input
                id="lodging-description"
                v-model="newLodging.description"
                type="text"
                class="w-full h-10 border rounded px-3"
                placeholder="Breve descrição do apartamento"
              />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm mb-1" for="lodging-pax"
                  >Pessoas/Apto</label
                >
                <input
                  id="lodging-pax"
                  v-model.number="newLodging.pax_per_apartment"
                  type="number"
                  min="1"
                  class="w-full h-10 border rounded px-3"
                />
              </div>
              <div>
                <label class="block text-sm mb-1" for="lodging-price"
                  >Preço/Apto</label
                >
                <input
                  id="lodging-price"
                  v-model.number="newLodging.price_per_apartment"
                  type="number"
                  min="0"
                  step="0.01"
                  class="w-full h-10 border rounded px-3"
                />
              </div>
            </div>
            <div class="flex items-center gap-2">
              <input
                id="lodging-active"
                v-model="newLodging.active"
                type="checkbox"
              />
              <label for="lodging-active">Ativo</label>
            </div>
            <div>
              <label class="block text-sm mb-1" for="lodging-images"
                >Imagens (múltiplas)</label
              >
              <input
                id="lodging-images"
                type="file"
                multiple
                accept="image/*"
                @change="onNewImagesChange"
              />
              <div
                v-if="newLodging.images?.length"
                class="mt-2 grid grid-cols-4 gap-2"
              >
                <div
                  v-for="(img, idx) in newLodging.images"
                  :key="idx"
                  class="relative"
                >
                  <img
                    class="w-full h-20 object-cover rounded border"
                    :src="toDataUrl(img)"
                    alt="Prévia"
                  />
                  <button
                    class="absolute top-1 right-1 bg-white/80 border rounded px-2 py-0.5 text-xs"
                    @click="removeNewImage(idx)"
                  >
                    Remover
                  </button>
                </div>
              </div>
            </div>
            <div class="flex gap-2">
              <button class="btn btn-primary" @click="createLodging">
                Salvar
              </button>
              <button class="btn btn-outline" @click="resetForm">Limpar</button>
            </div>
          </div>
        </div>

        <!-- Lista / edição -->
        <div class="lg:col-span-2 card p-4 border shadow-sm">
          <h2 class="text-lg font-semibold mb-3">Lista de hospedagens</h2>
          <div class="space-y-3">
            <div
              v-for="l in lodgings"
              :key="l.id"
              class="border rounded p-3 space-y-3"
            >
              <div class="grid grid-cols-1 md:grid-cols-6 gap-3 items-center">
                <div class="md:col-span-3">
                  <div class="text-sm text-muted-foreground">Nome</div>
                  <div class="font-semibold">{{ l.name }}</div>
                  <div
                    v-if="l.description"
                    class="text-xs text-muted-foreground mt-1"
                  >
                    {{ l.description }}
                  </div>
                </div>
                <div>
                  <div class="text-sm text-muted-foreground">Pessoas/Apto</div>
                  <div class="font-semibold">{{ l.pax_per_apartment }}</div>
                </div>
                <div>
                  <div class="text-sm text-muted-foreground">Preço/Apto</div>
                  <div class="font-semibold">{{ l.price_per_apartment }}</div>
                </div>
                <div class="md:col-span-1">
                  <span
                    :class="
                      l.active
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                        : 'bg-red-100 text-red-700 border-red-200'
                    "
                    class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border"
                  >
                    <span
                      :class="l.active ? 'bg-emerald-500' : 'bg-red-500'"
                      class="w-2 h-2 rounded-full"
                    ></span>
                    {{ l.active ? "Ativo" : "Inativo" }}
                  </span>
                </div>
              </div>
              <div v-if="(l.images || []).length" class="mt-2">
                <div class="text-xs text-muted-foreground mb-1">Imagens</div>
                <div class="grid grid-cols-6 gap-2">
                  <img
                    v-for="(img, idx) in (l.images || []).slice(0, 6)"
                    :key="idx"
                    :src="toDataUrl(img)"
                    alt="Imagem"
                    class="w-full h-16 object-cover rounded border"
                  />
                </div>
                <div
                  v-if="(l.images || []).length > 6"
                  class="text-xs text-muted-foreground mt-1"
                >
                  +{{ (l.images || []).length - 6 }} mais
                </div>
              </div>
              <div class="flex gap-2 justify-end">
                <button class="btn btn-primary" @click="openEdit(l)">
                  Editar
                </button>
                <button class="btn btn-danger" @click="removeLodging(l.id)">
                  Excluir
                </button>
              </div>
            </div>
            <p v-if="!lodgings.length" class="text-sm text-muted-foreground">
              Nenhuma hospedagem cadastrada.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
  <Teleport to="body">
    <div v-if="editOpen" class="fixed inset-0 z-[100]">
      <div class="absolute inset-0 bg-black/40" @click="editOpen = false"></div>
      <div class="absolute inset-0 flex items-center justify-center p-4">
        <div
          class="bg-white rounded-xl shadow-large w-full max-w-xl border border-gray-200"
        >
          <div class="p-6 space-y-3">
            <h3 class="text-lg font-semibold">Editar hospedagem</h3>
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
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm mb-1">Pessoas/Apto</label>
                <input
                  v-model.number="editForm.pax_per_apartment"
                  type="number"
                  min="1"
                  class="w-full h-10 border rounded px-3"
                />
              </div>
              <div>
                <label class="block text-sm mb-1">Preço/Apto</label>
                <input
                  v-model.number="editForm.price_per_apartment"
                  type="number"
                  min="0"
                  step="0.01"
                  class="w-full h-10 border rounded px-3"
                />
              </div>
            </div>
            <label class="inline-flex items-center gap-2 text-sm">
              <input v-model="editForm.active" type="checkbox" /> Ativo
            </label>
            <div>
              <label class="block text-sm mb-1">Imagens</label>
              <input
                type="file"
                multiple
                accept="image/*"
                @change="onEditImagesAdd($event)"
              />
              <div class="grid grid-cols-6 gap-2 mt-2">
                <div
                  v-for="(img, idx) in editForm.images"
                  :key="idx"
                  class="relative"
                >
                  <img
                    :src="toDataUrl(img)"
                    class="w-full h-20 object-cover rounded border"
                  />
                  <button
                    class="absolute top-1 right-1 bg-white/80 border rounded px-2 py-0.5 text-xs"
                    @click="removeEditImage(idx)"
                  >
                    Remover
                  </button>
                </div>
              </div>
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
import { useToastStore } from "@/stores/toast";
import {
  fetchLodgings,
  fetchLodgingsAdmin,
  insertLodging,
  updateLodging,
  deleteLodging,
  type LodgingRow,
} from "@/services/supabase";

const toast = useToastStore();
const lodgings = ref<LodgingRow[]>([]);

const newLodging = ref({
  name: "",
  description: "",
  pax_per_apartment: 2,
  price_per_apartment: 0,
  active: true,
  images: [] as string[],
});

async function load() {
  try {
    lodgings.value = await fetchLodgingsAdmin();
  } catch (err) {
    console.error("[Admin LODGINGS] erro ao listar", err);
    toast.error("Falha ao carregar hospedagens");
  }
}

async function createLodging() {
  try {
    const [created] = await insertLodging(newLodging.value);
    if (created) {
      toast.success("Hospedagem criada");
      resetForm();
      await load();
    }
  } catch (err) {
    console.error("[Admin LODGINGS] erro ao criar", err);
    toast.error("Falha ao criar hospedagem");
  }
}

function resetForm() {
  newLodging.value = {
    name: "",
    description: "",
    pax_per_apartment: 2,
    price_per_apartment: 0,
    active: true,
    images: [],
  };
}

async function saveLodging(l: LodgingRow) {
  try {
    await updateLodging(l.id, {
      name: l.name,
      pax_per_apartment: l.pax_per_apartment,
      price_per_apartment: l.price_per_apartment,
      active: l.active,
      images: l.images || [],
    });
    toast.success("Hospedagem atualizada");
    await load();
  } catch (err) {
    console.error("[Admin LODGINGS] erro ao atualizar", err);
    toast.error("Falha ao atualizar hospedagem");
  }
}

async function removeLodging(id: string) {
  if (!confirm("Excluir hospedagem?")) return;
  try {
    await deleteLodging(id);
    toast.success("Hospedagem excluída");
    await load();
  } catch (err) {
    console.error("[Admin LODGINGS] erro ao excluir", err);
    toast.error("Falha ao excluir hospedagem");
  }
}

onMounted(load);

function toDataUrl(base64: string) {
  return `data:image/*;base64,${base64}`;
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result as string;
      const commaIdx = res.indexOf(",");
      // remove prefix if present (data:image/...;base64,)
      resolve(commaIdx >= 0 ? res.slice(commaIdx + 1) : res);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function onNewImagesChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const files = Array.from(input.files || []);
  const base64s = await Promise.all(files.map((f) => fileToBase64(f)));
  newLodging.value.images = [...(newLodging.value.images || []), ...base64s];
  input.value = "";
}

function removeNewImage(idx: number) {
  newLodging.value.images?.splice(idx, 1);
}

// Edição via modal
const editOpen = ref(false);
const editTarget = ref<LodgingRow | null>(null);
const editForm = ref({
  name: "",
  description: "",
  pax_per_apartment: 2,
  price_per_apartment: 0,
  active: true,
  images: [] as string[],
});

function openEdit(l: LodgingRow) {
  editTarget.value = l;
  editForm.value = {
    name: l.name,
    description: l.description || "",
    pax_per_apartment: l.pax_per_apartment,
    price_per_apartment: l.price_per_apartment,
    active: l.active,
    images: [...(l.images || [])],
  };
  editOpen.value = true;
}

async function onEditImagesAdd(e: Event) {
  const input = e.target as HTMLInputElement;
  const files = Array.from(input.files || []);
  const base64s = await Promise.all(files.map((f) => fileToBase64(f)));
  editForm.value.images = [...editForm.value.images, ...base64s];
  input.value = "";
}

function removeEditImage(idx: number) {
  editForm.value.images.splice(idx, 1);
}

async function saveEdit() {
  if (!editTarget.value) return;
  try {
    await updateLodging(editTarget.value.id, {
      name: editForm.value.name,
      description: editForm.value.description || null,
      pax_per_apartment: editForm.value.pax_per_apartment,
      price_per_apartment: editForm.value.price_per_apartment,
      active: editForm.value.active,
      images: editForm.value.images,
    });
    toast.success("Hospedagem atualizada");
    editOpen.value = false;
    editTarget.value = null;
    await load();
  } catch (err) {
    console.error("[Admin LODGINGS] erro ao atualizar", err);
    toast.error("Falha ao atualizar hospedagem");
  }
}
</script>
