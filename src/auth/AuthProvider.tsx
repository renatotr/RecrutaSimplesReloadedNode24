import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { fetchSession } from '../api/session'
import { ApiError } from '../api/client'
import type { SessionConfiguration, SessionUser } from '../types/session'
import {
  buildPermissionIndex,
  type PermissionIndex,
} from './permissions'

export type AuthStatus = 'loading' | 'authenticated' | 'unauthorized' | 'error'

export interface AuthContextValue {
  status: AuthStatus
  user: SessionUser | null
  permissionIndex: PermissionIndex | null
  errorMessage: string | null
  errorDetails: string | null
  retry: () => void
  refreshSession: () => Promise<SessionUser>
  patchConfiguration: (configuration: SessionConfiguration) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [user, setUser] = useState<SessionUser | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [errorDetails, setErrorDetails] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  const retry = useCallback(() => {
    setAttempt((n) => n + 1)
  }, [])

  const refreshSession = useCallback(async () => {
    const session = await fetchSession()
    setUser(session)
    return session
  }, [])

  const patchConfiguration = useCallback(
    (configuration: SessionConfiguration) => {
      setUser((current) =>
        current ? { ...current, configuration: { ...configuration } } : current,
      )
    },
    [],
  )

  useEffect(() => {
    let cancelled = false

    async function load() {
      setStatus('loading')
      setErrorMessage(null)
      setErrorDetails(null)
      setUser(null)

      try {
        const session = await fetchSession()
        if (cancelled) return
        setUser(session)
        setStatus('authenticated')
      } catch (error) {
        if (cancelled) return
        if (error instanceof ApiError && error.status === 401) {
          setStatus('unauthorized')
          return
        }
        if (error instanceof ApiError && error.status === 403) {
          setStatus('unauthorized')
          return
        }
        setStatus('error')
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Erro ao validar sessão',
        )
        setErrorDetails(
          error instanceof ApiError ? (error.details ?? null) : null,
        )
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [attempt])

  const permissionIndex = useMemo(
    () => (user ? buildPermissionIndex(user) : null),
    [user],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      permissionIndex,
      errorMessage,
      errorDetails,
      retry,
      refreshSession,
      patchConfiguration,
    }),
    [
      status,
      user,
      permissionIndex,
      errorMessage,
      errorDetails,
      retry,
      refreshSession,
      patchConfiguration,
    ],
  )

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  )
}
