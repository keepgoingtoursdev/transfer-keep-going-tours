import { createRouter, createWebHistory } from "vue-router";
import Home from "@/pages/Home.vue";
import Servicos from "@/pages/Servicos.vue";
import Calculadora from "@/pages/Calculadora/index.vue";
import Contato from "@/pages/Contato.vue";
import NotFound from "@/pages/NotFound.vue";
import AdminConfigurations from "@/pages/admin/Configurations.vue";
import AdminZones from "@/pages/admin/Zones.vue";
import AdminServices from "@/pages/admin/Services.vue";
import AdminVehicles from "@/pages/admin/Vehicles.vue";
import AdminUsers from "@/pages/admin/Users.vue";
import AdminLodgings from "@/pages/admin/Lodgings.vue";
import Login from "@/pages/Login.vue";
import Cadastro from "@/pages/Cadastro.vue";
import ForgotPassword from "@/pages/ForgotPassword.vue";
import ResetPassword from "@/pages/ResetPassword.vue";

import { useAuthStore } from "@/stores/auth";
import { useToastStore } from "@/stores/toast";
import Profile from "@/pages/Profile.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: Home,
    },
    {
      path: "/servicos",
      name: "servicos",
      component: Servicos,
    },
    {
      path: "/calculadora",
      name: "calculadora",
      component: Calculadora,
    },
    {
      path: "/contato",
      name: "contato",
      component: Contato,
    },
    {
      path: "/admin/login",
      name: "login",
      component: Login,
    },
    {
      path: "/recuperar-senha",
      name: "recuperar-senha",
      component: ForgotPassword,
    },
    {
      path: "/redefinir-senha",
      name: "redefinir-senha",
      component: ResetPassword,
    },
    {
      path: "/cadastro",
      name: "cadastro",
      component: Cadastro,
    },
    {
      path: "/admin/configurations",
      name: "admin-configurations",
      component: AdminConfigurations,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: "/admin/zones",
      name: "admin-zones",
      component: AdminZones,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: "/admin/services",
      name: "admin-services",
      component: AdminServices,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: "/admin/vehicles",
      name: "admin-vehicles",
      component: AdminVehicles,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: "/admin/lodgings",
      name: "admin-lodgings",
      component: AdminLodgings,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: "/admin/users",
      name: "admin-users",
      component: AdminUsers,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: "/perfil",
      name: "perfil",
      component: Profile,
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: NotFound,
    },
  ],
});

export default router;

// Global guard for routes with requiresAuth
router.beforeEach(async (to) => {
  const requiresAuth = to.matched.some((r) => r.meta?.requiresAuth);
  const requiresAdmin = to.matched.some((r) => (r.meta as any)?.requiresAdmin);
  if (!requiresAuth) return true;
  const auth = useAuthStore();
  const toast = useToastStore();
  await auth.loadSession();
  if (!auth.isAuthenticated) {
    toast.warning("Sessão expirada ou não autenticado. Faça login.");
    return { path: "/admin/login", query: { redirect: to.fullPath } };
  }
  if (requiresAdmin && !auth.isAdmin) {
    toast.error("Acesso restrito a administradores.");
    return { path: "/" };
  }
  return true;
});
