import { z } from 'zod';

/**
 * Environment Variables Schema
 * Validates all required env vars at startup
 * If validation fails, app should not start
 */
const envSchema = z.object({
  // App config
  NODE_ENV: z
    .enum(['development', 'staging', 'production'])
    .default('development'),
  PORT: z.coerce.number().min(1).max(65535).default(3000),
  LOG_LEVEL: z
    .enum(['debug', 'info', 'warn', 'error', 'fatal'])
    .default('info'),

  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),

  // JWT (optional for now, but ready for auth module)
  JWT_SECRET: z.string().min(32).optional(),
  JWT_EXPIRY: z.string().default('24h'),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000), // 15 min
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Parse and validate environment variables
 * Throws error if validation fails
 */
export function parseEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Environment validation failed:');
    console.error(result.error.errors);
    process.exit(1);
  }

  return result.data;
}

// ── Singleton instance ──────────────────────────────────────────
let envInstance: Env | null = null;

export function getEnv(): Env {
  if (!envInstance) {
    envInstance = parseEnv();
  }
  return envInstance;
}

// Initialize on module load in production
if (process.env.NODE_ENV === 'production') {
  getEnv();
}
