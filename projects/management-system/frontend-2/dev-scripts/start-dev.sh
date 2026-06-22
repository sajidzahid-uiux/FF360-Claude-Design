# FF Management System - Development Startup Script
# This script starts both backend and frontend services locally

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
ENV_FILE="$PROJECT_ROOT/.env"
PID_FILE="$PROJECT_ROOT/.dev-server.pid"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}FF Management System - Dev Mode${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}Error: .env file not found at $ENV_FILE${NC}"
    echo "Please create a .env file in the project root"
    exit 1
fi

echo -e "${YELLOW}Loading environment variables...${NC}"
set -a
source "$ENV_FILE"
set +a

echo -e "${YELLOW}Checking database container...${NC}"
if ! docker ps | grep -q "db"; then
    echo -e "${YELLOW}Starting database container...${NC}"
    cd "$PROJECT_ROOT"
    docker-compose up -d db
    echo -e "${GREEN}Database container started${NC}"
    echo -e "${YELLOW}Waiting for database to be ready...${NC}"
    sleep 5
else
    echo -e "${GREEN}Database container already running${NC}"
fi

cleanup() {
    echo -e "\n${YELLOW}Stopping services...${NC}"
    
    if [ -f "$PID_FILE" ]; then
        while read pid; do
            kill $pid 2>/dev/null || true
        done < "$PID_FILE"
        rm -f "$PID_FILE"
    fi
    
    pkill -f "manage.py runserver" 2>/dev/null || true
    pkill -f "next dev" 2>/dev/null || true
    
    echo -e "${GREEN}Services stopped${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

echo ""
echo -e "${YELLOW}Starting Django backend...${NC}"
cd "$BACKEND_DIR"

if ! python3 -c "import django" 2>/dev/null; then
    echo -e "${YELLOW}Django not found. Installing backend dependencies...${NC}"
    pip3 install -r requirements.txt --user
fi

echo -e "${YELLOW}Running database migrations...${NC}"
python3 manage.py migrate --noinput 2>&1 | head -5

echo -e "${YELLOW}Starting backend server...${NC}"
python3 manage.py runserver 0.0.0.0:8000 > /tmp/ff-backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > "$PID_FILE"

sleep 4
if ps -p $BACKEND_PID > /dev/null; then
    echo -e "${GREEN}✓ Backend started on http://localhost:8000${NC}"
    echo -e "  Logs: tail -f /tmp/ff-backend.log"
else
    echo -e "${RED}✗ Backend failed to start${NC}"
    echo -e "${YELLOW}Last 20 lines from backend log:${NC}"
    tail -20 /tmp/ff-backend.log 2>/dev/null || echo "No log file found"
    exit 1
fi

echo ""
echo -e "${YELLOW}Starting Next.js frontend...${NC}"
cd "$FRONTEND_DIR"

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}node_modules not found. Installing frontend dependencies...${NC}"
    npm install
fi


echo -e "${YELLOW}Starting frontend server...${NC}"
npm run dev > /tmp/ff-frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID >> "$PID_FILE"

sleep 4
if ps -p $FRONTEND_PID > /dev/null; then
    echo -e "${GREEN}✓ Frontend started on http://localhost:3000${NC}"
    echo -e "  Logs: tail -f /tmp/ff-frontend.log"
else
    echo -e "${RED}✗ Frontend failed to start${NC}"
    echo -e "${YELLOW}Last 20 lines from frontend log:${NC}"
    tail -20 /tmp/ff-frontend.log 2>/dev/null || echo "No log file found"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✓ All services running!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo -e "${BLUE}Services:${NC}"
echo -e "  • Backend:  ${GREEN}http://localhost:8000${NC}"
echo -e "  • Frontend: ${GREEN}http://localhost:3000${NC}"
echo -e "  • API Docs: ${GREEN}http://localhost:8000/swagger/${NC}"
echo ""
echo -e "${BLUE}View Logs:${NC}"
echo -e "  • Backend:  tail -f /tmp/ff-backend.log"
echo -e "  • Frontend: tail -f /tmp/ff-frontend.log"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

wait $BACKEND_PID $FRONTEND_PID

