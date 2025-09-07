#!/bin/bash

# Script para executar o seed do banco de dados
# Uso: ./scripts/seed.sh

echo "🌱 Executando seed do banco de dados..."

# Verificar se o arquivo .env existe
if [ ! -f .env ]; then
    echo "❌ Arquivo .env não encontrado. Copie .env.example para .env e configure as variáveis."
    exit 1
fi

# Carregar variáveis do .env
set -a
source .env
set +a

# Verificar se o container do backend está rodando
if ! docker compose ps backend | grep -q "Up"; then
    echo "❌ Container do backend não está rodando. Execute 'docker-compose up -d' primeiro."
    exit 1
fi

# Executar seed
echo "📊 Executando seed..."
docker compose exec backend python -c "from app.db.seed import seed_database; seed_database()"

if [ $? -eq 0 ]; then
    echo "✅ Seed executado com sucesso!"
    echo ""
    echo "📋 Credenciais de acesso:"
    echo "ROOT: $ADMIN_EMAIL / $ADMIN_PASSWORD"
    echo "Gestão de Dados: gestao@aquicultura.ao / gestao123456"
    echo "Visualização: visualizacao@aquicultura.ao / visualizacao123456"
    echo ""
    echo "🌐 Acesse a aplicação em: http://localhost:3000"
else
    echo "❌ Erro ao executar seed"
    exit 1
fi
