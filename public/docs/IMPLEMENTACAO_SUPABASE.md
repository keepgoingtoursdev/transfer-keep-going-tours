# Implementação de Autenticação com Supabase

## 1. Configuração Inicial do Supabase

### 1.1 Criação do Projeto
1. Acesse [supabase.com](https://supabase.com)
2. Crie uma nova conta ou faça login
3. Clique em "New Project"
4. Configure:
   - Nome: "santos-transfer"
   - Organização: Sua organização
   - Região: South America (São Paulo)
   - Senha do banco: Gere uma senha segura

### 1.2 Configuração de Email
```sql
-- No SQL Editor do Supabase, configure templates de email
UPDATE auth.config 
SET 
  site_url = 'https://seudominio.com',
  email_confirm_url = 'https://seudominio.com/confirm-email',
  email_reset_url = 'https://seudominio.com/reset-password';
```

### 1.3 Variáveis de Ambiente
```env
# .env.local
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

## 2. Instalação e Configuração no Vue.js

### 2.1 Instalação de Dependências
```bash
npm install @supabase/supabase-js @vueuse/core zod
```

### 2.2 Configuração do Cliente Supabase
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos TypeScript
export interface Profile {
  id: string
  email: string
  name: string
  phone?: string
  role: 'user' | 'admin'
  created_at: string
  email_confirmed: boolean
}

export interface AuthUser {
  id: string
  email: string
  email_confirmed_at?: string
  user_metadata: {
    name?: string
    phone?: string
  }
}
```

### 2.3 Store de Autenticação (Pinia)
```typescript
// src/stores/auth.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, type Profile, type AuthUser } from '@/lib/supabase'
import { useRouter } from 'vue-router'
import { useToast } from '@/stores/toast'

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  const toast = useToast()
  
  // State
  const user = ref<AuthUser | null>(null)
  const profile = ref<Profile | null>(null)
  const loading = ref(false)
  const initialized = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => profile.value?.role === 'admin')
  const isEmailConfirmed = computed(() => !!user.value?.email_confirmed_at)

  // Actions
  async function initialize() {
    try {
      loading.value = true
      
      // Verificar sessão atual
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        user.value = session.user as AuthUser
        await loadProfile()
      }

      // Escutar mudanças de autenticação
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          user.value = session.user as AuthUser
          await loadProfile()
          toast.success('Login realizado com sucesso!')
        } else if (event === 'SIGNED_OUT') {
          user.value = null
          profile.value = null
          toast.info('Logout realizado com sucesso!')
        }
      })
      
      initialized.value = true
    } catch (error) {
      console.error('Erro ao inicializar auth:', error)
      toast.error('Erro ao inicializar autenticação')
    } finally {
      loading.value = false
    }
  }

  async function loadProfile() {
    if (!user.value) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.value.id)
        .single()

      if (error) throw error
      profile.value = data
    } catch (error) {
      console.error('Erro ao carregar perfil:', error)
    }
  }

  async function signUp(email: string, password: string, name: string, phone?: string) {
    try {
      loading.value = true
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone
          }
        }
      })

      if (error) throw error

      toast.success('Cadastro realizado! Verifique seu email para confirmar a conta.')
      return { success: true, data }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao realizar cadastro')
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  async function signIn(email: string, password: string) {
    try {
      loading.value = true
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      if (!data.user?.email_confirmed_at) {
        toast.warning('Por favor, confirme seu email antes de fazer login.')
        await signOut()
        return { success: false, error: 'Email não confirmado' }
      }

      router.push('/')
      return { success: true, data }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao fazer login')
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  async function signOut() {
    try {
      loading.value = true
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      router.push('/')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao fazer logout')
    } finally {
      loading.value = false
    }
  }

  async function resetPassword(email: string) {
    try {
      loading.value = true
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) throw error

      toast.success('Email de recuperação enviado! Verifique sua caixa de entrada.')
      return { success: true }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar email de recuperação')
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  async function updatePassword(newPassword: string) {
    try {
      loading.value = true
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      toast.success('Senha atualizada com sucesso!')
      router.push('/')
      return { success: true }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar senha')
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  async function updateProfile(updates: Partial<Profile>) {
    try {
      loading.value = true
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.value?.id)

      if (error) throw error

      // Atualizar estado local
      if (profile.value) {
        profile.value = { ...profile.value, ...updates }
      }

      toast.success('Perfil atualizado com sucesso!')
      return { success: true }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar perfil')
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    user: readonly(user),
    profile: readonly(profile),
    loading: readonly(loading),
    initialized: readonly(initialized),
    
    // Getters
    isAuthenticated,
    isAdmin,
    isEmailConfirmed,
    
    // Actions
    initialize,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile
  }
})
```

## 3. Estrutura do Banco de Dados

### 3.1 Tabela de Perfis
```sql
-- Criar tabela de perfis
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Usuários podem ver próprio perfil" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar próprio perfil" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins podem ver todos os perfis" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
```

## 4. Componentes de Interface

### 4.1 Página de Login
```vue
<!-- src/pages/Login.vue -->
<template>
  <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Faça login em sua conta
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Ou
          <router-link to="/register" class="font-medium text-primary hover:text-primary/80">
            crie uma nova conta
          </router-link>
        </p>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              :class="{ 'border-red-500': errors.email }"
            />
            <p v-if="errors.email" class="mt-1 text-sm text-red-600">
              {{ errors.email }}
            </p>
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Senha
            </label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              :class="{ 'border-red-500': errors.password }"
            />
            <p v-if="errors.password" class="mt-1 text-sm text-red-600">
              {{ errors.password }}
            </p>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <router-link 
            to="/forgot-password" 
            class="text-sm text-primary hover:text-primary/80"
          >
            Esqueceu sua senha?
          </router-link>
        </div>

        <button
          type="submit"
          :disabled="authStore.loading"
          class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
        >
          <span v-if="authStore.loading">Entrando...</span>
          <span v-else>Entrar</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { z } from 'zod'

const authStore = useAuthStore()

const form = reactive({
  email: '',
  password: ''
})

const errors = ref<Record<string, string>>({})

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres')
})

async function handleSubmit() {
  try {
    // Validar formulário
    loginSchema.parse(form)
    errors.value = {}
    
    // Fazer login
    await authStore.signIn(form.email, form.password)
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.value = error.flatten().fieldErrors
    }
  }
}
</script>
```

### 4.2 Página de Cadastro
```vue
<!-- src/pages/Register.vue -->
<template>
  <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Crie sua conta
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Ou
          <router-link to="/login" class="font-medium text-primary hover:text-primary/80">
            faça login em sua conta existente
          </router-link>
        </p>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">
              Nome completo
            </label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              :class="{ 'border-red-500': errors.name }"
            />
            <p v-if="errors.name" class="mt-1 text-sm text-red-600">
              {{ errors.name }}
            </p>
          </div>
          
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              :class="{ 'border-red-500': errors.email }"
            />
            <p v-if="errors.email" class="mt-1 text-sm text-red-600">
              {{ errors.email }}
            </p>
          </div>
          
          <div>
            <label for="phone" class="block text-sm font-medium text-gray-700">
              Telefone (opcional)
            </label>
            <input
              id="phone"
              v-model="form.phone"
              type="tel"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              :class="{ 'border-red-500': errors.phone }"
            />
            <p v-if="errors.phone" class="mt-1 text-sm text-red-600">
              {{ errors.phone }}
            </p>
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Senha
            </label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              :class="{ 'border-red-500': errors.password }"
            />
            <p v-if="errors.password" class="mt-1 text-sm text-red-600">
              {{ errors.password }}
            </p>
          </div>
          
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
              Confirmar senha
            </label>
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              type="password"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              :class="{ 'border-red-500': errors.confirmPassword }"
            />
            <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">
              {{ errors.confirmPassword }}
            </p>
          </div>
        </div>

        <button
          type="submit"
          :disabled="authStore.loading"
          class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
        >
          <span v-if="authStore.loading">Criando conta...</span>
          <span v-else>Criar conta</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { z } from 'zod'

const authStore = useAuthStore()
const router = useRouter()

const form = reactive({
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: ''
})

const errors = ref<Record<string, string>>({})

const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"]
})

async function handleSubmit() {
  try {
    // Validar formulário
    registerSchema.parse(form)
    errors.value = {}
    
    // Criar conta
    const result = await authStore.signUp(
      form.email, 
      form.password, 
      form.name, 
      form.phone || undefined
    )
    
    if (result.success) {
      router.push('/login')
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.value = error.flatten().fieldErrors
    }
  }
}
</script>
```

## 5. Guards de Rota

### 5.1 Middleware de Autenticação
```typescript
// src/router/guards.ts
import { useAuthStore } from '@/stores/auth'
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'

export async function authGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const authStore = useAuthStore()
  
  // Aguardar inicialização se necessário
  if (!authStore.initialized) {
    await authStore.initialize()
  }
  
  if (!authStore.isAuthenticated) {
    next('/login')
    return
  }
  
  next()
}

export async function adminGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const authStore = useAuthStore()
  
  if (!authStore.initialized) {
    await authStore.initialize()
  }
  
  if (!authStore.isAuthenticated) {
    next('/login')
    return
  }
  
  if (!authStore.isAdmin) {
    next('/')
    return
  }
  
  next()
}

export async function guestGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const authStore = useAuthStore()
  
  if (!authStore.initialized) {
    await authStore.initialize()
  }
  
  if (authStore.isAuthenticated) {
    next('/')
    return
  }
  
  next()
}
```

### 5.2 Atualização do Router
```typescript
// src/router/index.ts
import { createRouter, createWebHistory } from "vue-router";
import { authGuard, adminGuard, guestGuard } from './guards'

// Páginas existentes
import Home from "@/pages/Home.vue";
import Servicos from "@/pages/Servicos.vue";
import Calculadora from "@/pages/Calculadora.vue";
import Contato from "@/pages/Contato.vue";
import NotFound from "@/pages/NotFound.vue";

// Novas páginas de auth
import Login from "@/pages/Login.vue";
import Register from "@/pages/Register.vue";
import ForgotPassword from "@/pages/ForgotPassword.vue";
import ResetPassword from "@/pages/ResetPassword.vue";
import Profile from "@/pages/Profile.vue";

// Páginas admin
import AdminDashboard from "@/pages/admin/Dashboard.vue";
import AdminRoutes from "@/pages/admin/Routes.vue";
import AdminSpecialDates from "@/pages/admin/SpecialDates.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Rotas públicas
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
    
    // Rotas de autenticação (apenas para não logados)
    {
      path: "/login",
      name: "login",
      component: Login,
      beforeEnter: guestGuard
    },
    {
      path: "/register",
      name: "register",
      component: Register,
      beforeEnter: guestGuard
    },
    {
      path: "/forgot-password",
      name: "forgot-password",
      component: ForgotPassword,
      beforeEnter: guestGuard
    },
    {
      path: "/reset-password",
      name: "reset-password",
      component: ResetPassword,
      beforeEnter: guestGuard
    },
    
    // Rotas protegidas (apenas para logados)
    {
      path: "/profile",
      name: "profile",
      component: Profile,
      beforeEnter: authGuard
    },
    
    // Rotas administrativas (apenas para admins)
    {
      path: "/admin",
      redirect: "/admin/dashboard"
    },
    {
      path: "/admin/dashboard",
      name: "admin-dashboard",
      component: AdminDashboard,
      beforeEnter: adminGuard
    },
    {
      path: "/admin/routes",
      name: "admin-routes",
      component: AdminRoutes,
      beforeEnter: adminGuard
    },
    {
      path: "/admin/special-dates",
      name: "admin-special-dates",
      component: AdminSpecialDates,
      beforeEnter: adminGuard
    },
    
    // 404
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: NotFound,
    },
  ],
});

export default router;
```

## 6. Configuração de Email Templates

### 6.1 Template de Confirmação
No painel do Supabase, vá em Authentication > Email Templates e configure:

```html
<!-- Confirm signup -->
<h2>Confirme seu email</h2>
<p>Olá!</p>
<p>Clique no link abaixo para confirmar seu email:</p>
<p><a href="{{ .ConfirmationURL }}">Confirmar email</a></p>
<p>Se você não criou uma conta, pode ignorar este email.</p>
```

### 6.2 Template de Recuperação de Senha
```html
<!-- Reset password -->
<h2>Redefinir senha</h2>
<p>Olá!</p>
<p>Clique no link abaixo para redefinir sua senha:</p>
<p><a href="{{ .ConfirmationURL }}">Redefinir senha</a></p>
<p>Se você não solicitou a redefinição, pode ignorar este email.</p>
```

## 7. Inicialização da Aplicação

### 7.1 Atualização do main.ts
```typescript
// src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
import './style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Inicializar autenticação
const authStore = useAuthStore()
authStore.initialize()

app.mount('#app')
```

## 8. Testes

### 8.1 Testes da Store de Auth
```typescript
// src/stores/__tests__/auth.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../auth'

// Mock do Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn()
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn()
        }))
      }))
    }))
  }
}))

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize correctly', () => {
    const authStore = useAuthStore()
    
    expect(authStore.user).toBeNull()
    expect(authStore.profile).toBeNull()
    expect(authStore.isAuthenticated).toBe(false)
    expect(authStore.loading).toBe(false)
  })

  // Adicionar mais testes...
})
```

## 9. Checklist de Implementação

### 9.1 Configuração Inicial
- [ ] Criar projeto no Supabase
- [ ] Configurar variáveis de ambiente
- [ ] Instalar dependências
- [ ] Configurar cliente Supabase

### 9.2 Banco de Dados
- [ ] Criar tabela profiles
- [ ] Configurar RLS policies
- [ ] Criar triggers
- [ ] Testar inserção automática de perfil

### 9.3 Autenticação
- [ ] Implementar store de auth
- [ ] Criar páginas de login/registro
- [ ] Implementar guards de rota
- [ ] Configurar templates de email

### 9.4 Interface
- [ ] Atualizar navbar com botões de auth
- [ ] Criar página de perfil
- [ ] Implementar logout
- [ ] Adicionar indicadores de loading

### 9.5 Testes
- [ ] Testar fluxo de cadastro
- [ ] Testar confirmação por email
- [ ] Testar login/logout
- [ ] Testar recuperação de senha
- [ ] Testar guards de rota

Este documento fornece uma implementação completa da autenticação com Supabase, incluindo confirmação por email e todas as funcionalidades necessárias para o sistema.