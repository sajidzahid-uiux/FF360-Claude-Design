# Development Scripts Guide

This guide explains how to use the development scripts to quickly start and stop the FF Management System locally.

**📂 Location:** `frontend/dev-scripts/`

All scripts in this folder work from here but control both backend and frontend services.

## Available Scripts

### 1. `start-dev.sh` (Recommended)

Full-featured startup script with dependency checking, migration running, and detailed status output.

**Features:**

- Loads environment variables from `.env`
- Checks and starts database container if needed
- Verifies Python dependencies are installed
- Runs database migrations
- Starts backend on port 8000
- Starts frontend on port 3000
- Displays service status and URLs
- Graceful cleanup on Ctrl+C

**Usage:**

```bash
cd frontend/dev-scripts
./start-dev.sh
```

**Output:**

```
================================
FF Management System - Dev Mode
================================

Loading environment variables...
Checking database container...
✓ Database container already running

Starting Django backend...
Running database migrations...
Starting backend server...
✓ Backend started on http://localhost:8000
  Logs: tail -f /tmp/ff-backend.log

Starting Next.js frontend...
Starting frontend server...
✓ Frontend started on http://localhost:3000
  Logs: tail -f /tmp/ff-frontend.log

================================
✓ All services running!
================================

Services:
  • Backend:  http://localhost:8000
  • Frontend: http://localhost:3000
  • API Docs: http://localhost:8000/swagger/

View Logs:
  • Backend:  tail -f /tmp/ff-backend.log
  • Frontend: tail -f /tmp/ff-frontend.log

Press Ctrl+C to stop all services
```

**Logs Location:**

- Backend: `/tmp/ff-backend.log`
- Frontend: `/tmp/ff-frontend.log`

---

### 2. `quick-start.sh`

Minimal startup script for quick launches when everything is already set up.

**Use this when:**

- Dependencies are already installed
- Database is already configured
- You've run migrations before
- You just want to start both services quickly

**Usage:**

```bash
cd frontend/dev-scripts
./quick-start.sh
```

**Output:**

```
✓ Services starting...
  Backend:  http://localhost:8000
  Frontend: http://localhost:3000

View logs:
  tail -f /tmp/ff-backend.log
  tail -f /tmp/ff-frontend.log

Stop services:
  ./stop-dev.sh
```

---

### 3. `stop-dev.sh`

Stops all running development services.

**Usage:**

```bash
cd frontend/dev-scripts
./stop-dev.sh
```

**What it stops:**

- Backend Django server
- Frontend Next.js server
- (Optionally) Database container (commented out by default)

**Output:**

```
Stopping FF Management System services...
Stopping backend...
Stopping frontend...
✓ All services stopped
```

---

## Prerequisites

Before running these scripts, ensure you have:

1. **Environment file**: `.env` file in the project root
2. **Python 3**: `python3` command available
3. **Node.js**: For frontend development
4. **Docker**: For database container

---

## First-Time Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd FF-management-system
   ```

2. **Create environment file**

   ```bash
   cp backend/env-example.txt .env
   # Edit .env with your configuration
   ```

3. **Make scripts executable** (already done)

   ```bash
   chmod +x start-dev.sh quick-start.sh stop-dev.sh
   ```

4. **Install backend dependencies** (optional - script will do this)

   ```bash
   cd backend
   pip3 install -r requirements.txt --user
   ```

5. **Install frontend dependencies** (optional - script will do this)

   ```bash
   cd frontend
   npm install
   ```

6. **Start services**
   ```bash
   cd frontend/dev-scripts
   ./start-dev.sh
   ```

---

## Common Workflows

### Starting for the first time

```bash
./start-dev.sh
```

This will install dependencies and set everything up.

### Daily development

```bash
./quick-start.sh
```

Quick start when everything is already configured.

### Stopping services

```bash
# Either press Ctrl+C in the terminal running start-dev.sh
# Or run in a new terminal:
./stop-dev.sh
```

### Viewing logs

```bash
# Backend logs
tail -f /tmp/ff-backend.log

# Frontend logs
tail -f /tmp/ff-frontend.log

# Both logs in split view
tail -f /tmp/ff-backend.log /tmp/ff-frontend.log
```

### Restart after changes

```bash
./stop-dev.sh
./quick-start.sh
```

---

## Troubleshooting

### Script won't execute

```bash
# Make sure scripts are executable
chmod +x *.sh
```

### "Permission denied" on pip install

The script uses `--user` flag. Alternatively, use a virtual environment:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Then modify the script to activate the venv.

### Port already in use

```bash
# Check what's using the port
lsof -i :8000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use the stop script
./stop-dev.sh
```

### Database connection fails

```bash
# Check if database container is running
docker ps | grep db

# Start database manually
docker-compose up -d db

# Check database logs
docker-compose logs db
```

### Frontend won't start

```bash
# Check Node.js version (should be 20+)
node --version

# Clear Next.js cache
cd frontend
rm -rf .next
npm install

# Try starting again
cd ..
./start-dev.sh
```

### Backend migration errors

```bash
# Run migrations manually
cd backend
source ../.env
export $(grep -v '^#' ../.env | xargs)
python3 manage.py migrate

# If that fails, check database connectivity
python3 manage.py dbshell
```

---

## Environment Variables

The scripts load environment variables from `.env` in the project root.

**Required variables:**

- `DB_NAME` - Database name
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `DB_HOST` - Database host (use `localhost` for local development)
- `DB_PORT` - Database port (default: 5432)

**Optional variables:**

- `DEBUG` - Enable Django debug mode (default: True)
- `SECRET_KEY` - Django secret key
- `ALLOWED_HOSTS` - Space-separated allowed hosts
- `USE_REDIS_CHANNEL_LAYER` - Enable Redis (default: False)

See `backend/env-example.txt` for a complete list.

---

## Advanced Usage

### Running with different ports

Edit the scripts and change:

- Backend: `python3 manage.py runserver 0.0.0.0:PORT`
- Frontend: Update `frontend/package.json` to set custom port

### Running only backend

```bash
cd backend
export $(grep -v '^#' ../.env | xargs)
python3 manage.py runserver 0.0.0.0:8000
```

### Running only frontend

```bash
cd frontend
npm run dev
```

### Using Docker Compose instead

```bash
# Start all services in Docker
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## Comparison with Docker Compose

| Feature        | Dev Scripts            | Docker Compose          |
| -------------- | ---------------------- | ----------------------- |
| Setup time     | Fast (after first run) | Slower (builds images)  |
| Hot reload     | ✓ Native               | ✓ With volumes          |
| Resource usage | Lower                  | Higher                  |
| Isolation      | Local machine          | Containers              |
| Best for       | Active development     | Production-like testing |

**Use dev scripts for:** Daily development, quick iterations, debugging
**Use Docker Compose for:** Testing deployments, CI/CD, team consistency

---

## Contributing

When modifying these scripts:

1. Test on a clean environment
2. Update this documentation
3. Ensure cross-platform compatibility (Linux/macOS)
4. Add error handling for common issues

---

## Support

If you encounter issues not covered here:

1. Check the main README.md
2. Review backend/frontend logs
3. Verify environment configuration
4. Check Docker container status
