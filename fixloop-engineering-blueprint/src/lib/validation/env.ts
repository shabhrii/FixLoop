import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_ORIGIN: z.string().url().default("http://localhost:3000"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DIRECT_URL: z.string().optional(),
  AUTH_COOKIE_SECRET: z.string().min(16).default("fixloop-development-cookie-secret-key-32chars"),
  STORAGE_DRIVER: z.enum(["local", "supabase", "s3"]).default("local"),
  LOCAL_STORAGE_PATH: z.string().default("./local-evidence"),
  AI_ENABLED: z.coerce.boolean().default(false),
  AI_PROVIDER: z.enum(["mock", "openai", "anthropic"]).default("mock"),
  UPLOAD_MAX_BYTES: z.coerce.number().default(15728640), // 15MB
  SIGNED_URL_TTL_SECONDS: z.coerce.number().default(300),
});

export type EnvConfig = z.infer<typeof EnvSchema>;

export function validateEnv(): EnvConfig {
  const result = EnvSchema.safeParse(process.env);
  if (!result.success) {
    const errorKeys = result.error.errors.map((e) => e.path.join(".")).join(", ");
    throw new Error(`Environment validation failed for variables: ${errorKeys}. Never log secrets.`);
  }
  return result.data;
}
