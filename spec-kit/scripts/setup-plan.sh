#!/bin/bash

# Script para configurar um plano de implementação baseado em uma especificação
# Uso: ./setup-plan.sh "caminho/para/spec.md"

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se o arquivo de especificação foi fornecido
if [ $# -eq 0 ]; then
    print_error "Caminho para o arquivo de especificação é obrigatório!"
    echo "Uso: $0 \"caminho/para/spec.md\""
    exit 1
fi

SPEC_FILE="$1"
SPEC_DIR=$(dirname "$SPEC_FILE")

# Verificar se o arquivo existe
if [ ! -f "$SPEC_FILE" ]; then
    print_error "Arquivo de especificação não encontrado: $SPEC_FILE"
    exit 1
fi

print_message "Configurando plano baseado em: $SPEC_FILE"

# Extrair informações da especificação
FEATURE_NAME=$(grep "^# " "$SPEC_FILE" | head -1 | sed 's/^# //' | sed 's/ - Especificação Funcional$//')
AUTHOR=$(grep "**Autor:**" "$SPEC_FILE" | sed 's/.*\*\*Autor:\*\* //')
DATE=$(grep "**Data de Criação:**" "$SPEC_FILE" | sed 's/.*\*\*Data de Criação:\*\* //')

print_message "Feature: $FEATURE_NAME"
print_message "Autor: $AUTHOR"
print_message "Data: $DATE"

# Criar arquivo de plano se não existir
PLAN_FILE="$SPEC_DIR/plan.md"
if [ ! -f "$PLAN_FILE" ]; then
    print_message "Criando arquivo de plano: $PLAN_FILE"
    
    cat > "$PLAN_FILE" << EOF
# $FEATURE_NAME - Plano de Implementação

## 📋 Resumo Executivo
**Feature:** $FEATURE_NAME  
**Estimativa Total:** [A definir] horas  
**Prazo:** [A definir]  
**Equipe:** [A definir]  
**Autor:** $AUTHOR  
**Data de Criação:** $DATE  

## 🎯 Objetivos da Implementação
- [Objetivo 1 - extrair da especificação]
- [Objetivo 2 - extrair da especificação]
- [Objetivo 3 - extrair da especificação]

## 🏗️ Arquitetura Técnica
### Stack Tecnológico
- **Frontend:** [A definir baseado nos requisitos]
- **Backend:** [A definir baseado nos requisitos]
- **Banco de Dados:** [A definir baseado no modelo de dados]
- **Infraestrutura:** [A definir]

### Componentes Principais
- **[Componente 1]**
  - Responsabilidade: [Extrair da especificação]
  - Dependências: [A definir]

## 📅 Cronograma de Implementação
### Fase 1: Preparação (2-3 dias)
- [ ] **Setup do ambiente de desenvolvimento**
  - [ ] Configuração do repositório
  - [ ] Setup das dependências
  - [ ] Configuração do CI/CD
- [ ] **Análise técnica detalhada**
  - [ ] Revisão da arquitetura
  - [ ] Definição de padrões de código
  - [ ] Setup de ferramentas de qualidade

### Fase 2: Desenvolvimento Core (5-10 dias)
- [ ] **Implementação do backend**
  - [ ] [Tarefa 1] (2h)
  - [ ] [Tarefa 2] (3h)
  - [ ] [Tarefa 3] (4h)
- [ ] **Implementação do frontend**
  - [ ] [Tarefa 4] (3h)
  - [ ] [Tarefa 5] (2h)
  - [ ] [Tarefa 6] (4h)
- [ ] **Implementação do banco de dados**
  - [ ] [Tarefa 7] (2h)
  - [ ] [Tarefa 8] (3h)

### Fase 3: Integração e Testes (3-5 dias)
- [ ] **Integração de componentes**
  - [ ] [Tarefa 9] (4h)
  - [ ] [Tarefa 10] (3h)
- [ ] **Testes e validação**
  - [ ] [Tarefa 11] (3h)
  - [ ] [Tarefa 12] (2h)

### Fase 4: Deploy e Monitoramento (1-2 dias)
- [ ] **Preparação para produção**
  - [ ] [Tarefa 13] (2h)
  - [ ] [Tarefa 14] (1h)
- [ ] **Monitoramento e ajustes**
  - [ ] [Tarefa 15] (1h)

## 👥 Recursos e Responsabilidades
### Equipe de Desenvolvimento
- **Desenvolvedor Backend:** [Nome]
  - Responsabilidades: Implementação da API, banco de dados, lógica de negócio
- **Desenvolvedor Frontend:** [Nome]
  - Responsabilidades: Interface de usuário, integração com API
- **QA/Testes:** [Nome]
  - Responsabilidades: Testes, validação, documentação

### Stakeholders
- **Product Owner:** [Nome]
  - Envolvimento: Definição de requisitos, validação de funcionalidades
- **Designer UX/UI:** [Nome]
  - Envolvimento: Design da interface, validação de usabilidade

## ⚠️ Riscos e Mitigações
### Riscos Técnicos
- **Complexidade da integração**
  - Probabilidade: Média
  - Impacto: Alto
  - Mitigação: Prototipagem antecipada, testes de integração contínuos

- **Performance inadequada**
  - Probabilidade: Baixa
  - Impacto: Médio
  - Mitigação: Testes de performance, otimização contínua

### Riscos de Prazo
- **Atraso na entrega**
  - Probabilidade: Média
  - Impacto: Alto
  - Mitigação: Buffer de tempo, priorização de funcionalidades

## 🧪 Estratégia de Testes
### Testes Unitários
- **Cobertura mínima:** 80%
- **Ferramentas:** Jest, Vitest, ou similar
- **Responsável:** Desenvolvedores

### Testes de Integração
- **Ambiente:** Staging
- **Cenários:** Fluxos principais da aplicação
- **Responsável:** QA

### Testes E2E
- **Ferramentas:** Playwright, Cypress, ou similar
- **Cenários críticos:** [Extrair da especificação]
- **Responsável:** QA

## 📊 Métricas de Sucesso
### Métricas Técnicas
- **Performance:** Tempo de resposta < 200ms
- **Disponibilidade:** 99.9%
- **Qualidade do código:** Cobertura de testes > 80%

### Métricas de Negócio
- **[Métrica 1]:** [Extrair da especificação]
- **[Métrica 2]:** [Extrair da especificação]

## 🔄 Processo de Deploy
### Ambientes
1. **Desenvolvimento**
   - Branch: \`develop\`
   - Deploy: Automático
   - Validação: Testes unitários

2. **Staging**
   - Branch: \`staging\`
   - Deploy: Manual
   - Validação: Testes de integração

3. **Produção**
   - Branch: \`main\`
   - Deploy: Manual com aprovação
   - Validação: Testes E2E

### Rollback Plan
- **Trigger:** Falha crítica em produção
- **Processo:** Reversão para versão anterior estável
- **Tempo estimado:** 15 minutos

## 📚 Documentação
### Documentos a Criar
- [ ] **Documentação técnica**
  - [ ] README.md atualizado
  - [ ] API documentation
  - [ ] Arquitetura de sistema
- [ ] **Documentação de usuário**
  - [ ] User guide
  - [ ] FAQ
  - [ ] Troubleshooting guide

## 🔗 Dependências Externas
### APIs Externas
- **[API 1]**
  - Status: [Verificar disponibilidade]
  - SLA: [Verificar SLA]
  - Contato: [Definir contato]

### Serviços Terceiros
- **[Serviço 1]**
  - Propósito: [Extrair da especificação]
  - Status: [Verificar status]
  - SLA: [Verificar SLA]

## 📝 Notas e Considerações
- [Nota 1 - extrair da especificação]
- [Nota 2 - extrair da especificação]
- [Nota 3 - extrair da especificação]

## 🔗 Referências
- [Referência 1 - extrair da especificação](URL1)
- [Referência 2 - extrair da especificação](URL2)
EOF

    print_message "Arquivo de plano criado: $PLAN_FILE"
else
    print_warning "Arquivo de plano já existe: $PLAN_FILE"
fi

# Criar arquivo de tarefas se não existir
TASKS_FILE="$SPEC_DIR/tasks.md"
if [ ! -f "$TASKS_FILE" ]; then
    print_message "Criando arquivo de tarefas: $TASKS_FILE"
    
    cat > "$TASKS_FILE" << EOF
# $FEATURE_NAME - Lista de Tarefas

## 📋 Resumo
**Feature:** $FEATURE_NAME  
**Total de Tarefas:** [A definir]  
**Estimativa Total:** [A definir] horas  
**Status Geral:** Em Desenvolvimento  

## 🎯 Tarefas por Categoria

### 🏗️ Infraestrutura e Setup
| ID | Tarefa | Estimativa | Prioridade | Status | Responsável |
|----|--------|------------|------------|--------|-------------|
| T001 | Setup do ambiente de desenvolvimento | 2h | Alta | Pendente | [Responsável] |
| T002 | Configuração do repositório | 1h | Alta | Pendente | [Responsável] |
| T003 | Setup do CI/CD | 2h | Média | Pendente | [Responsável] |

### 🎨 Frontend
| ID | Tarefa | Estimativa | Prioridade | Status | Responsável |
|----|--------|------------|------------|--------|-------------|
| T004 | [Tarefa frontend 1] | [X]h | [Prioridade] | Pendente | [Responsável] |
| T005 | [Tarefa frontend 2] | [X]h | [Prioridade] | Pendente | [Responsável] |

### 🔧 Backend
| ID | Tarefa | Estimativa | Prioridade | Status | Responsável |
|----|--------|------------|------------|--------|-------------|
| T006 | [Tarefa backend 1] | [X]h | [Prioridade] | Pendente | [Responsável] |
| T007 | [Tarefa backend 2] | [X]h | [Prioridade] | Pendente | [Responsável] |

### 🗄️ Banco de Dados
| ID | Tarefa | Estimativa | Prioridade | Status | Responsável |
|----|--------|------------|------------|--------|-------------|
| T008 | [Tarefa banco 1] | [X]h | [Prioridade] | Pendente | [Responsável] |
| T009 | [Tarefa banco 2] | [X]h | [Prioridade] | Pendente | [Responsável] |

### 🧪 Testes
| ID | Tarefa | Estimativa | Prioridade | Status | Responsável |
|----|--------|------------|------------|--------|-------------|
| T010 | [Tarefa teste 1] | [X]h | [Prioridade] | Pendente | [Responsável] |
| T011 | [Tarefa teste 2] | [X]h | [Prioridade] | Pendente | [Responsável] |

### 📚 Documentação
| ID | Tarefa | Estimativa | Prioridade | Status | Responsável |
|----|--------|------------|------------|--------|-------------|
| T012 | [Tarefa doc 1] | [X]h | [Prioridade] | Pendente | [Responsável] |
| T013 | [Tarefa doc 2] | [X]h | [Prioridade] | Pendente | [Responsável] |

## 📅 Cronograma Detalhado

### Semana 1 ([Datas])
- **Segunda-feira:** Setup do ambiente, configuração inicial
- **Terça-feira:** [Tarefas específicas]
- **Quarta-feira:** [Tarefas específicas]
- **Quinta-feira:** [Tarefas específicas]
- **Sexta-feira:** [Tarefas específicas]

### Semana 2 ([Datas])
- **Segunda-feira:** [Tarefas específicas]
- **Terça-feira:** [Tarefas específicas]
- **Quarta-feira:** [Tarefas específicas]
- **Quinta-feira:** [Tarefas específicas]
- **Sexta-feira:** [Tarefas específicas]

## 🔄 Dependências entre Tarefas
### Dependências Críticas
- T001 → T004 (Setup deve ser feito antes do desenvolvimento)
- T001 → T006 (Setup deve ser feito antes do desenvolvimento)
- T008 → T009 (Migrações devem ser feitas em ordem)

### Dependências Parciais
- T004 → T010 (Frontend deve estar pronto para testes)
- T006 → T011 (Backend deve estar pronto para testes)

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

### Progresso por Categoria
- **Infraestrutura:** 0%
- **Frontend:** 0%
- **Backend:** 0%
- **Banco de Dados:** 0%
- **Testes:** 0%
- **Documentação:** 0%

## 🎯 Próximas Ações
### Esta Semana
- [ ] [Ação 1]
- [ ] [Ação 2]
- [ ] [Ação 3]

### Próxima Semana
- [ ] [Ação 4]
- [ ] [Ação 5]
- [ ] [Ação 6]

## 📝 Notas e Observações
- [Nota 1]
- [Nota 2]
- [Nota 3]

## 🔗 Links Úteis
- [Link 1](URL1)
- [Link 2](URL2)
- [Link 3](URL3)
EOF

    print_message "Arquivo de tarefas criado: $TASKS_FILE"
else
    print_warning "Arquivo de tarefas já existe: $TASKS_FILE"
fi

print_message "Configuração do plano concluída!"
print_message ""
print_message "Arquivos criados/atualizados:"
print_message "  - $PLAN_FILE"
print_message "  - $TASKS_FILE"
print_message ""
print_message "Próximos passos:"
print_message "  1. Revise e ajuste o plano de implementação"
print_message "  2. Defina as tarefas específicas baseadas na especificação"
print_message "  3. Atribua responsáveis e estimativas"
print_message "  4. Comece a implementação seguindo o plano"
print_message ""
print_warning "Lembre-se de personalizar os placeholders [texto] com informações específicas!"
