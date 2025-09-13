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
