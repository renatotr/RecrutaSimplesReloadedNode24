const sessionPath = import.meta.env.VITE_SESSION_PATH?.trim() || '/api/me'

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL?.trim() ?? '',
  sessionPath: sessionPath.startsWith('/') ? sessionPath : `/${sessionPath}`,
  devLegacyOrigin:
    import.meta.env.VITE_DEV_LEGACY_ORIGIN?.trim() || 'https://localhost:3001',
} as const
