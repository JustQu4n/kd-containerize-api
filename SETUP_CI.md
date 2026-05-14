# GitHub Actions & CI Setup Guide

This document describes how to complete the CI/CD setup on GitHub.

## 1. Configure GitHub Secrets

The CI pipeline requires secrets for secure operations. Add these to your repository:

**Settings → Secrets and variables → Actions**

### Required Secret
```
JWT_SECRET = your-super-secret-key-that-is-at-least-32-characters-long-!!!
```

This is used during CI testing. In production, use a different value in your deployment platform.

### Optional Secrets (for future Docker registry)
```
REGISTRY_USERNAME = your-registry-username
REGISTRY_PASSWORD = your-registry-password
```

## 2. Enable Branch Protection (Optional but Recommended)

**Settings → Branches → Add branch protection rule**

### Pattern: `main`

✅ **Enable:**
- ✓ Require a pull request before merging
- ✓ Require status checks to pass before merging
  - ✓ lint
  - ✓ build
  - ✓ test
  - ✓ ci-status
- ✓ Require branches to be up to date before merging
- ✓ Require code reviews before merging (1 reviewer)
- ✓ Require conversation resolution before merging

### Pattern: `develop`

Same as above but allow 2+ reviewers for more rigorous review.

## 3. GitHub Actions Workflow Status

The CI pipeline (`.github/workflows/ci.yml`) includes:

### Jobs

1. **lint** — ESLint validation
   - ✓ Checks TypeScript syntax
   - ✓ Validates code style

2. **build** — TypeScript compilation
   - ✓ Compiles TS to JS
   - ✓ Generates Prisma client
   - ✓ Creates dist/ artifacts

3. **test** — Comprehensive test suite
   - ✓ PostgreSQL service (`postgres:15-alpine`)
   - ✓ Redis service (`redis:7-alpine`)
   - ✓ Auto-migrations
   - ✓ Coverage reports
   - ✓ Blocks merge if tests fail

4. **docker** — Docker image build (main only)
   - ✓ Builds multi-stage image
   - ✓ Pushes to GitHub Container Registry
   - ✓ Caches layers for speed

5. **ci-status** — Final status check
   - ✓ Aggregates all job results
   - ✓ Fails if any job failed

## 4. Environment Variables in CI

The workflow sets these automatically:

```yaml
NODE_ENV=test
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/todos_test?schema=public
REDIS_URL=redis://localhost:6379
JWT_SECRET=test-secret-key-that-is-at-least-32-chars-long
```

⚠️ **Never add production secrets to `.github/workflows/ci.yml`** — Use repository secrets instead.

## 5. Monitoring & Debugging

### View Workflow Runs
- **Actions** tab → Select workflow → View logs
- Click on any job to see detailed output

### Common Issues & Fixes

**❌ Test failed: "Cannot connect to database"**
- Check PostgreSQL service health in logs
- Ensure migrations are running: `npx prisma migrate deploy`
- Verify `DATABASE_URL` format

**❌ Lint failed**
- Fix locally: `npm run lint -- --fix`
- Commit and push again

**❌ Docker build failed**
- Check Dockerfile syntax
- Ensure all dependencies in package.json
- Run `docker build --no-cache .` locally to debug

## 6. Local Testing (Simulate CI)

Test locally before pushing:

```bash
# Install dependencies
npm ci

# Run linter
npm run lint

# Build
npm run build

# Start services
docker compose up -d postgres redis

# Run migrations
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/todos_test?schema=public" npx prisma migrate deploy

# Run tests
npm test -- --coverage
```

## 7. Pull Request Workflow

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes and commit
3. Push: `git push origin feature/my-feature`
4. Create Pull Request on GitHub
5. CI pipeline automatically runs
6. ✅ Wait for all checks to pass
7. Request review
8. After approval, merge to main

## 8. Deployment Preparation

For production deployment:

```bash
# 1. Set up GitHub Secrets in production environment
# 2. Update docker-compose.yml with production values
# 3. Configure separate database for production
# 4. Use different JWT_SECRET for production
# 5. Enable branch protection rules
```

## 9. Troubleshooting

### Workflow stuck or not running?
- Check `.github/workflows/ci.yml` syntax (YAML errors block execution)
- Ensure triggers are correct (on push, on pull_request)
- Check repository settings → Actions → General → Allow all actions

### Tests pass locally but fail in CI?
- Different Node.js version: Check `node-version` in workflow
- Environment variables: Verify all required vars are set
- Database state: CI uses fresh database each time (good for isolation)
- Race conditions: Use `--runInBand` in jest config

### Can't push to main?
- Ensure all CI checks pass
- Check branch protection rules
- Verify you have write permission

## 10. References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Environment Variables](https://docs.github.com/en/actions/learn-github-actions/environment-variables)
- [Secrets Management](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
