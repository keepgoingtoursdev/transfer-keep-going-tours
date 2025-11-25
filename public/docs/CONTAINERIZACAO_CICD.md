# Containerização e CI/CD - Transfer Calculator

## Visão Geral
Este documento detalha a implementação de containerização com Docker e pipeline de CI/CD para a aplicação Transfer Calculator, garantindo deploy automatizado e escalabilidade.

## 1. Containerização com Docker

### 1.1 Dockerfile para Aplicação Vue.js

```dockerfile
# Build stage
FROM node:18-alpine as build-stage

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine as production-stage

# Copy built application
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 1.2 Configuração do Nginx

**nginx.conf**
```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Handle Vue Router
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;

        # Gzip compression
        gzip on;
        gzip_vary on;
        gzip_types
            text/plain
            text/css
            text/xml
            text/javascript
            application/javascript
            application/xml+rss
            application/json;
    }
}
```

### 1.3 Docker Compose para Desenvolvimento

**docker-compose.yml**
```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    environment:
      - NODE_ENV=production
      - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    restart: unless-stopped

  # Para desenvolvimento local com hot reload
  dev:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "5173:5173"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
    command: npm run dev
```

### 1.4 Dockerfile para Desenvolvimento

**Dockerfile.dev**
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

## 2. CI/CD Pipeline

### 2.1 GitHub Actions Workflow

**.github/workflows/deploy.yml**
```yaml
name: Deploy Transfer Calculator

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run linting
      run: npm run lint

    - name: Run type checking
      run: npm run type-check

    - name: Run tests
      run: npm run test:unit

    - name: Build application
      run: npm run build
      env:
        VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
        VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    permissions:
      contents: read
      packages: write

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Log in to Container Registry
      uses: docker/login-action@v3
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}

    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v5
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=sha,prefix={{branch}}-
          type=raw,value=latest,enable={{is_default_branch}}

    - name: Build and push Docker image
      uses: docker/build-push-action@v5
      with:
        context: .
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        build-args: |
          VITE_SUPABASE_URL=${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY=${{ secrets.VITE_SUPABASE_ANON_KEY }}

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Deploy to production
      uses: appleboy/ssh-action@v1.0.0
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /opt/transfer-calculator
          docker-compose pull
          docker-compose up -d
          docker system prune -f
```

### 2.2 Configuração de Staging

**.github/workflows/staging.yml**
```yaml
name: Deploy to Staging

on:
  push:
    branches: [ develop ]

jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Deploy to staging
      uses: appleboy/ssh-action@v1.0.0
      with:
        host: ${{ secrets.STAGING_HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /opt/transfer-calculator-staging
          git pull origin develop
          docker-compose -f docker-compose.staging.yml up -d --build
```

## 3. Configuração de Ambiente

### 3.1 Variáveis de Ambiente

**.env.example**
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Application Configuration
VITE_APP_NAME=Transfer Calculator
VITE_APP_VERSION=1.0.0
VITE_API_BASE_URL=https://api.transfercalculator.com

# Environment
NODE_ENV=production
```

### 3.2 Docker Compose para Produção

**docker-compose.prod.yml**
```yaml
version: '3.8'

services:
  app:
    image: ghcr.io/username/transfer-calculator:latest
    ports:
      - "80:80"
      - "443:443"
    environment:
      - NODE_ENV=production
    volumes:
      - ./ssl:/etc/nginx/ssl:ro
      - ./nginx.prod.conf:/etc/nginx/nginx.conf:ro
    restart: unless-stopped
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.transfer-calc.rule=Host(`transfercalculator.com`)"
      - "traefik.http.routers.transfer-calc.tls.certresolver=letsencrypt"

  traefik:
    image: traefik:v2.10
    command:
      - "--api.dashboard=true"
      - "--providers.docker=true"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.email=admin@transfercalculator.com"
      - "--certificatesresolvers.letsencrypt.acme.storage=/acme.json"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./acme.json:/acme.json
    restart: unless-stopped
```

## 4. Monitoramento e Logs

### 4.1 Configuração de Logs

**docker-compose.monitoring.yml**
```yaml
version: '3.8'

services:
  app:
    extends:
      file: docker-compose.yml
      service: app
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin123
    volumes:
      - grafana-storage:/var/lib/grafana
    restart: unless-stopped

volumes:
  grafana-storage:
```

### 4.2 Health Check

**healthcheck.js**
```javascript
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 80,
  path: '/health',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

req.on('error', () => {
  process.exit(1);
});

req.on('timeout', () => {
  req.destroy();
  process.exit(1);
});

req.end();
```

## 5. Scripts de Deploy

### 5.1 Script de Deploy Automatizado

**scripts/deploy.sh**
```bash
#!/bin/bash

set -e

echo "🚀 Iniciando deploy da aplicação Transfer Calculator..."

# Verificar se está na branch main
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" != "main" ]; then
    echo "❌ Deploy deve ser feito a partir da branch main"
    exit 1
fi

# Verificar se há mudanças não commitadas
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Há mudanças não commitadas. Commit antes de fazer deploy."
    exit 1
fi

# Build da aplicação
echo "📦 Fazendo build da aplicação..."
npm run build

# Build da imagem Docker
echo "🐳 Fazendo build da imagem Docker..."
docker build -t transfer-calculator:latest .

# Tag da imagem
VERSION=$(date +%Y%m%d-%H%M%S)
docker tag transfer-calculator:latest transfer-calculator:$VERSION

# Deploy
echo "🚀 Fazendo deploy..."
docker-compose -f docker-compose.prod.yml up -d

echo "✅ Deploy concluído com sucesso!"
echo "🌐 Aplicação disponível em: https://transfercalculator.com"
```

### 5.2 Script de Rollback

**scripts/rollback.sh**
```bash
#!/bin/bash

set -e

if [ -z "$1" ]; then
    echo "❌ Uso: ./rollback.sh <version>"
    echo "Versões disponíveis:"
    docker images transfer-calculator --format "table {{.Tag}}\t{{.CreatedAt}}"
    exit 1
fi

VERSION=$1

echo "🔄 Fazendo rollback para versão: $VERSION"

# Verificar se a imagem existe
if ! docker images transfer-calculator:$VERSION --format "{{.Repository}}" | grep -q transfer-calculator; then
    echo "❌ Versão $VERSION não encontrada"
    exit 1
fi

# Fazer rollback
docker tag transfer-calculator:$VERSION transfer-calculator:latest
docker-compose -f docker-compose.prod.yml up -d

echo "✅ Rollback concluído para versão: $VERSION"
```

## 6. Segurança

### 6.1 Configurações de Segurança

**security.conf**
```nginx
# Security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co;" always;

# Hide server information
server_tokens off;

# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req zone=api burst=20 nodelay;
```

## 7. Checklist de Implementação

### 7.1 Containerização
- [ ] Criar Dockerfile otimizado para produção
- [ ] Configurar nginx para servir aplicação Vue.js
- [ ] Implementar multi-stage build
- [ ] Configurar docker-compose para diferentes ambientes
- [ ] Implementar health checks
- [ ] Configurar logs estruturados

### 7.2 CI/CD Pipeline
- [ ] Configurar GitHub Actions workflow
- [ ] Implementar testes automatizados
- [ ] Configurar build e push de imagens Docker
- [ ] Implementar deploy automatizado
- [ ] Configurar ambientes de staging e produção
- [ ] Implementar rollback automatizado

### 7.3 Monitoramento
- [ ] Configurar coleta de logs
- [ ] Implementar métricas de aplicação
- [ ] Configurar alertas de sistema
- [ ] Implementar dashboard de monitoramento
- [ ] Configurar backup automatizado

### 7.4 Segurança
- [ ] Implementar HTTPS com certificados SSL
- [ ] Configurar headers de segurança
- [ ] Implementar rate limiting
- [ ] Configurar firewall e VPN
- [ ] Implementar scanning de vulnerabilidades

## 8. Comandos Úteis

```bash
# Build local
docker build -t transfer-calculator .

# Run local
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar serviços
docker-compose down

# Deploy produção
./scripts/deploy.sh

# Rollback
./scripts/rollback.sh 20240115-143000

# Verificar status
docker-compose ps

# Limpar sistema
docker system prune -f
```

## 9. Próximos Passos

1. **Configurar repositório Git** com branches main/develop
2. **Configurar secrets** no GitHub Actions
3. **Provisionar servidor** de produção
4. **Configurar domínio** e certificados SSL
5. **Implementar monitoramento** completo
6. **Configurar backups** automatizados
7. **Documentar procedimentos** operacionais
8. **Treinar equipe** nos processos de deploy

---

Este documento fornece uma base sólida para containerização e CI/CD da aplicação Transfer Calculator, garantindo deploys seguros, automatizados e escaláveis.