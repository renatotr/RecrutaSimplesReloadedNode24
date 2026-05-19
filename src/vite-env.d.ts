/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_SESSION_PATH?: string
  readonly VITE_DEV_LEGACY_ORIGIN?: string
  readonly VITE_DEV_APP_ORIGIN?: string
  readonly NODE_ENV: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
