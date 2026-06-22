# FF Management System - Stop Development Services

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Stopping FF Management System services...${NC}"

echo "Stopping backend..."
pkill -f "manage.py runserver" 2>/dev/null || true
pkill -f "python3.*manage.py" 2>/dev/null || true

echo "Stopping frontend..."
pkill -f "next dev" 2>/dev/null || true
pkill -f "next-server" 2>/dev/null || true

# Optional: Stop database container
# Uncomment the lines below if you want to stop the database too
# echo "Stopping database container..."
# cd "$(dirname "${BASH_SOURCE[0]}")"
# docker-compose stop db

echo -e "${GREEN}✓ All services stopped${NC}"

