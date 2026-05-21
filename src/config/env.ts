function normalizeApiPathPrefix(prefix: string): string {
  const trimmed = prefix.trim() || '/api/reloaded'
  const withLeading = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  return withLeading.replace(/\/$/, '')
}

function normalizePathSuffix(suffix: string): string {
  const trimmed = suffix.trim()
  if (!trimmed) return ''
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

/** Builds a path under the reloaded API prefix, e.g. `/api/reloaded/auth/iframe-validation`. */
export function buildApiPath(suffix: string): string {
  const prefix = normalizeApiPathPrefix(
    import.meta.env.VITE_API_PATH_PREFIX ?? '/api/reloaded',
  )
  return `${prefix}${normalizePathSuffix(suffix)}`
}

const apiPathPrefix = normalizeApiPathPrefix(
  import.meta.env.VITE_API_PATH_PREFIX ?? '/api/reloaded',
)

const sessionRelative =
  import.meta.env.VITE_SESSION_RELATIVE_PATH?.trim() ||
  '/auth/iframe-validation'

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL?.trim() ?? '',
  apiPathPrefix,
  sessionPath: buildApiPath(sessionRelative),
  devLegacyOrigin:
    import.meta.env.VITE_DEV_LEGACY_ORIGIN?.trim() || 'https://localhost:3001',
} as const
