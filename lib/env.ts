/**
 * Environment variable validation and type safety
 * Ensures all required env vars are present and correct at startup
 */

export interface EnvironmentConfig {
  // GitHub
  GITHUB_OWNER: string
  GITHUB_REPO: string
  GITHUB_TOKEN: string

  // Admin auth
  ADMIN_PASSWORD: string

  // Firebase server-side
  FIREBASE_PROJECT_ID: string
  FIREBASE_PRIVATE_KEY: string
  FIREBASE_CLIENT_EMAIL: string

  // Google Gemini
  GEMINI_API_KEY: string

  // Site configuration
  NEXT_PUBLIC_SITE_URL: string

  // Firebase client config
  NEXT_PUBLIC_FIREBASE_API_KEY: string
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: string
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: string
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: string
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string
  NEXT_PUBLIC_FIREBASE_APP_ID: string
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: string
}

/**
 * Required environment variables
 */
const REQUIRED_VARS: (keyof EnvironmentConfig)[] = [
  'GITHUB_OWNER',
  'GITHUB_REPO',
  'GITHUB_TOKEN',
  'ADMIN_PASSWORD',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_CLIENT_EMAIL',
  'GEMINI_API_KEY',
  'NEXT_PUBLIC_SITE_URL',
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
  'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID'
]

/**
 * Validate a URL format
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Validate GitHub token format (40+ hex characters)
 */
function isValidGitHubToken(token: string): boolean {
  return /^ghp_[a-zA-Z0-9_]{36,}$/.test(token)
}

/**
 * Validate Firebase private key format
 */
function isValidFirebasePrivateKey(key: string): boolean {
  // Remove quotes if present
  const cleanKey = key.startsWith('"') ? key.slice(1, -1) : key
  return cleanKey.includes('BEGIN PRIVATE KEY') && cleanKey.includes('END PRIVATE KEY')
}

/**
 * Validate Firebase project ID format
 */
function isValidFirebaseProjectId(id: string): boolean {
  return /^[a-z0-9-]{6,}$/.test(id)
}

/**
 * Validate Gemini API key format
 */
function isValidGeminiKey(key: string): boolean {
  return /^AIzaSy[a-zA-Z0-9_-]{32,}$/.test(key)
}

/**
 * Validate admin password strength
 */
function isValidPassword(password: string): boolean {
  return password.length >= 8
}

/**
 * Get all environment configuration with validation
 */
export function getEnvConfig(): EnvironmentConfig {
  const config: Partial<EnvironmentConfig> = {}
  const errors: string[] = []

  // Validate each required variable
  for (const varName of REQUIRED_VARS) {
    const value = process.env[varName]

    if (!value) {
      errors.push(`Missing required environment variable: ${varName}`)
      continue
    }

    config[varName] = value
  }

  // Additional validation based on type
  if (config.NEXT_PUBLIC_SITE_URL && !isValidUrl(config.NEXT_PUBLIC_SITE_URL)) {
    errors.push(`Invalid NEXT_PUBLIC_SITE_URL format: ${config.NEXT_PUBLIC_SITE_URL}`)
  }

  if (config.GITHUB_TOKEN && !isValidGitHubToken(config.GITHUB_TOKEN)) {
    errors.push(`Invalid GITHUB_TOKEN format`)
  }

  if (config.FIREBASE_PRIVATE_KEY && !isValidFirebasePrivateKey(config.FIREBASE_PRIVATE_KEY)) {
    errors.push(`Invalid FIREBASE_PRIVATE_KEY format`)
  }

  if (config.FIREBASE_PROJECT_ID && !isValidFirebaseProjectId(config.FIREBASE_PROJECT_ID)) {
    errors.push(`Invalid FIREBASE_PROJECT_ID format`)
  }

  if (config.GEMINI_API_KEY && !isValidGeminiKey(config.GEMINI_API_KEY)) {
    errors.push(`Invalid GEMINI_API_KEY format`)
  }

  if (config.ADMIN_PASSWORD && !isValidPassword(config.ADMIN_PASSWORD)) {
    errors.push(`ADMIN_PASSWORD must be at least 8 characters`)
  }

  if (errors.length > 0) {
    throw new Error(`Environment validation failed:\n${errors.join('\n')}`)
  }

  return config as EnvironmentConfig
}

/**
 * Check if a specific variable is available
 */
export function hasEnvVar(varName: keyof EnvironmentConfig): boolean {
  return Boolean(process.env[varName])
}

/**
 * Get a specific environment variable with fallback
 */
export function getEnvVar<T extends keyof EnvironmentConfig>(
  varName: T,
  defaultValue?: string
): string | undefined {
  return process.env[varName] || defaultValue
}

/**
 * Validate and get configuration synchronously (for startup)
 */
let cachedConfig: EnvironmentConfig | null = null

export function getOrValidateEnv(): EnvironmentConfig {
  if (cachedConfig) {
    return cachedConfig
  }

  try {
    cachedConfig = getEnvConfig()
    return cachedConfig
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
      console.error('Environment validation failed in production')
      process.exit(1)
    }
    throw error
  }
}

/**
 * Export config for server components that need it
 */
export const env = {
  get config(): EnvironmentConfig {
    return getOrValidateEnv()
  },

  get isDev(): boolean {
    return process.env.NODE_ENV === 'development'
  },

  get isProd(): boolean {
    return process.env.NODE_ENV === 'production'
  },

  has(varName: keyof EnvironmentConfig): boolean {
    return hasEnvVar(varName)
  },

  get(varName: keyof EnvironmentConfig, defaultValue?: string): string | undefined {
    return getEnvVar(varName, defaultValue)
  }
}
