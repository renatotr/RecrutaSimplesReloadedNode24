/**
 * Shape returned by GET {VITE_SESSION_PATH} on success (200).
 * Adjust fields to match your legacy API — the frontend only requires `id`.
 */
export interface SessionUser {
  id: string | number
  name?: string
  email?: string
  roles?: string[]
  permissions?: string[]
}
