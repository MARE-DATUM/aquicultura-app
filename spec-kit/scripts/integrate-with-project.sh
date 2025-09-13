#!/bin/bash

# Script para integrar o Spec Kit com projetos existentes
# Uso: ./integrate-with-project.sh

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

print_message "Integrando Spec Kit com projeto Aquicultura App..."

# Verificar se estamos no diretório correto
if [ ! -d "frontend" ] || [ ! -d "backend" ] || [ ! -f "docker-compose.yml" ]; then
    print_error "Este script deve ser executado no diretório raiz do projeto!"
    exit 1
fi

# Criar links simbólicos para facilitar acesso
print_message "Criando links simbólicos..."

# Link para scripts
if [ ! -L "create-feature" ]; then
    ln -s spec-kit/scripts/create-new-feature.sh create-feature
    print_message "Criado link: create-feature -> spec-kit/scripts/create-new-feature.sh"
fi

if [ ! -L "setup-plan" ]; then
    ln -s spec-kit/scripts/setup-plan.sh setup-plan
    print_message "Criado link: setup-plan -> spec-kit/scripts/setup-plan.sh"
fi

# Criar arquivo de configuração do projeto
print_message "Criando arquivo de configuração do projeto..."

cat > spec-kit/project-config.json << EOF
{
  "project": {
    "name": "Aquicultura App",
    "description": "Sistema de gestão de aquicultura com dashboard, mapas e auditoria",
    "version": "1.0.0",
    "techStack": {
      "frontend": "React + TypeScript + Vite",
      "backend": "Python + FastAPI + SQLAlchemy",
      "database": "PostgreSQL",
      "infrastructure": "Docker + Docker Compose"
    },
    "directories": {
      "frontend": "frontend/",
      "backend": "backend/",
      "docs": "docs/",
      "specs": "spec-kit/specs/"
    }
  },
  "standards": {
    "codeCoverage": 80,
    "maxCyclomaticComplexity": 10,
    "maxFunctionLength": 50,
    "maxFileLength": 300
  },
  "processes": {
    "codeReview": true,
    "automatedTesting": true,
    "documentationRequired": true,
    "specificationRequired": true
  },
  "tools": {
    "testing": {
      "frontend": "Vitest + Playwright",
      "backend": "pytest + FastAPI TestClient"
    },
    "linting": {
      "frontend": "ESLint + Prettier",
      "backend": "Black + isort + flake8"
    },
    "documentation": {
      "api": "OpenAPI/Swagger",
      "general": "Markdown"
    }
  }
}
EOF

print_message "Arquivo de configuração criado: spec-kit/project-config.json"

# Criar arquivo de integração com o projeto
print_message "Criando arquivo de integração..."

cat > spec-kit/integration.md << EOF
# Integração Spec Kit - Aquicultura App

## 🎯 Status da Integração

**Data de Integração:** $(date +"%Y-%m-%d")  
**Versão do Spec Kit:** 1.0.0  
**Status:** Ativo  

## 📋 Features Integradas

### Features Existentes
- [ ] **Dashboard Principal** - Sistema de visualização de dados
- [ ] **Gestão de Projetos** - CRUD de projetos de aquicultura
- [ ] **Sistema de Mapas** - Visualização geográfica de dados
- [ ] **Auditoria** - Sistema de logs e auditoria
- [ ] **Gestão de Utilizadores** - Sistema de usuários e permissões
- [ ] **Indicadores** - Métricas e KPIs
- [ ] **Licenciamentos** - Gestão de licenças
- [ ] **Eixos 5W2H** - Análise de projetos

### Features em Desenvolvimento
- [ ] **Sistema de Notificações** - Notificações em tempo real
- [ ] **Relatórios Avançados** - Geração de relatórios
- [ ] **API Externa** - Integração com sistemas externos

## 🔧 Configuração do Projeto

### Estrutura de Diretórios
\`\`\`
aquicultura-app/
├── frontend/           # Aplicação React
├── backend/            # API FastAPI
├── docs/              # Documentação geral
├── spec-kit/          # Spec Kit e templates
│   ├── specs/         # Especificações das features
│   ├── templates/     # Templates para especificações
│   ├── scripts/       # Scripts de automação
│   └── memory/        # Constituição e memória
└── docker-compose.yml # Configuração Docker
\`\`\`

### Scripts Disponíveis
- \`./create-feature "Nome da Feature"\` - Criar nova feature
- \`./setup-plan "caminho/spec.md"\` - Configurar plano de implementação

## 📊 Métricas do Projeto

### Cobertura de Testes
- **Frontend:** [A definir]%
- **Backend:** [A definir]%
- **E2E:** [A definir]%

### Qualidade do Código
- **Complexidade Ciclomática:** [A definir]
- **Duplicação:** [A definir]%
- **Manutenibilidade:** [A definir]

### Documentação
- **Especificações:** [A definir] features documentadas
- **APIs:** [A definir]% documentadas
- **README:** [A definir]% atualizado

## 🚀 Próximos Passos

### Curto Prazo (1-2 semanas)
1. [ ] Documentar features existentes
2. [ ] Implementar testes para features críticas
3. [ ] Configurar CI/CD com Spec Kit
4. [ ] Treinar equipe no uso do Spec Kit

### Médio Prazo (1-2 meses)
1. [ ] Migrar todas as features para Spec Kit
2. [ ] Implementar métricas de qualidade
3. [ ] Automatizar geração de documentação
4. [ ] Criar templates específicos do projeto

### Longo Prazo (3-6 meses)
1. [ ] Integrar com ferramentas de monitoramento
2. [ ] Implementar feedback loop automático
3. [ ] Otimizar processo baseado em métricas
4. [ ] Expandir para outros projetos

## 📝 Notas de Integração

### Adaptações Necessárias
- [ ] Ajustar templates para stack tecnológico do projeto
- [ ] Configurar scripts para estrutura de diretórios
- [ ] Adaptar constituição para contexto do projeto
- [ ] Integrar com ferramentas existentes

### Benefícios Esperados
- [ ] Melhoria na qualidade do código
- [ ] Redução no tempo de desenvolvimento
- [ ] Melhoria na documentação
- [ ] Padronização do processo
- [ ] Facilitação da colaboração

## 🔗 Links Úteis

- [Documentação do Projeto](../README.md)
- [Spec Kit README](./README.md)
- [Constituição](./memory/constitution.md)
- [Templates](./templates/)

## 📞 Suporte

Para dúvidas sobre a integração:
1. Consulte a documentação
2. Verifique os scripts disponíveis
3. Entre em contato com a equipe
EOF

print_message "Arquivo de integração criado: spec-kit/integration.md"

# Criar script de verificação de integridade
print_message "Criando script de verificação..."

cat > spec-kit/scripts/check-integration.sh << 'EOF'
#!/bin/bash

# Script para verificar integridade da integração do Spec Kit
# Uso: ./check-integration.sh

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

print_message "Verificando integridade da integração do Spec Kit..."

# Verificar estrutura de diretórios
print_message "Verificando estrutura de diretórios..."

required_dirs=("spec-kit" "spec-kit/templates" "spec-kit/scripts" "spec-kit/memory" "spec-kit/specs")
for dir in "${required_dirs[@]}"; do
    if [ -d "$dir" ]; then
        print_message "✓ Diretório $dir existe"
    else
        print_error "✗ Diretório $dir não encontrado"
        exit 1
    fi
done

# Verificar arquivos essenciais
print_message "Verificando arquivos essenciais..."

required_files=(
    "spec-kit/README.md"
    "spec-kit/memory/constitution.md"
    "spec-kit/templates/spec-template.md"
    "spec-kit/templates/plan-template.md"
    "spec-kit/templates/tasks-template.md"
    "spec-kit/scripts/create-new-feature.sh"
    "spec-kit/scripts/setup-plan.sh"
    "spec-kit/project-config.json"
    "spec-kit/integration.md"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        print_message "✓ Arquivo $file existe"
    else
        print_error "✗ Arquivo $file não encontrado"
        exit 1
    fi
done

# Verificar permissões dos scripts
print_message "Verificando permissões dos scripts..."

scripts=("spec-kit/scripts/create-new-feature.sh" "spec-kit/scripts/setup-plan.sh")
for script in "${scripts[@]}"; do
    if [ -x "$script" ]; then
        print_message "✓ Script $script é executável"
    else
        print_warning "⚠ Script $script não é executável, corrigindo..."
        chmod +x "$script"
        print_message "✓ Permissão corrigida para $script"
    fi
done

# Verificar links simbólicos
print_message "Verificando links simbólicos..."

if [ -L "create-feature" ]; then
    print_message "✓ Link create-feature existe"
else
    print_warning "⚠ Link create-feature não encontrado"
fi

if [ -L "setup-plan" ]; then
    print_message "✓ Link setup-plan existe"
else
    print_warning "⚠ Link setup-plan não encontrado"
fi

# Verificar configuração MCP
print_message "Verificando configuração MCP..."

if [ -f "$HOME/.cursor/mcp.json" ]; then
    if grep -q "spec-kit" "$HOME/.cursor/mcp.json"; then
        print_message "✓ Spec Kit configurado no MCP"
    else
        print_warning "⚠ Spec Kit não encontrado na configuração MCP"
    fi
else
    print_warning "⚠ Arquivo de configuração MCP não encontrado"
fi

# Verificar features existentes
print_message "Verificando features existentes..."

if [ -d "spec-kit/specs" ] && [ "$(ls -A spec-kit/specs 2>/dev/null)" ]; then
    feature_count=$(find spec-kit/specs -maxdepth 1 -type d | wc -l)
    print_message "✓ $((feature_count - 1)) features encontradas"
else
    print_warning "⚠ Nenhuma feature encontrada em spec-kit/specs"
fi

print_message "Verificação concluída!"
print_message ""
print_message "Status da integração:"
print_message "  - Estrutura: ✓ OK"
print_message "  - Arquivos: ✓ OK"
print_message "  - Scripts: ✓ OK"
print_message "  - Links: ⚠ Verificar manualmente"
print_message "  - MCP: ⚠ Verificar manualmente"
print_message ""
print_message "Para usar o Spec Kit:"
print_message "  - ./create-feature \"Nome da Feature\""
print_message "  - ./setup-plan \"caminho/spec.md\""
EOF

chmod +x spec-kit/scripts/check-integration.sh
print_message "Script de verificação criado: spec-kit/scripts/check-integration.sh"

# Criar link para script de verificação
if [ ! -L "check-spec-kit" ]; then
    ln -s spec-kit/scripts/check-integration.sh check-spec-kit
    print_message "Criado link: check-spec-kit -> spec-kit/scripts/check-integration.sh"
fi

# Executar verificação
print_message "Executando verificação inicial..."
./spec-kit/scripts/check-integration.sh

print_message "Integração do Spec Kit concluída!"
print_message ""
print_message "Scripts disponíveis:"
print_message "  - ./create-feature \"Nome da Feature\""
print_message "  - ./setup-plan \"caminho/spec.md\""
print_message "  - ./check-spec-kit"
print_message ""
print_message "Próximos passos:"
print_message "  1. Teste os scripts criados"
print_message "  2. Crie uma feature de exemplo"
print_message "  3. Configure o MCP no Cursor"
print_message "  4. Comece a usar o Spec Kit!"
print_message ""
print_warning "Lembre-se de reiniciar o Cursor após configurar o MCP!"
