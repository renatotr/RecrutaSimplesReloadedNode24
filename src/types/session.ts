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

export interface SessionUser {
  id: string | number
  name?: string
  email?: string
  roles?: SessionRole[]
  permissions?: SessionPermission[]
}
