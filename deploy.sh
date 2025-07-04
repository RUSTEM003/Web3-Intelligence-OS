#!/bin/bash


set -e

echo "Начинаем развертывание MEDTOUR платформы..."
echo "=================================================="

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

check_system() {
    log "Проверка системных требований..."
    
    if ! command -v node &> /dev/null; then
        error "Node.js не установлен. Установите Node.js 18+ и повторите попытку."
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        error "Требуется Node.js версии 18 или выше. Текущая версия: $(node -v)"
    fi
    
    if ! command -v npm &> /dev/null; then
        error "npm не установлен."
    fi
    
    log "Системные требования выполнены"
}

install_dependencies() {
    log "Установка зависимостей..."
    
    if [ -f "package-lock.json" ]; then
        npm ci
    else
        npm install
    fi
    
    log "Зависимости установлены"
}

install_pm2() {
    log "Установка PM2..."
    
    if ! command -v pm2 &> /dev/null; then
        npm install -g pm2
        log "PM2 установлен"
    else
        info "PM2 уже установлен: $(pm2 -v)"
    fi
}

generate_sitemaps() {
    log "Генерация sitemap файлов..."
    
    node scripts/generate-sitemap-doctors.js
    node scripts/generate-sitemap-videos.js
    
    log "Sitemap файлы сгенерированы"
}

setup_environment() {
    log "Настройка окружения..."
    
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            warning "Создан файл .env из .env.example. Пожалуйста, настройте переменные окружения."
        else
            error "Файл .env.example не найден"
        fi
    fi
    
    mkdir -p logs public images
    
    log "Окружение настроено"
}

start_with_pm2() {
    log "Запуск приложения через PM2..."
    
    pm2 delete medtour 2>/dev/null || true
    
    pm2 start ecosystem.config.js
    pm2 save
    
    if ! pm2 startup | grep -q "already"; then
        warning "Для настройки автозапуска выполните команду, которую предложит PM2:"
        pm2 startup
    fi
    
    log "Приложение запущено через PM2"
}

start_with_docker() {
    log "Запуск приложения через Docker..."
    
    if ! command -v docker &> /dev/null; then
        error "Docker не установлен"
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose не установлен"
    fi
    
    docker-compose down 2>/dev/null || true
    
    docker-compose up --build -d
    
    log "Приложение запущено через Docker"
}

check_status() {
    log "Проверка статуса приложения..."
    
    sleep 5
    
    if curl -f http://localhost:3000/health &> /dev/null; then
        log "Приложение работает корректно"
        info "Приложение доступно по адресу: http://localhost:3000"
    else
        error "Приложение не отвечает на health check"
    fi
}

show_stats() {
    echo ""
    echo "=================================================="
    echo "MEDTOUR платформа успешно развернута!"
    echo "=================================================="
    echo ""
    echo "Статистика развертывания:"
    echo "• Время развертывания: $(date)"
    echo "• Node.js версия: $(node -v)"
    echo "• npm версия: $(npm -v)"
    echo "• PM2 версия: $(pm2 -v 2>/dev/null || echo 'не установлен')"
    echo ""
    echo "Полезные ссылки:"
    echo "• Главная страница: http://localhost:3000"
    echo "• Health check: http://localhost:3000/health"
    echo "• API врачей: http://localhost:3000/api/doctors"
    echo "• API видео: http://localhost:3000/api/videos"
    echo ""
    echo "Управление PM2:"
    echo "• Статус: pm2 status"
    echo "• Логи: pm2 logs medtour"
    echo "• Перезапуск: pm2 restart medtour"
    echo "• Остановка: pm2 stop medtour"
    echo ""
    echo "Управление Docker:"
    echo "• Статус: docker-compose ps"
    echo "• Логи: docker-compose logs -f"
    echo "• Остановка: docker-compose down"
    echo ""
    echo "Платформа готова к работе!"
}

main() {
    echo "MEDTOUR - Глобальная AI-платформа для Турецкой медицины"
    echo "Автоматическое развертывание в один клик"
    echo ""
    
    DEPLOYMENT_MODE="pm2"
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --docker)
                DEPLOYMENT_MODE="docker"
                shift
                ;;
            --pm2)
                DEPLOYMENT_MODE="pm2"
                shift
                ;;
            --help|-h)
                echo "Использование: $0 [--docker|--pm2]"
                echo ""
                echo "Опции:"
                echo "  --pm2     Развертывание через PM2 (по умолчанию)"
                echo "  --docker  Развертывание через Docker"
                echo "  --help    Показать эту справку"
                exit 0
                ;;
            *)
                error "Неизвестный параметр: $1"
                ;;
        esac
    done
    
    info "Режим развертывания: $DEPLOYMENT_MODE"
    echo ""
    
    check_system
    setup_environment
    install_dependencies
    generate_sitemaps
    
    if [ "$DEPLOYMENT_MODE" = "docker" ]; then
        start_with_docker
    else
        install_pm2
        start_with_pm2
    fi
    
    check_status
    show_stats
}

trap 'error "Развертывание прервано пользователем"' INT TERM

main "$@"
