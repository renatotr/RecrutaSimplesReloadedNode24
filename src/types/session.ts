/**
 * Shape returned by GET {VITE_SESSION_PATH} on success (200).
 * Adjust fields to match your legacy API — the frontend only requires `id`.
 */

export interface SessionRole {
  id?: string | number
  name?: string
  code?: string
}

export interface SessionPermission {
  id?: string | number
  name?: string
  code?: string
}

/** Arbitrary JSON object returned by the legacy API for user settings. */
export type SessionConfiguration = Record<string, unknown>

export interface SessionUser {
  id: string | number
  name?: string
  email?: string
  theme?: string
  is_user_admin?: boolean
  configuration?: SessionConfiguration
  roles?: SessionRole[]
  permissions?: SessionPermission[]
}
