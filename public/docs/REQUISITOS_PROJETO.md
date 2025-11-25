# Requisitos do Projeto - Transfer Cruzeiros Santos

## 1. Visão Geral do Projeto

### 1.1 Descrição
Sistema web para calculadora de preços de transfers privativos para passageiros de cruzeiros no Porto de Santos. O projeto atual é uma aplicação Vue.js 3 com TypeScript que oferece uma interface moderna e responsiva para cotação de serviços de transporte.

### 1.2 Tecnologias Atuais
- **Frontend**: Vue.js 3 + TypeScript
- **Roteamento**: Vue Router 4
- **Estado**: Pinia
- **Estilização**: Tailwind CSS
- **Build**: Vite
- **UI Components**: Headless UI, Heroicons, Lucide Vue

## 2. Funcionalidades Atuais Implementadas

### 2.1 Páginas Existentes
- **Home**: Página inicial com hero section e apresentação dos serviços
- **Calculadora**: Sistema de cotação em 4 etapas
- **Serviços**: Apresentação dos serviços oferecidos
- **Contato**: Informações de contato
- **404**: Página de erro para rotas não encontradas

### 2.2 Sistema de Calculadora (4 Etapas)
1. **Tipo de Viagem**: Ida simples ou ida e volta
2. **Origem e Destino**: Seleção de locais (aeroportos, regiões de SP, etc.)
3. **Número de Passageiros**: Quantidade de pessoas
4. **Tipo de Veículo**: Sedan Executivo, SUV Premium, Van, Minibus

### 2.3 Dados Mockados
- 12 rotas pré-configuradas
- Preços variáveis por origem, destino e tipo de veículo
- Estrutura preparada para migração para API

## 3. Novas Funcionalidades a Implementar

### 3.1 Sistema de Autenticação (Supabase)

#### 3.1.1 Requisitos Funcionais
- **RF001**: Cadastro de usuários com email e senha
- **RF002**: Confirmação de email obrigatória para ativação da conta
- **RF003**: Login com email e senha
- **RF004**: Logout do sistema
- **RF005**: Recuperação de senha via email
- **RF006**: Perfil do usuário editável

#### 3.1.2 Implementação Técnica
```typescript
// Estrutura de usuário
interface User {
  id: string
  email: string
  name: string
  phone?: string
  created_at: string
  email_confirmed: boolean
  role: 'user' | 'admin'
}
```

#### 3.1.3 Páginas Necessárias
- `/login` - Tela de login
- `/register` - Tela de cadastro
- `/confirm-email` - Confirmação de email
- `/forgot-password` - Recuperação de senha
- `/profile` - Perfil do usuário

### 3.2 Painel Administrativo

#### 3.2.1 Requisitos Funcionais
- **RF007**: Acesso restrito a usuários com role 'admin'
- **RF008**: CRUD de rotas e preços
- **RF009**: Gestão de datas especiais e valores diferenciados
- **RF010**: Relatórios de cotações realizadas
- **RF011**: Gestão de usuários

#### 3.2.2 Estrutura de Dados
```typescript
// Tabela de preços
interface PriceRoute {
  id: string
  origin: string
  destination: string
  vehicle_type: string
  base_price: number
  created_at: string
  updated_at: string
  active: boolean
}

// Tabela de datas especiais
interface SpecialDate {
  id: string
  date: string
  multiplier: number // 1.5 = 50% de acréscimo
  description: string
  active: boolean
}
```

#### 3.2.3 Páginas Administrativas
- `/admin/dashboard` - Dashboard principal
- `/admin/routes` - Gestão de rotas e preços
- `/admin/special-dates` - Gestão de datas especiais
- `/admin/quotes` - Histórico de cotações
- `/admin/users` - Gestão de usuários

### 3.3 Melhorias na Calculadora

#### 3.3.1 Integração com Banco de Dados
- Substituir dados mockados por consultas ao Supabase
- Aplicar multiplicadores de datas especiais
- Salvar histórico de cotações para usuários logados

#### 3.3.2 Funcionalidades Adicionais
- **RF012**: Salvar cotações favoritas (usuários logados)
- **RF013**: Histórico de cotações realizadas
- **RF014**: Envio de cotação por email
- **RF015**: Agendamento de transfer

## 4. Arquitetura e Infraestrutura

### 4.1 Banco de Dados (Supabase)

#### 4.1.1 Tabelas Principais
```sql
-- Usuários (gerenciado pelo Supabase Auth)
-- profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Rotas e preços
CREATE TABLE price_routes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  vehicle_type TEXT NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Datas especiais
CREATE TABLE special_dates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  multiplier DECIMAL(3,2) NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Cotações realizadas
CREATE TABLE quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  vehicle_type TEXT NOT NULL,
  passengers INTEGER NOT NULL,
  trip_type TEXT NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  final_price DECIMAL(10,2) NOT NULL,
  quote_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 4.2 Containerização

#### 4.2.1 Dockerfile
```dockerfile
# Multi-stage build para otimização
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### 4.2.2 Docker Compose
```yaml
version: '3.8'
services:
  frontend:
    build: .
    ports:
      - "80:80"
    environment:
      - VITE_SUPABASE_URL=${SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
    depends_on:
      - nginx
  
  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
```

### 4.3 CI/CD Pipeline

#### 4.3.1 GitHub Actions
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build and push Docker image
        run: |
          docker build -t santos-transfer .
          docker tag santos-transfer ${{ secrets.REGISTRY_URL }}/santos-transfer:latest
          docker push ${{ secrets.REGISTRY_URL }}/santos-transfer:latest
      
      - name: Deploy to production
        run: |
          # Deploy commands here
```

## 5. Configuração do Ambiente

### 5.1 Variáveis de Ambiente
```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Email (opcional para notificações)
VITE_EMAIL_SERVICE_ID=your_email_service_id
```

### 5.2 Dependências Adicionais
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.38.0",
    "@vueuse/core": "^10.5.0",
    "date-fns": "^2.30.0",
    "zod": "^3.22.0"
  }
}
```

## 6. Cronograma de Implementação

### Fase 1: Autenticação (1-2 semanas)
- [ ] Configuração do Supabase
- [ ] Implementação do sistema de auth
- [ ] Páginas de login/registro
- [ ] Confirmação por email

### Fase 2: Painel Admin (2-3 semanas)
- [ ] Estrutura do banco de dados
- [ ] CRUD de rotas e preços
- [ ] Gestão de datas especiais
- [ ] Interface administrativa

### Fase 3: Melhorias na Calculadora (1 semana)
- [ ] Integração com banco de dados
- [ ] Aplicação de regras de datas especiais
- [ ] Histórico de cotações

### Fase 4: Infraestrutura (1 semana)
- [ ] Containerização
- [ ] CI/CD Pipeline
- [ ] Deploy em produção

## 7. Considerações de Segurança

### 7.1 Autenticação e Autorização
- Uso do Supabase Auth para gerenciamento seguro
- Row Level Security (RLS) no banco de dados
- Validação de roles no frontend e backend

### 7.2 Validação de Dados
- Validação com Zod nos formulários
- Sanitização de inputs
- Rate limiting nas APIs

### 7.3 HTTPS e Certificados
- Certificados SSL obrigatórios
- Headers de segurança configurados
- CORS adequadamente configurado

## 8. Monitoramento e Logs

### 8.1 Métricas
- Número de cotações realizadas
- Usuários ativos
- Performance da aplicação
- Erros e exceções

### 8.2 Logs
- Logs de autenticação
- Logs de cotações
- Logs de erros
- Auditoria de ações administrativas

## 9. Testes

### 9.1 Testes Unitários
- Componentes Vue
- Stores Pinia
- Utilitários

### 9.2 Testes de Integração
- Fluxo de autenticação
- Calculadora completa
- Painel administrativo

### 9.3 Testes E2E
- Jornada completa do usuário
- Fluxos críticos
- Responsividade

## 10. Documentação

### 10.1 Documentação Técnica
- README atualizado
- Guia de instalação
- Guia de desenvolvimento
- API documentation

### 10.2 Documentação do Usuário
- Manual do usuário final
- Manual do administrador
- FAQ
- Troubleshooting