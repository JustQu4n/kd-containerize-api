# Full Stack Todo Application

A comprehensive Node.js + Express + TypeScript Todo API with PostgreSQL database, Redis caching, and complete Docker containerization.

## 🚀 Quick Start (3 Commands)

### 1. Clone & Setup Environment
```bash
git clone <repository-url>
cd NguyenAnhQuan_Topic8
cp .env.example .env.development
```

### 2. Start Full Stack with Docker
```bash
docker compose up --build -d
```

### 3. Run Database Migrations
```bash
docker compose exec api npm run migrate
```

Done! The API is now running at **http://localhost:3000**

## 📋 Requirements & Checklist

### ✅ Docker Setup
- [x] **Multi-stage Dockerfile** — Optimized builder + production stages
  - Builder stage: Compiles TypeScript, generates Prisma client
  - Production stage: Minimal ~150MB image with non-root user
  - Health checks included

- [x] **docker-compose.yml** — Complete full-stack setup
  - PostgreSQL 15 with persistent volume
  - Redis 7 for caching
  - Node.js API service
  - Health checks with `service_healthy` conditions
  - Environment variable support

- [x] **.dockerignore** — Excludes unnecessary files
  - Reduces build context and image size
  - Excludes node_modules, dist, tests, etc.

### ✅ Local Development

#### Start Services
```bash
docker compose up --build -d
```

#### View Logs
```bash
docker compose logs -f api
docker compose logs -f postgres
docker compose logs -f redis
```

#### Run Migrations
```bash
docker compose exec api npm run migrate
```

#### Access Database
```bash
docker compose exec postgres psql -U postgres -d todos
```

#### Stop Everything
```bash
docker compose down -v  # -v removes volumes for clean restart
```

### ✅ Health Checks

Test the API health endpoint:
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-05-13T12:00:00.000Z",
  "uptime": 123.456
}
```

### ✅ Environment Variables

Copy `.env.example` to `.env.development` and customize:

```env
# Application
NODE_ENV=development
PORT=3000
LOG_LEVEL=info

# Database (PostgreSQL)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=todos
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/todos?schema=public

# Redis
REDIS_URL=redis://redis:6379

# JWT & Authentication
JWT_SECRET=your-secret-key-min-32-chars-long
JWT_EXPIRY=24h

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Important:** Never commit `.env` to git — only `.env.example` with dummy values.

### ✅ CI/CD Pipeline (GitHub Actions)

Automated workflows on every push and pull request:

#### Workflow: CI - Lint, Build & Test

**Stages:**
1. **Lint** — ESLint checks
2. **Build** — TypeScript compilation + Prisma client generation
3. **Test** — Full test suite with PostgreSQL service
4. **Docker** — Build and push image (main branch only)

**Features:**
- Parallel job execution for speed
- PostgreSQL & Redis services for testing
- Automatic database migrations
- Code coverage reports
- Docker image caching
- Blocks PRs if any step fails

**View Status:**
- GitHub UI: Actions tab
- Badge in README shows latest status
- PR checks prevent merge if CI fails

**Environment Variables in CI:**
```yaml
NODE_ENV: test
DATABASE_URL: postgresql://postgres:postgres@localhost:5432/todos_test?schema=public
REDIS_URL: redis://localhost:6379
JWT_SECRET: (auto-generated for CI)
```

### ✅ Development Scripts

```bash
# Installation
npm install                    # Install dependencies

# Local development
npm run dev                   # Start with nodemon (auto-reload)

# Building
npm run build                 # Compile TypeScript → dist/
npm run prisma:generate       # Generate Prisma client

# Database
npm run migrate               # Deploy migrations (use in Docker!)
npm run prisma:migrate        # Dev migration (creates new)

# Code Quality
npm run lint                  # Run ESLint
npm run format                # Auto-format with Prettier

# Testing
npm test                      # Run all tests
npm test -- --coverage        # Run tests with coverage report

# Docker
npm run db:up                 # Start docker-compose services
npm run db:down               # Stop and remove volumes
```

### 📦 Project Structure

```
src/
├── app.ts                    # Express app setup
├── index.ts                  # Entry point, server startup
├── config/
│   └── env.ts               # Environment validation with Zod
├── infrastructure/
│   ├── database/
│   │   └── prisma.ts        # Prisma client initialization
│   ├── logger/
│   │   └── logger.ts        # Pino logger setup
│   ├── middleware/
│   │   ├── error-handler.middleware.ts
│   │   ├── request-logger.middleware.ts
│   │   ├── correlation-id.middleware.ts
│   │   └── audit-log.middleware.ts
│   └── errors/
│       ├── app.error.ts
│       └── base.error.ts
├── modules/
│   └── todos/               # Todo feature module
│       ├── controllers/
│       ├── services/
│       ├── repositories/
│       ├── routes/
│       └── domain/
└── shared/
    ├── dto/
    ├── repositories/
    ├── services/
    ├── utils/
    └── validators/
```

### 🐳 Docker Image Size

Optimized for production:
- **Expected:** ~150-180MB
- **Check:**
  ```bash
  docker images | grep todos-api
  ```

### 🔒 Security Best Practices

✅ Implemented:
- Non-root user in container
- Multi-stage builds for smaller images
- Environment variables for secrets
- Health checks for orchestration
- Rate limiting on API endpoints
- Helmet.js for security headers
- Request validation with Zod
- CORS configuration

### 🧪 Testing

Tests run both locally and in CI:

```bash
# Local
npm test

# In CI (with PostgreSQL service)
docker compose exec api npm test
```

### 🚢 Deployment

The Docker image is automatically built and pushed on main branch merges.

**Manual build:**
```bash
docker build --no-cache -t todos-api:latest .
docker run -p 3000:3000 --env-file .env.production todos-api:latest
```

## 📖 API Documentation

See [API_TESTING_GUIDE.md](API_TESTING_GUIDE.md) for detailed endpoint documentation and usage examples.

## 🤝 Contributing

1. Create a feature branch
2. Make changes and run `npm run lint && npm test`
3. Push to GitHub
4. CI pipeline will automatically validate
5. Create a pull request
6. Wait for CI to pass (required for merge)
7. Request review

## 📝 License

ISC
