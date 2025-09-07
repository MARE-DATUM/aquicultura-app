# 📋 Plano de Desenvolvimento - Aquicultura App

## 🎯 Visão Geral

Este documento detalha o plano de desenvolvimento para completar a aplicação de gestão dos 21 projetos de aquicultura em Angola, seguindo os requisitos especificados no prompt original.

## 📊 Status Atual

### ✅ Implementado
- **Backend FastAPI**: Estrutura base com autenticação JWT e RBAC
- **Frontend React**: Layout responsivo com Tailwind CSS
- **Banco de Dados**: Modelos PostgreSQL para todas as entidades
- **Docker**: Configuração completa com docker-compose
- **Autenticação**: Sistema de login/logout com 3 níveis de acesso
- **APIs Básicas**: CRUD para projetos, indicadores, licenciamentos, 5W2H
- **Dashboard**: Interface básica com KPIs e gráficos
- **Auditoria**: Sistema de logs de ações
- **Rate Limiting**: Proteção contra ataques de força bruta

### 🔄 Em Desenvolvimento
- **Páginas Frontend**: Várias páginas mostram "Módulo em desenvolvimento"
- **Importação/Exportação**: APIs parcialmente implementadas
- **Mapa Interativo**: Componente não implementado
- **Relatórios**: Funcionalidade básica presente

### ❌ Não Implementado
- **Testes**: Backend e frontend sem cobertura de testes
- **CI/CD**: GitHub Actions não configurado
- **Validações Avançadas**: Sanitização e validação de inputs
- **Templates CSV**: Arquivos de exemplo para importação
- **Documentação API**: Swagger/OpenAPI incompleto

## 🗓️ Cronograma de Desenvolvimento

### Sprint 1: Completar Backend (Semana 1-2)
**Prioridade: Alta**

#### 1.1 APIs de Importação/Exportação
- [ ] Implementar wizard de importação CSV com pré-validação
- [ ] Criar preview de dados antes da importação
- [ ] Adicionar relatório de erros detalhado
- [ ] Implementar exportação CSV/JSON com filtros
- [ ] Criar templates CSV para cada entidade

#### 1.2 Dashboard APIs
- [ ] Endpoint para estatísticas nacionais
- [ ] Agregação de dados por província
- [ ] KPIs de 18 meses (produção, famílias, empregos)
- [ ] Dados para mapa das províncias

#### 1.3 Melhorias de Segurança
- [ ] Sanitização de inputs (SQL injection, XSS)
- [ ] Validações robustas no backend
- [ ] Headers de segurança (Helmet equivalente)
- [ ] Mascaramento de tokens em logs

### Sprint 2: Frontend Completo (Semana 2-3)
**Prioridade: Alta**

#### 2.1 Páginas Principais
- [ ] **Projetos**: Lista, filtros, CRUD completo, detalhes
- [ ] **Indicadores**: Registo trimestral, gráficos, metas vs realizado
- [ ] **5W2H**: Editor por projeto e fase, tabelas interativas
- [ ] **Licenciamentos**: Formulário, tracking, status
- [ ] **Utilizadores**: Gestão completa (apenas ROOT)
- [ ] **Auditoria**: Tabela filtrável, exportação

#### 2.2 Mapa Interativo
- [ ] Componente de mapa das 21 províncias
- [ ] Pins/cores por estado do projeto
- [ ] Tooltip com informações do projeto
- [ ] Integração com dados do backend

#### 2.3 Importação/Exportação UI
- [ ] Wizard de importação com steps
- [ ] Preview de dados com validação
- [ ] Relatório de erros visual
- [ ] Botões de exportação em todas as listas

### Sprint 3: Qualidade e Testes (Semana 3-4)
**Prioridade: Média**

#### 3.1 Testes Backend
- [ ] Testes de autenticação e RBAC
- [ ] Testes de CRUD para cada entidade
- [ ] Testes de importação CSV (sucesso e erro)
- [ ] Testes de APIs de dashboard
- [ ] Cobertura mínima de 80%

#### 3.2 Testes Frontend
- [ ] Smoke tests das páginas principais
- [ ] Testes de componentes UI
- [ ] Testes de permissões por papel
- [ ] Testes de integração com APIs

#### 3.3 CI/CD
- [ ] GitHub Actions para lint e testes
- [ ] Build automático do Docker
- [ ] Deploy automático (staging)
- [ ] Verificação de segurança

### Sprint 4: Finalização e Deploy (Semana 4-5)
**Prioridade: Média**

#### 4.1 Documentação
- [ ] Atualizar README com instruções completas
- [ ] Documentar APIs com Swagger/OpenAPI
- [ ] Criar guia de desenvolvimento
- [ ] Documentar processo de deploy

#### 4.2 Seeds e Dados Demo
- [ ] Script de seed completo
- [ ] 21 projetos (1 por província)
- [ ] Dados de 5W2H por fase
- [ ] Indicadores trimestrais de exemplo
- [ ] Templates CSV para importação

#### 4.3 Otimizações
- [ ] Performance do frontend
- [ ] Otimização de queries do backend
- [ ] Cache de dados frequentes
- [ ] Compressão de assets

## 🏗️ Arquitetura e Padrões

### Backend (FastAPI)
```
app/
├── api/          # Endpoints REST
├── core/         # Configuração, segurança, deps
├── db/           # Database e migrations
├── models/       # SQLAlchemy models
├── schemas/      # Pydantic schemas
├── services/     # Business logic
└── utils/        # Utilitários
```

### Frontend (React)
```
src/
├── components/   # Componentes reutilizáveis
├── pages/        # Páginas da aplicação
├── contexts/     # Context providers
├── hooks/        # Custom hooks
├── services/     # API calls
├── types/        # TypeScript types
└── utils/        # Utilitários
```

## 🔒 Segurança

### Implementado
- ✅ JWT com refresh tokens
- ✅ RBAC com 3 níveis
- ✅ Rate limiting no login
- ✅ CORS configurável
- ✅ Hashing seguro de passwords

### A Implementar
- [ ] Sanitização de inputs
- [ ] Validação de uploads
- [ ] Headers de segurança
- [ ] Auditoria completa
- [ ] Backup automático

## 📈 KPIs e Métricas

### Dashboard Nacional
- **Produção Total**: Toneladas por província/trimestre
- **Famílias Beneficiadas**: Número total e por projeto
- **Empregos Criados**: Diretos e indiretos
- **Execução Orçamental**: % executado vs previsto
- **Licenças Fast-track**: Aprovadas, pendentes, negadas

### Distribuição
- **Por Fonte**: AFAP-2, FADEPA, FACRA, Privado
- **Por Tipo**: Comunitário (15), Empresarial (6)
- **Por Estado**: Planeado, Em Execução, Concluído, Suspenso
- **Por Província**: Cobertura das 21 províncias

## 🚀 Deploy e Infraestrutura

### Desenvolvimento
```bash
# Iniciar aplicação
docker-compose up -d

# Executar seeds
./scripts/seed.sh

# Executar testes
docker-compose exec backend pytest
docker-compose exec frontend npm test
```

### Produção
- **Servidor**: VPS/Cloud com Docker
- **Banco**: PostgreSQL com backup automático
- **Proxy**: Nginx com SSL
- **Monitorização**: Logs centralizados
- **Backup**: Diário com retenção de 30 dias

## 📋 Critérios de Aceitação

### Funcional
- [ ] Login com 3 níveis de acesso funcionando
- [ ] CRUD completo de todas as entidades
- [ ] Importação CSV com validação
- [ ] Dashboard com KPIs atualizados
- [ ] Mapa das 21 províncias interativo
- [ ] Auditoria completa de ações

### Técnico
- [ ] Cobertura de testes > 80%
- [ ] Performance < 2s para carregamento
- [ ] Responsivo em mobile/tablet/desktop
- [ ] Sem vulnerabilidades de segurança
- [ ] Documentação completa

### Operacional
- [ ] Deploy com `docker-compose up`
- [ ] Seeds funcionando corretamente
- [ ] Backup automático configurado
- [ ] Logs estruturados e monitorizados
- [ ] CI/CD funcionando

## 🎯 Próximos Passos Imediatos

1. **Completar APIs de Dashboard** (2-3 dias)
2. **Implementar Páginas Frontend** (5-7 dias)
3. **Adicionar Mapa Interativo** (2-3 dias)
4. **Criar Sistema de Testes** (3-4 dias)
5. **Configurar CI/CD** (1-2 dias)

---

**Repositório**: https://github.com/marconadas/aquicultura-app
**Stack**: FastAPI + React + PostgreSQL + Docker
**Prazo**: 4-5 semanas para conclusão completa
