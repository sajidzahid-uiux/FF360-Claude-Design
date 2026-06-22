# Quick Start Script - Minimal version without checks
# Run this if you've already set everything up and just want to start services

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

set -a
source "$PROJECT_ROOT/.env"
set +a

cd "$PROJECT_ROOT/backend"
python3 manage.py runserver 0.0.0.0:8000 > /tmp/ff-backend.log 2>&1 &

cd "$PROJECT_ROOT/frontend"
npm run dev > /tmp/ff-frontend.log 2>&1 &

echo "✓ Services starting..."
echo "  Backend:  http://localhost:8000"
echo "  Frontend: http://localhost:3000"
echo ""
echo "View logs:"
echo "  tail -f /tmp/ff-backend.log"
echo "  tail -f /tmp/ff-frontend.log"
echo ""
echo "Stop services:"
echo "  ./stop-dev.sh"

