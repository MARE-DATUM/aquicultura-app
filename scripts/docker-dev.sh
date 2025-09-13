#!/bin/bash

# ===========================================
# SCRIPT DE DESENVOLVIMENTO DOCKER - AQUICULTURA APP
# ===========================================

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

print_header() {
    echo -e "${BLUE}===========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}===========================================${NC}"
}

# Função para verificar se Docker está rodando
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker não está rodando. Por favor, inicie o Docker Desktop."
        exit 1
    fi
    print_message "Docker está rodando ✓"
}

# Função para limpar containers e volumes antigos
cleanup() {
    print_message "Limpando containers e volumes antigos..."
    docker-compose down -v --remove-orphans 2>/dev/null || true
    docker system prune -f
    print_message "Limpeza concluída ✓"
}

# Função para construir as imagens
build() {
    print_message "Construindo imagens Docker..."
    docker-compose build --no-cache
    print_message "Build concluído ✓"
}

# Função para iniciar os serviços
start() {
    print_message "Iniciando serviços..."
    docker-compose up -d
    print_message "Serviços iniciados ✓"
}

# Função para verificar status dos serviços
status() {
    print_message "Verificando status dos serviços..."
    docker-compose ps
    echo ""
    print_message "Health checks:"
    docker-compose exec backend curl -f http://localhost:8000/health 2>/dev/null && echo "Backend: ✓" || echo "Backend: ✗"
    docker-compose exec frontend curl -f http://localhost:80/health 2>/dev/null && echo "Frontend: ✓" || echo "Frontend: ✗"
    docker-compose exec db pg_isready -U aquicultura_user -d aquicultura_db 2>/dev/null && echo "Database: ✓" || echo "Database: ✗"
    docker-compose exec redis redis-cli ping 2>/dev/null && echo "Redis: ✓" || echo "Redis: ✗"
}

# Função para mostrar logs
logs() {
    local service=${1:-""}
    if [ -n "$service" ]; then
        print_message "Mostrando logs do serviço: $service"
        docker-compose logs -f "$service"
    else
        print_message "Mostrando logs de todos os serviços"
        docker-compose logs -f
    fi
}

# Função para parar os serviços
stop() {
    print_message "Parando serviços..."
    docker-compose down
    print_message "Serviços parados ✓"
}

# Função para reiniciar os serviços
restart() {
    print_message "Reiniciando serviços..."
    docker-compose restart
    print_message "Serviços reiniciados ✓"
}

# Função para executar comandos no backend
backend_exec() {
    local cmd=${1:-"bash"}
    print_message "Executando comando no backend: $cmd"
    docker-compose exec backend $cmd
}

# Função para executar comandos no frontend
frontend_exec() {
    local cmd=${1:-"bash"}
    print_message "Executando comando no frontend: $cmd"
    docker-compose exec frontend $cmd
}

# Função para executar comandos no banco de dados
db_exec() {
    local cmd=${1:-"psql -U aquicultura_user -d aquicultura_db"}
    print_message "Executando comando no banco de dados: $cmd"
    docker-compose exec db $cmd
}

# Função para mostrar informações úteis
info() {
    print_header "INFORMAÇÕES DA APLICAÇÃO"
    echo "Frontend: http://localhost:3000"
    echo "Backend API: http://localhost:8000"
    echo "API Docs: http://localhost:8000/docs"
    echo "Database: localhost:5432"
    echo "Redis: localhost:6379"
    echo ""
    print_header "COMANDOS ÚTEIS"
    echo "Ver logs: $0 logs [serviço]"
    echo "Status: $0 status"
    echo "Backend shell: $0 backend"
    echo "Frontend shell: $0 frontend"
    echo "Database shell: $0 db"
    echo "Parar: $0 stop"
    echo "Reiniciar: $0 restart"
}

# Função para setup completo
setup() {
    print_header "SETUP COMPLETO - AQUICULTURA APP"
    check_docker
    cleanup
    build
    start
    
    print_message "Aguardando serviços ficarem prontos..."
    sleep 30
    
    status
    info
}

# Menu principal
case "${1:-setup}" in
    "setup")
        setup
        ;;
    "start")
        check_docker
        start
        status
        ;;
    "stop")
        stop
        ;;
    "restart")
        restart
        status
        ;;
    "build")
        check_docker
        build
        ;;
    "cleanup")
        cleanup
        ;;
    "status")
        status
        ;;
    "logs")
        logs "$2"
        ;;
    "backend")
        backend_exec "${2:-bash}"
        ;;
    "frontend")
        frontend_exec "${2:-bash}"
        ;;
    "db")
        db_exec "$2"
        ;;
    "info")
        info
        ;;
    *)
        print_header "AQUICULTURA APP - DOCKER DEV SCRIPT"
        echo "Uso: $0 [comando] [opções]"
        echo ""
        echo "Comandos disponíveis:"
        echo "  setup     - Setup completo (padrão)"
        echo "  start     - Iniciar serviços"
        echo "  stop      - Parar serviços"
        echo "  restart   - Reiniciar serviços"
        echo "  build     - Construir imagens"
        echo "  cleanup   - Limpar containers e volumes"
        echo "  status    - Verificar status"
        echo "  logs      - Ver logs [serviço]"
        echo "  backend   - Shell do backend [comando]"
        echo "  frontend  - Shell do frontend [comando]"
        echo "  db        - Shell do banco [comando]"
        echo "  info      - Mostrar informações"
        echo ""
        echo "Exemplos:"
        echo "  $0 setup"
        echo "  $0 logs backend"
        echo "  $0 backend python -c 'print(\"Hello\")'"
        echo "  $0 db 'SELECT version();'"
        ;;
esac
