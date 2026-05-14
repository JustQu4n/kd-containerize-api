# Docker Setup Guide

Complete guide for running the application with Docker and Docker Compose.

## 📦 Prerequisites

- Docker Desktop (v20.10+)
  - [Windows/Mac](https://www.docker.com/products/docker-desktop)
  - [Linux](https://docs.docker.com/engine/install/)
- Docker Compose (v1.29+) — included with Desktop
- Git

## 🚀 Quick Start

### 1. Clone & Setup
```bash
git clone <repository-url>
cd NguyenAnhQuan_Topic8
cp .env.example .env.development
```

### 2. Start Stack
```bash
docker compose up --build -d
```

### 3. Run Migrations
```bash
docker compose exec api npm run migrate
```

✅ **Done!** API is running at http://localhost:30001

## 📋 Docker Compose Services

### API Service
- **Image:** Built from local Dockerfile
- **Port:** 3000 (http://localhost:3000)
- **Health Check:** Every 30s via `/health` endpoint
- **Dependencies:** Requires PostgreSQL & Redis to be healthy

```bash
# View logs
docker compose logs -f api

# Execute command in container
docker compose exec api npm run migrate

# Restart service
docker compose restart api
```

### PostgreSQL Database
- **Image:** postgres:15-alpine
- **Port:** 5432 (internal only, not exposed by default)
- **Volume:** postgres_data (persistent)
- **Health Check:** pg_isready every 10s
- **Credentials:** In .env (default: postgres/postgres)

```bash
# Connect to database
docker compose exec postgres psql -U postgres -d todos

# Backup database
docker compose exec postgres pg_dump -U postgres todos > backup.sql

# Restore database
docker compose exec postgres psql -U postgres todos < backup.sql
```

### Redis Cache
- **Image:** redis:7-alpine
- **Port:** 6379 (internal only)
- **Volume:** redis_data (persistent)
- **Health Check:** redis-cli ping every 10s

```bash
# Access Redis CLI
docker compose exec redis redis-cli

# View Redis info
docker compose exec redis redis-cli INFO
```

## 🔧 Common Tasks

### View All Logs
```bash
# Follow logs from all services
docker compose logs -f

# View logs from specific service
docker compose logs -f postgres
docker compose logs -f redis
docker compose logs -f api

# View last 50 lines
docker compose logs --tail 50
```

### Stop Services (Keep data)
```bash
docker compose stop
```

### Stop & Remove Containers (Keep volumes)
```bash
docker compose down
```

### Complete Cleanup (Remove everything)
```bash
docker compose down -v
# Use -v to remove volumes and start fresh
```

### Rebuild Images
```bash
# After code changes
docker compose up --build -d

# Force rebuild (ignore cache)
docker compose up --build --no-cache -d
```

### Scale Services
```bash
# Run 3 instances of API (requires load balancer)
docker compose up --scale api=3 -d
```

## 🧪 Testing in Docker

### Run Tests
```bash
docker compose exec api npm test
```

### Run Tests with Coverage
```bash
docker compose exec api npm test -- --coverage
```

### Run Specific Test File
```bash
docker compose exec api npm test -- todo.test.ts
```

### Run Linter
```bash
docker compose exec api npm run lint
```

## 📊 Monitoring & Debugging

### Check Service Health
```bash
# View service status
docker compose ps

# Expected output:
# NAME                 STATUS              PORTS
# todos-api            running             0.0.0.0:3000->3000/tcp
# todos-postgres       running             0.0.0.0:5432->5432/tcp
# todos-redis          running             0.0.0.0:6379->6379/tcp
```

### View Service Stats
```bash
# CPU, Memory, Network usage
docker stats todos-api todos-postgres todos-redis
```

### Check Image Sizes
```bash
docker images | grep todos
```

Expected:
```
REPOSITORY       TAG       SIZE
todos-api        latest    ~150-180MB
postgres         15-alpine ~150MB
redis            7-alpine  ~40MB
```

### Container Shell Access
```bash
# Access API container shell
docker compose exec api sh

# From container:
# ls -la dist/
# npm run migrate
# exit
```

### Inspect Container
```bash
docker inspect todos-api

# Get container IP
docker inspect -f '{{.NetworkSettings.IPAddress}}' todos-api
```

## 🌐 Network Communication

Services communicate via Docker network `app-network`:

- API → PostgreSQL: `postgresql://postgres:postgres@postgres:5432/todos`
- API → Redis: `redis://redis:6379`

**From host machine:**
- API: http://localhost:3000
- PostgreSQL: localhost:5432
- Redis: localhost:6379

## 🔒 Security Best Practices

### Change Default Credentials
Edit `.env.development`:
```env
POSTGRES_USER=secure_user
POSTGRES_PASSWORD=secure_password_here_32_chars_min
```

### Use Strong Secrets
```env
JWT_SECRET=a-strong-random-secret-min-32-chars-!!!
```

### Environment Files
- ✓ `.env.example` — committed to git (dummy values)
- ✗ `.env.development` — NOT committed (real values)
- ✗ `.env.production` — NOT committed (production values)

### Network Isolation
- Services communicate internally via Docker network
- Only expose necessary ports
- Current setup only exposes API port 3000

## 📈 Performance Tuning

### Database Connection Pool
Edit `docker-compose.yml`:
```yaml
api:
  environment:
    DATABASE_MAX_CONNECTIONS: 10
```

### Redis Memory Limit
```yaml
redis:
  command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
```

### Resource Limits
```yaml
api:
  deploy:
    resources:
      limits:
        cpus: '1'
        memory: 512M
      reservations:
        cpus: '0.5'
        memory: 256M
```

## 🐛 Troubleshooting

### "Port 3000 already in use"
```bash
# Find process using port 3000
lsof -i :3000  # macOS/Linux
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess  # Windows

# Kill process or use different port
docker compose up -e PORT=3001
```

### "Failed to connect to database"
```bash
# Check PostgreSQL health
docker compose exec postgres pg_isready

# View PostgreSQL logs
docker compose logs postgres

# Verify credentials in .env
```

### "Cannot create container: volume already exists"
```bash
docker compose down -v  # Remove volumes
docker compose up --build -d  # Start fresh
```

### "npm: command not found"
```bash
# Ensure package.json is copied in Dockerfile
docker compose exec api sh
# Inside container:
node -v
npm -v
```

### "Migrations failed to run"
```bash
# Check database connectivity
docker compose exec api npm run migrate

# Or manually run
docker compose exec postgres psql -U postgres -d todos -c "SELECT 1;"

# View migration status
docker compose exec api npx prisma migrate status
```

## 📚 Useful Commands Summary

```bash
# Development
docker compose up -d              # Start services
docker compose logs -f api        # Watch API logs
docker compose exec api npm test  # Run tests

# Database
docker compose exec postgres psql -U postgres -d todos  # Connect
docker compose exec api npm run migrate                  # Migrations

# Maintenance
docker compose down -v            # Complete cleanup
docker compose ps                 # Service status
docker stats                      # Live resource usage

# Debugging
docker compose exec api sh        # Container shell
docker inspect todos-api          # Detailed info
docker image inspect todos-api    # Image details
```

## 🔗 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [PostgreSQL in Docker](https://hub.docker.com/_/postgres)
- [Redis in Docker](https://hub.docker.com/_/redis)
