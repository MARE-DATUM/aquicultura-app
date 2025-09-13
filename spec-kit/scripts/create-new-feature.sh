#!/bin/bash

# Script para criar uma nova feature usando Spec-Driven Development
# Uso: ./create-new-feature.sh "Nome da Feature"

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se o nome da feature foi fornecido
if [ $# -eq 0 ]; then
    print_error "Nome da feature é obrigatório!"
    echo "Uso: $0 \"Nome da Feature\""
    exit 1
fi

FEATURE_NAME="$1"
FEATURE_SLUG=$(echo "$FEATURE_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/ /-/g' | sed 's/[^a-z0-9-]//g')
FEATURE_DIR="spec-kit/specs/$(date +%Y%m%d)-${FEATURE_SLUG}"
CURRENT_DATE=$(date +"%Y-%m-%d")
AUTHOR=$(git config user.name || echo "Desenvolvedor")

print_message "Criando feature: $FEATURE_NAME"
print_message "Slug: $FEATURE_SLUG"
print_message "Diretório: $FEATURE_DIR"

# Criar diretório da feature
mkdir -p "$FEATURE_DIR"

# Criar arquivos da feature
print_message "Criando arquivos da feature..."

# Especificação funcional
cat > "$FEATURE_DIR/spec.md" << EOF
# $FEATURE_NAME - Especificação Funcional

## 📋 Visão Geral
**Nome da Feature:** $FEATURE_NAME  
**Data de Criação:** $CURRENT_DATE  
**Autor:** $AUTHOR  
**Status:** Em Desenvolvimento  

## 🎯 Objetivo
Descreva o objetivo principal desta feature e o problema que ela resolve.

## 👥 Personas e Casos de Uso
### Persona Principal
- **Nome:** [Nome da Persona]
- **Descrição:** [Descrição da persona]
- **Necessidades:** [Necessidades da persona]

### Casos de Uso
1. **[Caso de Uso 1]**
   - **Ator:** [Ator]
   - **Pré-condições:** [Pré-condições]
   - **Fluxo Principal:**
     1. [Passo 1]
     2. [Passo 2]
     3. [Passo 3]
   - **Pós-condições:** [Pós-condições]

## 🔧 Requisitos Funcionais
### RF001 - [Requisito 1]
- **Descrição:** [Descrição do requisito]
- **Prioridade:** Alta
- **Critérios de Aceitação:**
  - [ ] [Critério 1]
  - [ ] [Critério 2]
  - [ ] [Critério 3]

## 🚫 Requisitos Não Funcionais
### RNF001 - Performance
- **Descrição:** [Requisito de performance]
- **Métrica:** [Métrica específica]

### RNF002 - Segurança
- **Descrição:** [Requisito de segurança]

## 🎨 Design e UX
### Wireframes
- [ ] Wireframe de baixa fidelidade
- [ ] Wireframe de alta fidelidade
- [ ] Protótipo interativo

## 🗄️ Modelo de Dados
### Entidades Principais
- **[Entidade 1]**
  - [Campo 1]: [Tipo]
  - [Campo 2]: [Tipo]

## 🔌 APIs e Integrações
### Endpoints
- \`GET /api/[endpoint]\` - [Descrição]
- \`POST /api/[endpoint]\` - [Descrição]

## 🧪 Testes
### Testes Unitários
- [ ] [Teste 1]
- [ ] [Teste 2]

### Testes de Integração
- [ ] [Teste de integração 1]

### Testes E2E
- [ ] [Teste E2E 1]

## ✅ Checklist de Revisão e Aceitação
### Funcionalidade
- [ ] Todos os requisitos funcionais implementados
- [ ] Todos os casos de uso funcionando
- [ ] Interface de usuário conforme especificado

### Qualidade
- [ ] Código revisado e aprovado
- [ ] Testes passando (cobertura > 80%)
- [ ] Documentação atualizada

### Segurança
- [ ] Validação de entrada implementada
- [ ] Autenticação e autorização funcionando
- [ ] Dados sensíveis protegidos

## 📝 Notas e Considerações
- [Nota 1]
- [Nota 2]

## 🔗 Referências
- [Referência 1](URL1)
- [Referência 2](URL2)
EOF

# Plano de implementação
cat > "$FEATURE_DIR/plan.md" << EOF
# $FEATURE_NAME - Plano de Implementação

## 📋 Resumo Executivo
**Feature:** $FEATURE_NAME  
**Estimativa Total:** [X] horas  
**Prazo:** [Data limite]  
**Equipe:** [Equipe responsável]  

## 🎯 Objetivos da Implementação
- [Objetivo 1]
- [Objetivo 2]
- [Objetivo 3]

## 🏗️ Arquitetura Técnica
### Stack Tecnológico
- **Frontend:** [Tecnologia frontend]
- **Backend:** [Tecnologia backend]
- **Banco de Dados:** [Tecnologia de banco]
- **Infraestrutura:** [Tecnologia de infraestrutura]

## 📅 Cronograma de Implementação
### Fase 1: Preparação ([X] dias)
- [ ] Setup do ambiente de desenvolvimento
- [ ] Análise técnica detalhada

### Fase 2: Desenvolvimento Core ([X] dias)
- [ ] [Tarefa 1] ([X]h)
- [ ] [Tarefa 2] ([X]h)

### Fase 3: Integração e Testes ([X] dias)
- [ ] Integração de componentes
- [ ] Testes e validação

### Fase 4: Deploy e Monitoramento ([X] dias)
- [ ] Preparação para produção
- [ ] Monitoramento e ajustes

## 👥 Recursos e Responsabilidades
### Equipe de Desenvolvimento
- **[Função 1]:** [Pessoa 1]
  - Responsabilidades: [Responsabilidades]

## ⚠️ Riscos e Mitigações
### Riscos Técnicos
- **[Risco 1]**
  - Probabilidade: [Alta/Média/Baixa]
  - Impacto: [Alto/Médio/Baixo]
  - Mitigação: [Estratégia de mitigação]

## 🧪 Estratégia de Testes
### Testes Unitários
- **Cobertura mínima:** 80%
- **Ferramentas:** [Ferramentas de teste]

### Testes de Integração
- **Ambiente:** [Ambiente de integração]
- **Cenários:** [Cenários de teste]

## 📊 Métricas de Sucesso
### Métricas Técnicas
- **Performance:** [Métrica de performance]
- **Disponibilidade:** [Métrica de disponibilidade]

### Métricas de Negócio
- **[Métrica 1]:** [Valor alvo]
- **[Métrica 2]:** [Valor alvo]

## 🔄 Processo de Deploy
### Ambientes
1. **Desenvolvimento**
   - Branch: \`develop\`
   - Deploy: Automático

2. **Staging**
   - Branch: \`staging\`
   - Deploy: Manual

3. **Produção**
   - Branch: \`main\`
   - Deploy: Manual com aprovação

## 📚 Documentação
### Documentos a Criar
- [ ] README.md atualizado
- [ ] API documentation
- [ ] User guide

## 🔗 Dependências Externas
### APIs Externas
- **[API 1]**
  - Status: [Status]
  - SLA: [SLA]

## 📝 Notas e Considerações
- [Nota 1]
- [Nota 2]

## 🔗 Referências
- [Referência 1](URL1)
- [Referência 2](URL2)
EOF

# Lista de tarefas
cat > "$FEATURE_DIR/tasks.md" << EOF
# $FEATURE_NAME - Lista de Tarefas

## 📋 Resumo
**Feature:** $FEATURE_NAME  
**Total de Tarefas:** [X]  
**Estimativa Total:** [X] horas  
**Status Geral:** Em Desenvolvimento  

## 🎯 Tarefas por Categoria

### 🏗️ Infraestrutura e Setup
| ID | Tarefa | Estimativa | Prioridade | Status | Responsável |
|----|--------|------------|------------|--------|-------------|
| T001 | Setup do ambiente | 2h | Alta | Pendente | [Responsável] |
| T002 | Configuração do repositório | 1h | Alta | Pendente | [Responsável] |

### 🎨 Frontend
| ID | Tarefa | Estimativa | Prioridade | Status | Responsável |
|----|--------|------------|------------|--------|-------------|
| T003 | [Tarefa frontend 1] | [X]h | [Prioridade] | Pendente | [Responsável] |
| T004 | [Tarefa frontend 2] | [X]h | [Prioridade] | Pendente | [Responsável] |

### 🔧 Backend
| ID | Tarefa | Estimativa | Prioridade | Status | Responsável |
|----|--------|------------|------------|--------|-------------|
| T005 | [Tarefa backend 1] | [X]h | [Prioridade] | Pendente | [Responsável] |
| T006 | [Tarefa backend 2] | [X]h | [Prioridade] | Pendente | [Responsável] |

### 🗄️ Banco de Dados
| ID | Tarefa | Estimativa | Prioridade | Status | Responsável |
|----|--------|------------|------------|--------|-------------|
| T007 | [Tarefa banco 1] | [X]h | [Prioridade] | Pendente | [Responsável] |

### 🧪 Testes
| ID | Tarefa | Estimativa | Prioridade | Status | Responsável |
|----|--------|------------|------------|--------|-------------|
| T008 | [Tarefa teste 1] | [X]h | [Prioridade] | Pendente | [Responsável] |

### 📚 Documentação
| ID | Tarefa | Estimativa | Prioridade | Status | Responsável |
|----|--------|------------|------------|--------|-------------|
| T009 | [Tarefa doc 1] | [X]h | [Prioridade] | Pendente | [Responsável] |

## 📅 Cronograma Detalhado

### Semana 1 ([Datas])
- **Segunda-feira:** [Tarefas]
- **Terça-feira:** [Tarefas]
- **Quarta-feira:** [Tarefas]
- **Quinta-feira:** [Tarefas]
- **Sexta-feira:** [Tarefas]

## 🔄 Dependências entre Tarefas
### Dependências Críticas
- [Tarefa A] → [Tarefa B] ([Razão])

## ⚠️ Bloqueadores e Riscos
### Bloqueadores Ativos
- Nenhum no momento

### Riscos Identificados
- **[Risco 1]**
  - Probabilidade: [Alta/Média/Baixa]
  - Impacto: [Alto/Médio/Baixo]
  - Mitigação: [Estratégia]

## 📊 Métricas de Progresso
### Progresso Geral
- **Tarefas Concluídas:** 0/[Total] (0%)
- **Horas Trabalhadas:** 0/[Total]h
- **Tarefas em Atraso:** 0

## 🎯 Próximas Ações
### Esta Semana
- [ ] [Ação 1]
- [ ] [Ação 2]

## 📝 Notas e Observações
- [Nota 1]
- [Nota 2]

## 🔗 Links Úteis
- [Link 1](URL1)
- [Link 2](URL2)
EOF

# Arquivo de pesquisa
cat > "$FEATURE_DIR/research.md" << EOF
# $FEATURE_NAME - Pesquisa e Análise

## 🔍 Pesquisa Inicial
### Tecnologias Consideradas
- **[Tecnologia 1]**
  - Prós: [Vantagens]
  - Contras: [Desvantagens]
  - Decisão: [Escolhida/Rejeitada]

### Padrões e Boas Práticas
- **[Padrão 1]**
  - Descrição: [Descrição]
  - Aplicação: [Como aplicar]

## 📚 Referências Técnicas
### Documentação Oficial
- [Link 1](URL1)
- [Link 2](URL2)

### Tutoriais e Guias
- [Tutorial 1](URL1)
- [Tutorial 2](URL2)

### Exemplos de Implementação
- [Exemplo 1](URL1)
- [Exemplo 2](URL2)

## 🧪 Protótipos e Experimentos
### Protótipo 1
- **Objetivo:** [Objetivo]
- **Resultado:** [Resultado]
- **Aprendizados:** [Aprendizados]

## 📊 Benchmarks e Comparações
### Performance
- **[Tecnologia A]:** [Métrica]
- **[Tecnologia B]:** [Métrica]

### Facilidade de Uso
- **[Tecnologia A]:** [Avaliação]
- **[Tecnologia B]:** [Avaliação]

## 🔗 Links Úteis
- [Link 1](URL1)
- [Link 2](URL2)
- [Link 3](URL3)
EOF

# Arquivo de contratos
cat > "$FEATURE_DIR/contracts.md" << EOF
# $FEATURE_NAME - Contratos e Interfaces

## 🔌 APIs
### Endpoints REST
\`\`\`yaml
# Exemplo de especificação OpenAPI
openapi: 3.0.0
info:
  title: $FEATURE_NAME API
  version: 1.0.0
paths:
  /api/[endpoint]:
    get:
      summary: [Descrição]
      responses:
        '200':
          description: Sucesso
\`\`\`

### WebSockets
\`\`\`yaml
# Exemplo de eventos WebSocket
events:
  - name: [evento]
    description: [Descrição]
    payload:
      type: object
      properties:
        [propriedade]: [tipo]
\`\`\`

## 📋 Contratos de Dados
### Schemas
\`\`\`json
{
  "[schema_name]": {
    "type": "object",
    "properties": {
      "[propriedade]": {
        "type": "[tipo]",
        "description": "[Descrição]"
      }
    }
  }
}
\`\`\`

## 🔄 Fluxos de Integração
### Fluxo 1
1. [Passo 1]
2. [Passo 2]
3. [Passo 3]

## 📝 Notas
- [Nota 1]
- [Nota 2]
EOF

# Arquivo de modelo de dados
cat > "$FEATURE_DIR/data-model.md" << EOF
# $FEATURE_NAME - Modelo de Dados

## 🗄️ Entidades Principais

### [Entidade 1]
\`\`\`sql
CREATE TABLE [entidade_1] (
    id SERIAL PRIMARY KEY,
    [campo_1] [tipo] NOT NULL,
    [campo_2] [tipo],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

**Campos:**
- \`id\`: Identificador único
- \`[campo_1]\`: [Descrição]
- \`[campo_2]\`: [Descrição]

### [Entidade 2]
\`\`\`sql
CREATE TABLE [entidade_2] (
    id SERIAL PRIMARY KEY,
    [entidade_1]_id INTEGER REFERENCES [entidade_1](id),
    [campo_1] [tipo] NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

## 🔗 Relacionamentos
- **[Entidade 1]** → **1:N** → **[Entidade 2]**
- **[Entidade 2]** → **N:1** → **[Entidade 1]**

## 📊 Índices
\`\`\`sql
CREATE INDEX idx_[entidade_1]_[campo] ON [entidade_1]([campo]);
CREATE INDEX idx_[entidade_2]_[campo] ON [entidade_2]([campo]);
\`\`\`

## 🔄 Migrações
### Migração 001 - Criação inicial
\`\`\`sql
-- [Descrição da migração]
\`\`\`

## 📝 Notas
- [Nota 1]
- [Nota 2]
EOF

# Arquivo de quickstart
cat > "$FEATURE_DIR/quickstart.md" << EOF
# $FEATURE_NAME - Quick Start

## 🚀 Início Rápido

### Pré-requisitos
- [Pré-requisito 1]
- [Pré-requisito 2]
- [Pré-requisito 3]

### Instalação
\`\`\`bash
# Passo 1
[comando 1]

# Passo 2
[comando 2]

# Passo 3
[comando 3]
\`\`\`

### Configuração
1. [Passo de configuração 1]
2. [Passo de configuração 2]
3. [Passo de configuração 3]

### Execução
\`\`\`bash
# Comando para executar
[comando de execução]
\`\`\`

## 🧪 Testes
\`\`\`bash
# Executar testes
[comando de teste]
\`\`\`

## 📚 Próximos Passos
1. [Próximo passo 1]
2. [Próximo passo 2]
3. [Próximo passo 3]

## 🔗 Links Úteis
- [Documentação completa](URL1)
- [Exemplos](URL2)
- [FAQ](URL3)
EOF

print_message "Feature '$FEATURE_NAME' criada com sucesso!"
print_message "Diretório: $FEATURE_DIR"
print_message ""
print_message "Arquivos criados:"
print_message "  - spec.md (Especificação funcional)"
print_message "  - plan.md (Plano de implementação)"
print_message "  - tasks.md (Lista de tarefas)"
print_message "  - research.md (Pesquisa e análise)"
print_message "  - contracts.md (Contratos e interfaces)"
print_message "  - data-model.md (Modelo de dados)"
print_message "  - quickstart.md (Guia de início rápido)"
print_message ""
print_message "Próximos passos:"
print_message "  1. Edite os arquivos com as informações específicas da feature"
print_message "  2. Revise e ajuste conforme necessário"
print_message "  3. Comece a implementação seguindo o plano"
print_message ""
print_warning "Lembre-se de atualizar os placeholders [texto] com informações reais!"
