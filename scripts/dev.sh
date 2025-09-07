#!/bin/bash

# Script de desenvolvimento para Aquicultura App
# Facilita o gerenciamento da aplicação durante o desenvolvimento

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_message() {
    echo -e "${GREEN}[AQUICULTURA-DEV]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Função para verificar se o Docker está rodando
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker não está rodando. Por favor, inicie o Docker primeiro."
        exit 1
    fi
}

# Função para verificar se os containers estão rodando
check_containers() {
    if ! docker-compose ps | grep -q "Up"; then
        print_warning "Containers não estão rodando. Execute 'start' primeiro."
        return 1
    fi
    return 0
}

# Função de ajuda
show_help() {
    echo -e "${GREEN}Aquicultura App - Script de Desenvolvimento${NC}"
    echo ""
    echo "Uso: $0 [comando]"
    echo ""
    echo "Comandos disponíveis:"
    echo "  start          - Inicia todos os serviços"
    echo "  stop           - Para todos os serviços"
    echo "  restart        - Reinicia todos os serviços"
    echo "  rebuild        - Reconstrói e reinicia todos os serviços"
    echo "  logs           - Mostra logs de todos os serviços"
    echo "  logs-backend   - Mostra logs apenas do backend"
    echo "  logs-frontend  - Mostra logs apenas do frontend"
    echo "  logs-db        - Mostra logs apenas do banco de dados"
    echo "  status         - Mostra status dos containers"
    echo "  shell-backend  - Acessa shell do container backend"
    echo "  shell-db       - Acessa shell do banco de dados"
    echo "  seed           - Executa seed do banco de dados"
    echo "  reset-db       - Reseta o banco de dados (CUIDADO!)"
    echo "  test-api       - Testa endpoints da API"
    echo "  backup         - Cria backup do banco de dados"
    echo "  clean          - Remove containers, volumes e imagens"
    echo "  health         - Verifica saúde dos serviços"
    echo "  help           - Mostra esta ajuda"
    echo ""
}

# Função para iniciar serviços
start_services() {
    print_message "Iniciando serviços da Aquicultura App..."
    check_docker
    
    # Criar diretório de config se não existir
    mkdir -p config
    
    # Verificar se arquivo de configuração existe
    if [ ! -f "config/development.env" ]; then
        print_warning "Arquivo config/development.env não encontrado. Criando..."
        # Aqui você poderia copiar de um template
    fi
    
    docker-compose up -d
    print_message "Serviços iniciados!"
    print_info "Frontend: http://localhost:3000"
    print_info "Backend API: http://localhost:8000"
    print_info "Docs API: http://localhost:8000/docs"
    print_info "Banco de dados: localhost:5432"
}

# Função para parar serviços
stop_services() {
    print_message "Parando serviços..."
    docker-compose down
    print_message "Serviços parados!"
}

# Função para reiniciar serviços
restart_services() {
    print_message "Reiniciando serviços..."
    docker-compose restart
    print_message "Serviços reiniciados!"
}

# Função para reconstruir serviços
rebuild_services() {
    print_message "Reconstruindo e reiniciando serviços..."
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    print_message "Serviços reconstruídos e iniciados!"
}

# Função para mostrar logs
show_logs() {
    if [ "$1" = "backend" ]; then
        docker-compose logs -f backend
    elif [ "$1" = "frontend" ]; then
        docker-compose logs -f frontend
    elif [ "$1" = "db" ]; then
        docker-compose logs -f db
    else
        docker-compose logs -f
    fi
}

# Função para mostrar status
show_status() {
    print_message "Status dos containers:"
    docker-compose ps
    echo ""
    print_message "Uso de recursos:"
    docker stats --no-stream
}

# Função para acessar shell do backend
backend_shell() {
    check_containers || return 1
    print_message "Acessando shell do backend..."
    docker-compose exec backend /bin/bash
}

# Função para acessar shell do banco
db_shell() {
    check_containers || return 1
    print_message "Acessando shell do banco de dados..."
    docker-compose exec db psql -U aquicultura_user -d aquicultura_db
}

# Função para executar seed
run_seed() {
    check_containers || return 1
    print_message "Executando seed do banco de dados..."
    docker-compose exec backend python -c "from app.db.seed import seed_database; seed_database()"
    print_message "Seed executado com sucesso!"
}

# Função para resetar banco
reset_database() {
    print_warning "ATENÇÃO: Esta operação irá apagar todos os dados do banco!"
    read -p "Tem certeza que deseja continuar? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_message "Resetando banco de dados..."
        docker-compose down
        docker volume rm aquicultura-app_pgdata 2>/dev/null || true
        docker-compose up -d db
        sleep 10
        docker-compose up -d
        sleep 5
        run_seed
        print_message "Banco de dados resetado!"
    else
        print_message "Operação cancelada."
    fi
}

# Função para testar API
test_api() {
    check_containers || return 1
    print_message "Testando endpoints da API..."
    
    # Teste de health check
    print_info "Testando health check..."
    curl -f http://localhost:8000/health || print_error "Health check falhou"
    
    # Teste de login
    print_info "Testando login..."
    TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/login \
        -H "Content-Type: application/json" \
        -d '{"email": "admin@aquicultura.ao", "password": "admin123456"}' | \
        jq -r '.access_token' 2>/dev/null)
    
    if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
        print_message "Login OK - Token obtido"
        
        # Teste de dashboard stats
        print_info "Testando dashboard stats..."
        curl -f -H "Authorization: Bearer $TOKEN" \
            http://localhost:8000/api/projetos/dashboard/stats > /dev/null && \
            print_message "Dashboard stats OK" || print_error "Dashboard stats falhou"
    else
        print_error "Login falhou"
    fi
}

# Função para criar backup
create_backup() {
    check_containers || return 1
    BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
    print_message "Criando backup: $BACKUP_FILE"
    docker-compose exec -T db pg_dump -U aquicultura_user aquicultura_db > "backups/$BACKUP_FILE"
    print_message "Backup criado em backups/$BACKUP_FILE"
}

# Função para limpar sistema
clean_system() {
    print_warning "Esta operação irá remover containers, volumes e imagens."
    read -p "Tem certeza que deseja continuar? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_message "Limpando sistema..."
        docker-compose down -v --rmi all
        docker system prune -f
        print_message "Sistema limpo!"
    else
        print_message "Operação cancelada."
    fi
}

# Função para verificar saúde dos serviços
check_health() {
    print_message "Verificando saúde dos serviços..."
    
    # Backend
    if curl -f http://localhost:8000/health > /dev/null 2>&1; then
        print_message "✓ Backend: Saudável"
    else
        print_error "✗ Backend: Não responsivo"
    fi
    
    # Frontend
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        print_message "✓ Frontend: Saudável"
    else
        print_error "✗ Frontend: Não responsivo"
    fi
    
    # Banco de dados
    if docker-compose exec -T db pg_isready -U aquicultura_user > /dev/null 2>&1; then
        print_message "✓ Banco de dados: Saudável"
    else
        print_error "✗ Banco de dados: Não responsivo"
    fi
    
    # Redis
    if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
        print_message "✓ Redis: Saudável"
    else
        print_error "✗ Redis: Não responsivo"
    fi
}

# Criar diretório de backups se não existir
mkdir -p backups

# Processar comando
case "$1" in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    rebuild)
        rebuild_services
        ;;
    logs)
        show_logs
        ;;
    logs-backend)
        show_logs backend
        ;;
    logs-frontend)
        show_logs frontend
        ;;
    logs-db)
        show_logs db
        ;;
    status)
        show_status
        ;;
    shell-backend)
        backend_shell
        ;;
    shell-db)
        db_shell
        ;;
    seed)
        run_seed
        ;;
    reset-db)
        reset_database
        ;;
    test-api)
        test_api
        ;;
    backup)
        create_backup
        ;;
    clean)
        clean_system
        ;;
    health)
        check_health
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Comando desconhecido: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
