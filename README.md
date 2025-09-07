# App de Gestão dos 21 Projectos de Aquicultura

Sistema web para gestão e acompanhamento de 21 projectos de aquicultura em todas as províncias de Angola, num horizonte de 18 meses.

## 🚀 Características

- **Autenticação e RBAC**: Três níveis de acesso (ROOT, Gestão de Dados, Visualização)
- **Gestão de Projetos**: CRUD completo com filtros avançados
- **Planeamento 5W2H**: Editor por projeto com fases (0-6, 7-12, 13-18 meses)
- **Indicadores**: Registo trimestral com dashboards
- **Licenciamento Fast-track**: Tracking por projeto e entidade
- **Mapa Interativo**: Distribuição dos projetos pelas 21 províncias
- **Importação/Exportação**: CSV com validação e auditoria
- **Dashboards**: KPIs nacionais e por província
- **Auditoria**: Log completo de todas as ações

## 🛠️ Stack Tecnológica

### Backend
- **Python 3.11** + FastAPI
- **PostgreSQL 15** (banco de dados)
- **Redis 7** (rate limiting)
- **SQLAlchemy** (ORM)
- **Pydantic** (validação)
- **JWT** (autenticação)

### Frontend
- **React 19** + TypeScript
- **Vite** (build tool)
- **Tailwind CSS** (styling)
- **React Router** (roteamento)
- **Recharts** (gráficos)
- **Axios** (HTTP client)

### Infraestrutura
- **Docker** + Docker Compose
- **Nginx** (proxy reverso)
- **GitHub Actions** (CI/CD)

## 📋 Pré-requisitos

- Docker e Docker Compose
- Git

## 🚀 Instalação e Execução

### 1. Clone o repositório
```bash
git clone <repository-url>
cd aquicultura-app
```

### 2. Configure as variáveis de ambiente
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
# Database Configuration
DATABASE_URL=postgresql://aquicultura_user:aquicultura_password@localhost:5432/aquicultura_db
POSTGRES_USER=aquicultura_user
POSTGRES_PASSWORD=aquicultura_password
POSTGRES_DB=aquicultura_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# Admin Configuration
ADMIN_EMAIL=admin@aquicultura.ao
ADMIN_PASSWORD=admin123456

# Environment
ENV=development
NODE_ENV=development
TZ=Africa/Luanda

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:8000

# Rate Limiting
RATE_LIMIT_LOGIN_ATTEMPTS=5
RATE_LIMIT_LOGIN_WINDOW_MINUTES=5
RATE_LIMIT_LOGIN_BLOCK_MINUTES=15

# Application Configuration
APP_NAME=App de Gestão dos 21 Projectos de Aquicultura
APP_VERSION=1.0.0
DEFAULT_CURRENCY=Kz
DEFAULT_LOCALE=pt-AO

# Redis (for rate limiting)
REDIS_URL=redis://localhost:6379/0
```

### 3. Execute a aplicação
```bash
# Iniciar todos os serviços
docker-compose up -d

# Executar seed do banco de dados
./scripts/seed.sh
```

### 4. Acesse a aplicação
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Documentação API**: http://localhost:8000/docs

## 👥 Credenciais de Acesso

### Demonstração
- **ROOT**: admin@aquicultura.ao / admin123456
- **Gestão de Dados**: gestao@aquicultura.ao / gestao123456
- **Visualização**: visualizacao@aquicultura.ao / visualizacao123456

## 🔐 Sistema de Permissões (RBAC)

### ROOT
- ✅ Gestão completa de utilizadores
- ✅ CRUD de todas as entidades
- ✅ Acesso à auditoria
- ✅ Importação/exportação
- ✅ Configurações do sistema

### Gestão de Dados
- ❌ Gestão de utilizadores
- ✅ CRUD de entidades de negócio
- ✅ Importação/exportação
- ✅ Dashboards e relatórios
- ❌ Auditoria

### Visualização
- ❌ Gestão de utilizadores
- ❌ Criação/edição/eliminação
- ✅ Visualização de dados
- ✅ Dashboards e relatórios
- ✅ Filtros e exportação

## 📊 Modelo de Dados

### Entidades Principais

#### Provincia
- 21 províncias de Angola (incluindo Icolo e Bengo, Moxico Leste, Cuando, Cubango)
- Coordenadas para mapa interativo

#### Projeto
- 1 projeto por província (21 total)
- Tipos: Comunitário (15) / Empresarial (6)
- Fontes: AFAP-2, FADEPA, FACRA, Privado
- Estados: Planeado, Em Execução, Concluído, Suspenso

#### Eixo5W2H
- Planeamento por fases (0-6, 7-12, 13-18 meses)
- What, Why, Where, When, Who, How, How Much
- Marcos e indicadores de progresso

#### Indicador
- Registo trimestral (T1, T2, T3, T4)
- Tipos: Produção, Famílias Beneficiadas, Empregos, Licenças, Execução Orçamental
- Metas vs. Realizado

#### Licenciamento
- Fast-track por projeto
- Entidades: IPA, DNA, DNRM
- Status: Pendente, Em Análise, Aprovado, Negado

#### AuditLog
- Registo de todas as ações
- Utilizador, ação, entidade, IP, timestamp
- Detalhes adicionais

## 🗺️ Funcionalidades por Módulo

### Dashboard Nacional
- KPIs gerais (projetos, indicadores, execução)
- Gráficos por estado, fonte de financiamento, trimestre
- Mapa das províncias com distribuição
- Estatísticas de licenciamento

### Gestão de Projetos
- Lista com filtros avançados
- CRUD completo
- Acompanhamento de orçamento
- Estados e responsáveis

### Planeamento 5W2H
- Editor por projeto e fase
- Marcos e indicadores
- Orçamento por período
- Acompanhamento de progresso

### Indicadores
- Registo trimestral
- Metas vs. realizado
- Gráficos de evolução
- Exportação de dados

### Licenciamento
- Tracking por projeto
- Status e entidades
- Tempo de processamento
- Relatórios de aprovação

### Mapa Interativo
- 21 províncias de Angola
- Distribuição de projetos
- Cores por estado
- Estatísticas por região

### Importação/Exportação
- CSV com validação
- Preview antes de importar
- Relatório de erros
- Auditoria de operações

### Auditoria
- Log completo de ações
- Filtros por utilizador, ação, período
- Exportação CSV
- Estatísticas de uso

## 🧪 Testes

### Backend
```bash
# Executar testes
docker-compose exec backend pytest

# Com cobertura
docker-compose exec backend pytest --cov=app
```

### Frontend
```bash
# Executar testes
docker-compose exec frontend npm test

# Lint
docker-compose exec frontend npm run lint
```

## 🚀 Deploy

### Desenvolvimento
```bash
docker-compose up -d
```

### Produção
```bash
# Build para produção
docker-compose -f docker-compose.prod.yml up -d

# Com SSL/TLS
docker-compose -f docker-compose.prod.yml -f docker-compose.ssl.yml up -d
```

## 📈 Monitorização

### Health Checks
- **Backend**: http://localhost:8000/health
- **Frontend**: http://localhost:3000

### Logs
```bash
# Ver logs de todos os serviços
docker-compose logs -f

# Logs específicos
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Métricas
- Rate limiting (Redis)
- Auditoria (PostgreSQL)
- Performance (Nginx)

## 🔧 Desenvolvimento

### Estrutura do Projeto
```
aquicultura-app/
├── backend/                 # API FastAPI
│   ├── app/
│   │   ├── api/            # Endpoints
│   │   ├── core/           # Configurações
│   │   ├── db/             # Database
│   │   ├── models/         # SQLAlchemy models
│   │   ├── schemas/        # Pydantic schemas
│   │   └── services/       # Business logic
│   ├── tests/              # Testes
│   └── requirements.txt
├── frontend/               # React app
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── pages/          # Páginas
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API client
│   │   ├── types/          # TypeScript types
│   │   └── contexts/       # React contexts
│   └── package.json
├── scripts/                # Scripts utilitários
├── docker-compose.yml      # Orquestração
└── README.md
```

### Comandos Úteis

```bash
# Reiniciar serviços
docker-compose restart

# Rebuild containers
docker-compose up --build

# Limpar volumes
docker-compose down -v

# Executar comandos no container
docker-compose exec backend python -c "from app.db.seed import seed_database; seed_database()"
docker-compose exec frontend npm install

# Ver logs em tempo real
docker-compose logs -f backend
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Suporte

Para suporte, entre em contato:
- Email: suporte@aquicultura.ao
- Issues: [GitHub Issues](https://github.com/your-repo/issues)

## 🎯 Roadmap

### Versão 1.1
- [ ] Notificações em tempo real
- [ ] Relatórios PDF avançados
- [ ] API mobile
- [ ] Integração com sistemas externos

### Versão 1.2
- [ ] Machine Learning para previsões
- [ ] Dashboard executivo
- [ ] Integração com GIS
- [ ] App mobile nativo

---

**Desenvolvido para o Ministério das Pescas e do Mar de Angola (MINPERMAR)**
