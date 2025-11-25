<template>
  <div class="min-h-screen pt-32 pb-20 px-4">
    <div class="container mx-auto max-w-5xl">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold">Gerenciar Usuários</h1>
        <button class="btn btn-outline btn-sm" @click="fetch">
          Recarregar
        </button>
      </div>
      <div class="card p-6 shadow-medium space-y-6">
        <div class="overflow-x-auto rounded-lg border border-border">
          <table class="min-w-full divide-y divide-border">
            <thead class="bg-muted/30">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-semibold">Nome</th>
                <th class="px-4 py-3 text-left text-sm font-semibold">Email</th>
                <th class="px-4 py-3 text-left text-sm font-semibold">Roles</th>
                <th class="px-4 py-3 text-right text-sm font-semibold">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr v-for="u in users" :key="u.id">
                <td class="px-4 py-3">{{ u.name || "—" }}</td>
                <td class="px-4 py-3">{{ u.email || "—" }}</td>
                <td class="px-4 py-3">
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="r in u.roles || []"
                      :key="r"
                      class="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-semibold border border-primary/20"
                    >
                      {{ r }}
                    </span>
                    <span
                      v-if="!u.roles || u.roles.length === 0"
                      class="text-muted-foreground text-sm"
                      >user</span
                    >
                  </div>
                </td>
                <td class="px-4 py-3 text-right">
                  <div class="inline-flex gap-2">
                    <button
                      v-if="!u.roles || !u.roles.includes('admin')"
                      class="btn btn-outline btn-sm"
                      :disabled="loadingIds.has(u.id)"
                      @click="promote(u)"
                    >
                      Promover a Admin
                    </button>
                    <button
                      class="btn btn-outline btn-sm"
                      :disabled="loadingIds.has(u.id)"
                      @click="demote(u)"
                    >
                      Remover Admin
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  listUsers,
  promoteToAdmin,
  demoteFromAdmin,
  type AdminUser,
} from "@/services/admin";
import { useToastStore } from "@/stores/toast";

const users = ref<AdminUser[]>([]);
const loadingIds = new Set<string>();
const toast = useToastStore();

async function fetch() {
  try {
    users.value = await listUsers();
  } catch (e: any) {
    toast.error(
      "Falha ao carregar usuários: " + (e?.message || "erro desconhecido"),
    );
  }
}

async function promote(u: AdminUser) {
  try {
    loadingIds.add(u.id);
    await promoteToAdmin(u);
    toast.success("Usuário promovido a admin.");
    await fetch();
  } catch (e: any) {
    toast.error(
      "Não foi possível promover: " + (e?.message || "erro desconhecido"),
    );
  } finally {
    loadingIds.delete(u.id);
  }
}

async function demote(u: AdminUser) {
  try {
    loadingIds.add(u.id);
    await demoteFromAdmin(u);
    toast.success("Admin removido do usuário.");
    await fetch();
  } catch (e: any) {
    toast.error(
      "Não foi possível rebaixar: " + (e?.message || "erro desconhecido"),
    );
  } finally {
    loadingIds.delete(u.id);
  }
}

onMounted(fetch);
</script>
