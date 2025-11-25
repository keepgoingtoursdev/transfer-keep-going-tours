<template>
  <nav
    class="fixed top-0 w-full z-50 bg-white border-b border-border shadow-medium"
  >
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-20">
        <router-link to="/" class="flex items-center gap-2 group">
          <div class="p-2.5 rounded-xl transition-smooth group-hover:scale-105">
            <img
              src="/images/Logo_KG.png"
              alt="Transfer Cruzeiros Santos"
              class="h-12 w-auto"
            />
          </div>
        </router-link>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center gap-8">
          <router-link to="/" class="nav-link"> Home </router-link>
          <!--  <router-link to="/calculadora" class="nav-link">
            Calculadora
          </router-link> -->
          <router-link to="/contato" class="nav-link"> Contato </router-link>
          <!-- Admin Links (visíveis apenas para administradores) -->
          <div
            v-if="auth.isAdmin"
            class="flex items-center gap-6 pl-6 border-l border-border"
          >
            <router-link to="/admin/configurations" class="nav-link">
              Configurações
            </router-link>
            <router-link to="/admin/zones" class="nav-link">
              Zonas
            </router-link>
            <!--  <router-link to="/admin/services" class="nav-link">
              Serviços
            </router-link> -->
            <router-link to="/admin/vehicles" class="nav-link">
              Veículos
            </router-link>
            <router-link to="/admin/lodgings" class="nav-link">
              Hospedagens
            </router-link>
            <router-link to="/admin/users" class="nav-link">
              Usuários
            </router-link>
          </div>
          <!-- Auth Links -->
          <div class="flex items-center gap-4">
            <template v-if="auth.isAuthenticated">
              <router-link
                to="/perfil"
                class="text-sm text-muted-foreground hover:text-foreground"
              >
                <span class="inline-flex items-center gap-2">
                  <span>
                    {{
                      auth.profile?.name
                        ? auth.profile?.name +
                          " (" +
                          (auth.profile?.email || auth.user?.email) +
                          ")"
                        : auth.profile?.email ||
                          auth.user?.email ||
                          "Minha conta"
                    }}
                  </span>
                  <span
                    v-if="auth.isAdmin"
                    class="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-semibold border border-primary/20"
                  >
                    Admin
                  </span>
                </span>
              </router-link>
              <button class="btn btn-outline btn-sm" @click="handleSignOut">
                Sair
              </button>
            </template>
            <template v-if="auth.isAdmin">
              <router-link to="/cadastro" class="btn btn-outline btn-sm"
                >Criar conta</router-link
              >
            </template>
          </div>
        </div>

        <!-- Mobile Menu Button -->
        <button
          class="md:hidden p-2"
          aria-label="Toggle menu"
          @click="isOpen = !isOpen"
        >
          <X v-if="isOpen" class="h-6 w-6" />
          <Menu v-else class="h-6 w-6" />
        </button>
      </div>

      <!-- Mobile Navigation -->
      <div
        v-if="isOpen"
        class="md:hidden py-4 space-y-4 bg-white rounded-xl shadow-medium border border-border px-3"
      >
        <router-link to="/" class="nav-link block" @click="isOpen = false">
          Home
        </router-link>

        <!--  <router-link
          to="/calculadora"
          class="nav-link block"
          @click="isOpen = false"
        >
          Calculadora
        </router-link> -->
        <router-link
          to="/contato"
          class="nav-link block"
          @click="isOpen = false"
        >
          Contato
        </router-link>
        <div class="flex items-center gap-4">
          <template v-if="auth.isAuthenticated">
            <!-- Admin Links (visíveis apenas para administradores) -->
            <div
              v-if="auth.isAdmin"
              class="space-y-2 pt-2 border-t border-border"
            >
              <router-link
                to="/admin/configurations"
                class="nav-link block"
                @click="isOpen = false"
              >
                Configurações
              </router-link>
              <router-link
                to="/admin/zones"
                class="nav-link block"
                @click="isOpen = false"
              >
                Zonas
              </router-link>
              <!--   <router-link
                to="/admin/services"
                class="nav-link block"
                @click="isOpen = false"
              >
                Serviços
              </router-link> -->
              <router-link
                to="/admin/vehicles"
                class="nav-link block"
                @click="isOpen = false"
              >
                Veículos
              </router-link>
              <router-link
                to="/admin/lodgings"
                class="nav-link block"
                @click="isOpen = false"
              >
                Hospedagens
              </router-link>
              <router-link
                to="/admin/users"
                class="nav-link block"
                @click="isOpen = false"
              >
                Usuários
              </router-link>
              <router-link
                to="/perfil"
                class="text-sm text-muted-foreground hover:text-foreground"
                @click="isOpen = false"
              >
                <span class="inline-flex items-center gap-2">
                  <span>
                    {{
                      auth.profile?.name
                        ? /* auth.profile?.name + */
                          " (" + (auth.profile?.email || auth.user?.email) + ")"
                        : auth.profile?.email ||
                          auth.user?.email ||
                          "Minha conta"
                    }}
                  </span>
                  <span
                    v-if="auth.isAdmin"
                    class="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-semibold border border-primary/20"
                  >
                    Admin
                  </span>
                </span>
              </router-link>
              <button
                class="btn btn-outline btn-sm w-full"
                @click="handleSignOut"
              >
                Sair
              </button>
            </div>
          </template>
          <template v-else>
            <router-link
              to="/admin/login"
              class="btn btn-outline btn-sm w-full"
              @click="isOpen = false"
              >Entrar</router-link
            >
            <router-link
              to="/cadastro"
              class="btn btn-outline btn-sm w-full"
              @click="isOpen = false"
              >Criar conta</router-link
            >
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { Ship, Menu, X } from "lucide-vue-next";

const isOpen = ref(false);
const auth = useAuthStore();
const router = useRouter();

const handleSignOut = async () => {
  await auth.signOut();
  router.push({ path: "/admin/login" });
};
</script>
