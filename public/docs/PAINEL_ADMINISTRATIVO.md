# Painel Administrativo - Transfer Cruzeiros Santos

## 1. Visão Geral

O painel administrativo permite que usuários com role 'admin' gerenciem:
- Rotas e preços base
- Datas especiais com multiplicadores de preço
- Histórico de cotações
- Gestão de usuários

## 2. Estrutura do Banco de Dados

### 2.1 Tabelas Principais

```sql
-- Rotas e preços base
CREATE TABLE price_routes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  vehicle_type TEXT NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Índices para performance
  UNIQUE(origin, destination, vehicle_type)
);

-- Datas especiais com multiplicadores
CREATE TABLE special_dates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  multiplier DECIMAL(3,2) NOT NULL CHECK (multiplier > 0),
  description TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Índices
  UNIQUE(date)
);

-- Histórico de cotações
CREATE TABLE quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT, -- Para usuários não logados
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  vehicle_type TEXT NOT NULL,
  passengers INTEGER NOT NULL,
  trip_type TEXT NOT NULL CHECK (trip_type IN ('oneway', 'roundtrip')),
  base_price DECIMAL(10,2) NOT NULL,
  multiplier DECIMAL(3,2) DEFAULT 1.0,
  final_price DECIMAL(10,2) NOT NULL,
  quote_date DATE NOT NULL,
  special_date_applied UUID REFERENCES special_dates(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Índices para relatórios
  INDEX idx_quotes_date (quote_date),
  INDEX idx_quotes_user (user_id),
  INDEX idx_quotes_route (origin, destination)
);

-- Logs de ações administrativas
CREATE TABLE admin_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES auth.users(id) NOT NULL,
  action TEXT NOT NULL, -- 'create', 'update', 'delete'
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2.2 Políticas de Segurança (RLS)

```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE price_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE special_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para price_routes
CREATE POLICY "Todos podem ler rotas ativas" ON price_routes
  FOR SELECT USING (active = true);

CREATE POLICY "Admins podem gerenciar rotas" ON price_routes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para special_dates
CREATE POLICY "Todos podem ler datas especiais ativas" ON special_dates
  FOR SELECT USING (active = true);

CREATE POLICY "Admins podem gerenciar datas especiais" ON special_dates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para quotes
CREATE POLICY "Usuários podem ver próprias cotações" ON quotes
  FOR SELECT USING (
    user_id = auth.uid() OR 
    (user_id IS NULL AND session_id IS NOT NULL)
  );

CREATE POLICY "Sistema pode inserir cotações" ON quotes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins podem ver todas as cotações" ON quotes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para admin_logs
CREATE POLICY "Admins podem ver logs" ON admin_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### 2.3 Triggers e Funções

```sql
-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_price_routes_updated_at
  BEFORE UPDATE ON price_routes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_special_dates_updated_at
  BEFORE UPDATE ON special_dates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para log de ações administrativas
CREATE OR REPLACE FUNCTION log_admin_action()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO admin_logs (admin_id, action, table_name, record_id, old_values)
    VALUES (auth.uid(), 'delete', TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO admin_logs (admin_id, action, table_name, record_id, old_values, new_values)
    VALUES (auth.uid(), 'update', TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO admin_logs (admin_id, action, table_name, record_id, new_values)
    VALUES (auth.uid(), 'create', TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers para auditoria
CREATE TRIGGER price_routes_audit
  AFTER INSERT OR UPDATE OR DELETE ON price_routes
  FOR EACH ROW EXECUTE FUNCTION log_admin_action();

CREATE TRIGGER special_dates_audit
  AFTER INSERT OR UPDATE OR DELETE ON special_dates
  FOR EACH ROW EXECUTE FUNCTION log_admin_action();
```

## 3. Stores Pinia para Administração

### 3.1 Store de Rotas e Preços

```typescript
// src/stores/admin/routes.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/stores/toast'

export interface PriceRoute {
  id: string
  origin: string
  destination: string
  vehicle_type: string
  base_price: number
  active: boolean
  created_at: string
  updated_at: string
  created_by?: string
}

export const useRoutesStore = defineStore('admin-routes', () => {
  const toast = useToast()
  
  // State
  const routes = ref<PriceRoute[]>([])
  const loading = ref(false)
  const searchTerm = ref('')
  const filterActive = ref<boolean | null>(null)

  // Getters
  const filteredRoutes = computed(() => {
    let filtered = routes.value

    if (searchTerm.value) {
      const term = searchTerm.value.toLowerCase()
      filtered = filtered.filter(route => 
        route.origin.toLowerCase().includes(term) ||
        route.destination.toLowerCase().includes(term) ||
        route.vehicle_type.toLowerCase().includes(term)
      )
    }

    if (filterActive.value !== null) {
      filtered = filtered.filter(route => route.active === filterActive.value)
    }

    return filtered.sort((a, b) => 
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )
  })

  const totalRoutes = computed(() => routes.value.length)
  const activeRoutes = computed(() => routes.value.filter(r => r.active).length)
  const inactiveRoutes = computed(() => routes.value.filter(r => !r.active).length)

  // Actions
  async function fetchRoutes() {
    try {
      loading.value = true
      
      const { data, error } = await supabase
        .from('price_routes')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) throw error
      
      routes.value = data || []
    } catch (error: any) {
      toast.error('Erro ao carregar rotas: ' + error.message)
    } finally {
      loading.value = false
    }
  }

  async function createRoute(route: Omit<PriceRoute, 'id' | 'created_at' | 'updated_at' | 'created_by'>) {
    try {
      loading.value = true
      
      const { data, error } = await supabase
        .from('price_routes')
        .insert([{
          ...route,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single()

      if (error) throw error
      
      routes.value.unshift(data)
      toast.success('Rota criada com sucesso!')
      
      return { success: true, data }
    } catch (error: any) {
      toast.error('Erro ao criar rota: ' + error.message)
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  async function updateRoute(id: string, updates: Partial<PriceRoute>) {
    try {
      loading.value = true
      
      const { data, error } = await supabase
        .from('price_routes')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      
      const index = routes.value.findIndex(r => r.id === id)
      if (index !== -1) {
        routes.value[index] = data
      }
      
      toast.success('Rota atualizada com sucesso!')
      return { success: true, data }
    } catch (error: any) {
      toast.error('Erro ao atualizar rota: ' + error.message)
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  async function deleteRoute(id: string) {
    try {
      loading.value = true
      
      const { error } = await supabase
        .from('price_routes')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      routes.value = routes.value.filter(r => r.id !== id)
      toast.success('Rota excluída com sucesso!')
      
      return { success: true }
    } catch (error: any) {
      toast.error('Erro ao excluir rota: ' + error.message)
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  async function toggleRouteStatus(id: string) {
    const route = routes.value.find(r => r.id === id)
    if (!route) return

    return await updateRoute(id, { active: !route.active })
  }

  return {
    // State
    routes: readonly(routes),
    loading: readonly(loading),
    searchTerm,
    filterActive,
    
    // Getters
    filteredRoutes,
    totalRoutes,
    activeRoutes,
    inactiveRoutes,
    
    // Actions
    fetchRoutes,
    createRoute,
    updateRoute,
    deleteRoute,
    toggleRouteStatus
  }
})
```

### 3.2 Store de Datas Especiais

```typescript
// src/stores/admin/specialDates.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/stores/toast'
import { format, isAfter, isBefore, startOfDay } from 'date-fns'

export interface SpecialDate {
  id: string
  date: string
  multiplier: number
  description: string
  active: boolean
  created_at: string
  updated_at: string
  created_by?: string
}

export const useSpecialDatesStore = defineStore('admin-special-dates', () => {
  const toast = useToast()
  
  // State
  const specialDates = ref<SpecialDate[]>([])
  const loading = ref(false)
  const searchTerm = ref('')
  const filterPeriod = ref<'all' | 'past' | 'future' | 'current'>('all')

  // Getters
  const filteredSpecialDates = computed(() => {
    let filtered = specialDates.value

    if (searchTerm.value) {
      const term = searchTerm.value.toLowerCase()
      filtered = filtered.filter(date => 
        date.description.toLowerCase().includes(term) ||
        date.date.includes(searchTerm.value)
      )
    }

    const today = startOfDay(new Date())
    
    switch (filterPeriod.value) {
      case 'past':
        filtered = filtered.filter(date => 
          isBefore(new Date(date.date), today)
        )
        break
      case 'future':
        filtered = filtered.filter(date => 
          isAfter(new Date(date.date), today)
        )
        break
      case 'current':
        filtered = filtered.filter(date => 
          format(new Date(date.date), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
        )
        break
    }

    return filtered.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  })

  const upcomingDates = computed(() => {
    const today = startOfDay(new Date())
    return specialDates.value
      .filter(date => 
        date.active && isAfter(new Date(date.date), today)
      )
      .sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      )
      .slice(0, 5)
  })

  // Actions
  async function fetchSpecialDates() {
    try {
      loading.value = true
      
      const { data, error } = await supabase
        .from('special_dates')
        .select('*')
        .order('date', { ascending: false })

      if (error) throw error
      
      specialDates.value = data || []
    } catch (error: any) {
      toast.error('Erro ao carregar datas especiais: ' + error.message)
    } finally {
      loading.value = false
    }
  }

  async function createSpecialDate(specialDate: Omit<SpecialDate, 'id' | 'created_at' | 'updated_at' | 'created_by'>) {
    try {
      loading.value = true
      
      const { data, error } = await supabase
        .from('special_dates')
        .insert([{
          ...specialDate,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single()

      if (error) throw error
      
      specialDates.value.unshift(data)
      toast.success('Data especial criada com sucesso!')
      
      return { success: true, data }
    } catch (error: any) {
      toast.error('Erro ao criar data especial: ' + error.message)
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  async function updateSpecialDate(id: string, updates: Partial<SpecialDate>) {
    try {
      loading.value = true
      
      const { data, error } = await supabase
        .from('special_dates')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      
      const index = specialDates.value.findIndex(d => d.id === id)
      if (index !== -1) {
        specialDates.value[index] = data
      }
      
      toast.success('Data especial atualizada com sucesso!')
      return { success: true, data }
    } catch (error: any) {
      toast.error('Erro ao atualizar data especial: ' + error.message)
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  async function deleteSpecialDate(id: string) {
    try {
      loading.value = true
      
      const { error } = await supabase
        .from('special_dates')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      specialDates.value = specialDates.value.filter(d => d.id !== id)
      toast.success('Data especial excluída com sucesso!')
      
      return { success: true }
    } catch (error: any) {
      toast.error('Erro ao excluir data especial: ' + error.message)
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  async function getMultiplierForDate(date: string): Promise<number> {
    const specialDate = specialDates.value.find(d => 
      d.date === date && d.active
    )
    return specialDate?.multiplier || 1.0
  }

  return {
    // State
    specialDates: readonly(specialDates),
    loading: readonly(loading),
    searchTerm,
    filterPeriod,
    
    // Getters
    filteredSpecialDates,
    upcomingDates,
    
    // Actions
    fetchSpecialDates,
    createSpecialDate,
    updateSpecialDate,
    deleteSpecialDate,
    getMultiplierForDate
  }
})
```

## 4. Componentes da Interface Administrativa

### 4.1 Dashboard Principal

```vue
<!-- src/pages/admin/Dashboard.vue -->
<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
        <p class="mt-2 text-gray-600">Gerencie rotas, preços e datas especiais</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <MapPin class="h-8 w-8 text-blue-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Rotas Ativas</p>
              <p class="text-2xl font-semibold text-gray-900">{{ routesStore.activeRoutes }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <Calendar class="h-8 w-8 text-green-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Datas Especiais</p>
              <p class="text-2xl font-semibold text-gray-900">{{ specialDatesStore.upcomingDates.length }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <Calculator class="h-8 w-8 text-purple-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Cotações Hoje</p>
              <p class="text-2xl font-semibold text-gray-900">{{ todayQuotes }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <Users class="h-8 w-8 text-orange-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Usuários Ativos</p>
              <p class="text-2xl font-semibold text-gray-900">{{ activeUsers }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Próximas Datas Especiais -->
        <div class="bg-white rounded-lg shadow">
          <div class="p-6 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Próximas Datas Especiais</h3>
          </div>
          <div class="p-6">
            <div v-if="specialDatesStore.upcomingDates.length === 0" class="text-gray-500 text-center py-4">
              Nenhuma data especial cadastrada
            </div>
            <div v-else class="space-y-4">
              <div 
                v-for="date in specialDatesStore.upcomingDates" 
                :key="date.id"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p class="font-medium text-gray-900">{{ date.description }}</p>
                  <p class="text-sm text-gray-500">{{ formatDate(date.date) }}</p>
                </div>
                <div class="text-right">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    +{{ Math.round((date.multiplier - 1) * 100) }}%
                  </span>
                </div>
              </div>
            </div>
            <div class="mt-4">
              <router-link 
                to="/admin/special-dates" 
                class="text-sm text-blue-600 hover:text-blue-500"
              >
                Ver todas as datas especiais →
              </router-link>
            </div>
          </div>
        </div>

        <!-- Ações Rápidas -->
        <div class="bg-white rounded-lg shadow">
          <div class="p-6 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Ações Rápidas</h3>
          </div>
          <div class="p-6">
            <div class="space-y-4">
              <router-link 
                to="/admin/routes" 
                class="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <MapPin class="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p class="font-medium text-gray-900">Gerenciar Rotas</p>
                  <p class="text-sm text-gray-500">Adicionar ou editar rotas e preços</p>
                </div>
              </router-link>

              <router-link 
                to="/admin/special-dates" 
                class="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Calendar class="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p class="font-medium text-gray-900">Datas Especiais</p>
                  <p class="text-sm text-gray-500">Configurar multiplicadores de preço</p>
                </div>
              </router-link>

              <button 
                @click="exportData"
                class="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors w-full text-left"
              >
                <Download class="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p class="font-medium text-gray-900">Exportar Dados</p>
                  <p class="text-sm text-gray-500">Baixar relatórios em CSV</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="bg-white rounded-lg shadow">
        <div class="p-6 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Atividade Recente</h3>
        </div>
        <div class="p-6">
          <div v-if="recentActivity.length === 0" class="text-gray-500 text-center py-4">
            Nenhuma atividade recente
          </div>
          <div v-else class="space-y-4">
            <div 
              v-for="activity in recentActivity" 
              :key="activity.id"
              class="flex items-start space-x-3"
            >
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Activity class="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm text-gray-900">{{ activity.description }}</p>
                <p class="text-xs text-gray-500">{{ formatDateTime(activity.created_at) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoutesStore } from '@/stores/admin/routes'
import { useSpecialDatesStore } from '@/stores/admin/specialDates'
import { MapPin, Calendar, Calculator, Users, Download, Activity } from 'lucide-vue-next'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const routesStore = useRoutesStore()
const specialDatesStore = useSpecialDatesStore()

const todayQuotes = ref(0)
const activeUsers = ref(0)
const recentActivity = ref([])

onMounted(async () => {
  await Promise.all([
    routesStore.fetchRoutes(),
    specialDatesStore.fetchSpecialDates(),
    loadDashboardStats()
  ])
})

async function loadDashboardStats() {
  // Implementar carregamento de estatísticas
  // todayQuotes.value = await fetchTodayQuotes()
  // activeUsers.value = await fetchActiveUsers()
  // recentActivity.value = await fetchRecentActivity()
}

function formatDate(date: string) {
  return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR })
}

function formatDateTime(date: string) {
  return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: ptBR })
}

async function exportData() {
  // Implementar exportação de dados
  console.log('Exportando dados...')
}
</script>
```

### 4.2 Gestão de Rotas e Preços

```vue
<!-- src/pages/admin/Routes.vue -->
<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8 flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Gestão de Rotas</h1>
          <p class="mt-2 text-gray-600">Gerencie rotas e preços base</p>
        </div>
        <button
          @click="showCreateModal = true"
          class="btn btn-primary"
        >
          <Plus class="h-5 w-5 mr-2" />
          Nova Rota
        </button>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow mb-6 p-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <input
              v-model="routesStore.searchTerm"
              type="text"
              placeholder="Origem, destino ou veículo..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              v-model="routesStore.filterActive"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option :value="null">Todos</option>
              <option :value="true">Ativas</option>
              <option :value="false">Inativas</option>
            </select>
          </div>
          <div class="flex items-end">
            <button
              @click="routesStore.fetchRoutes()"
              class="btn btn-outline w-full"
            >
              <RefreshCw class="h-4 w-4 mr-2" />
              Atualizar
            </button>
          </div>
        </div>
      </div>

      <!-- Routes Table -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">
            Rotas ({{ routesStore.filteredRoutes.length }})
          </h3>
        </div>
        
        <div v-if="routesStore.loading" class="p-8 text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-2 text-gray-500">Carregando rotas...</p>
        </div>

        <div v-else-if="routesStore.filteredRoutes.length === 0" class="p-8 text-center text-gray-500">
          Nenhuma rota encontrada
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rota
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Veículo
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preço Base
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Atualizado
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="route in routesStore.filteredRoutes" :key="route.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div class="text-sm font-medium text-gray-900">
                      {{ route.origin }}
                    </div>
                    <div class="text-sm text-gray-500">
                      → {{ route.destination }}
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ route.vehicle_type }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  R$ {{ route.base_price.toFixed(2) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    :class="[
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      route.active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    ]"
                  >
                    {{ route.active ? 'Ativa' : 'Inativa' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(route.updated_at) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex justify-end space-x-2">
                    <button
                      @click="editRoute(route)"
                      class="text-blue-600 hover:text-blue-900"
                    >
                      <Edit class="h-4 w-4" />
                    </button>
                    <button
                      @click="routesStore.toggleRouteStatus(route.id)"
                      :class="[
                        'hover:opacity-75',
                        route.active ? 'text-red-600' : 'text-green-600'
                      ]"
                    >
                      <component :is="route.active ? EyeOff : Eye" class="h-4 w-4" />
                    </button>
                    <button
                      @click="deleteRoute(route)"
                      class="text-red-600 hover:text-red-900"
                    >
                      <Trash2 class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <RouteModal
      v-if="showCreateModal || editingRoute"
      :route="editingRoute"
      @close="closeModal"
      @save="handleSave"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoutesStore } from '@/stores/admin/routes'
import { Plus, RefreshCw, Edit, Eye, EyeOff, Trash2 } from 'lucide-vue-next'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import RouteModal from '@/components/admin/RouteModal.vue'
import type { PriceRoute } from '@/stores/admin/routes'

const routesStore = useRoutesStore()

const showCreateModal = ref(false)
const editingRoute = ref<PriceRoute | null>(null)

onMounted(() => {
  routesStore.fetchRoutes()
})

function formatDate(date: string) {
  return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR })
}

function editRoute(route: PriceRoute) {
  editingRoute.value = route
}

function deleteRoute(route: PriceRoute) {
  if (confirm(`Tem certeza que deseja excluir a rota ${route.origin} → ${route.destination}?`)) {
    routesStore.deleteRoute(route.id)
  }
}

function closeModal() {
  showCreateModal.value = false
  editingRoute.value = null
}

function handleSave() {
  closeModal()
  routesStore.fetchRoutes()
}
</script>
```

## 5. Integração com a Calculadora

### 5.1 Atualização da Store da Calculadora

```typescript
// src/stores/calculator.ts - Atualização para usar banco de dados
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useSpecialDatesStore } from '@/stores/admin/specialDates'
import { format } from 'date-fns'

export interface PriceData {
  minPrice: number
  maxPrice: number
  multiplier?: number
  specialDate?: string
}

export const useCalculatorStore = defineStore('calculator', () => {
  const specialDatesStore = useSpecialDatesStore()
  
  // State existente...
  const step = ref(1)
  const tripType = ref<'oneway' | 'roundtrip'>('oneway')
  const origin = ref('')
  const destination = ref('')
  const passengers = ref('')
  const vehicleType = ref('')
  const result = ref<PriceData | null>(null)
  const selectedDate = ref(format(new Date(), 'yyyy-MM-dd'))

  // Novas funções para buscar preços do banco
  async function calculatePrice() {
    try {
      // Buscar preço base da rota
      const { data: route, error } = await supabase
        .from('price_routes')
        .select('base_price')
        .eq('origin', origin.value)
        .eq('destination', destination.value)
        .eq('vehicle_type', vehicleType.value)
        .eq('active', true)
        .single()

      if (error || !route) {
        throw new Error('Rota não encontrada')
      }

      let basePrice = route.base_price
      let multiplier = 1.0

      // Verificar se há multiplicador para a data selecionada
      if (selectedDate.value) {
        multiplier = await specialDatesStore.getMultiplierForDate(selectedDate.value)
      }

      // Calcular preço final
      const finalPrice = basePrice * multiplier
      
      // Aplicar variação de ±10% para simular faixa de preço
      const minPrice = finalPrice * 0.9
      const maxPrice = finalPrice * 1.1

      result.value = {
        minPrice: tripType.value === 'roundtrip' ? minPrice * 2 : minPrice,
        maxPrice: tripType.value === 'roundtrip' ? maxPrice * 2 : maxPrice,
        multiplier,
        specialDate: multiplier > 1 ? selectedDate.value : undefined
      }

      // Salvar cotação no histórico
      await saveQuote()

      return result.value
    } catch (error) {
      console.error('Erro ao calcular preço:', error)
      throw error
    }
  }

  async function saveQuote() {
    if (!result.value) return

    try {
      const { data: user } = await supabase.auth.getUser()
      
      await supabase
        .from('quotes')
        .insert([{
          user_id: user.user?.id || null,
          session_id: user.user ? null : generateSessionId(),
          origin: origin.value,
          destination: destination.value,
          vehicle_type: vehicleType.value,
          passengers: parseInt(passengers.value),
          trip_type: tripType.value,
          base_price: result.value.minPrice / (result.value.multiplier || 1),
          multiplier: result.value.multiplier || 1,
          final_price: result.value.minPrice,
          quote_date: selectedDate.value
        }])
    } catch (error) {
      console.error('Erro ao salvar cotação:', error)
    }
  }

  function generateSessionId() {
    return 'session_' + Math.random().toString(36).substr(2, 9)
  }

  // Resto das funções existentes...
  
  return {
    // State
    step,
    tripType,
    origin,
    destination,
    passengers,
    vehicleType,
    result,
    selectedDate,
    
    // Actions
    calculatePrice,
    // ... outras actions existentes
  }
})
```

## 6. Checklist de Implementação

### 6.1 Banco de Dados
- [ ] Criar tabelas (price_routes, special_dates, quotes, admin_logs)
- [ ] Configurar RLS policies
- [ ] Criar triggers e funções
- [ ] Inserir dados iniciais

### 6.2 Stores Pinia
- [ ] Implementar store de rotas
- [ ] Implementar store de datas especiais
- [ ] Atualizar store da calculadora
- [ ] Implementar store de relatórios

### 6.3 Interface Administrativa
- [ ] Criar dashboard principal
- [ ] Implementar CRUD de rotas
- [ ] Implementar CRUD de datas especiais
- [ ] Criar modais de edição
- [ ] Implementar filtros e busca

### 6.4 Integração
- [ ] Atualizar calculadora para usar banco
- [ ] Implementar aplicação de multiplicadores
- [ ] Criar histórico de cotações
- [ ] Implementar exportação de dados

### 6.5 Segurança e Auditoria
- [ ] Testar políticas RLS
- [ ] Verificar logs de auditoria
- [ ] Implementar validações
- [ ] Testar permissões de admin

Este documento fornece uma implementação completa do painel administrativo com todas as funcionalidades necessárias para gerenciar rotas, preços e datas especiais.