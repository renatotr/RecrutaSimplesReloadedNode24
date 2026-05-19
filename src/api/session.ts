import { normalizeConfiguration } from '../lib/userConfigurations'
import { env } from '../config/env'
import type { SessionConfiguration, SessionUser } from '../types/session'
import { ApiError, apiFetch, formatResponsePayload } from './client'

/** Ensures a fresh `configuration` object and maps legacy `configurations` if needed. */
export function normalizeSessionUser(data: SessionUser): SessionUser {
  const raw = data as SessionUser & { configurations?: unknown }
  const source = raw.configuration ?? raw.configurations

  const normalized = normalizeConfiguration(
    source as SessionConfiguration | string | null | undefined,
  )

  const configuration = normalized ? { ...normalized } : undefined

  const { configurations: _legacy, configuration: _current, ...rest } = raw
  return { ...rest, configuration }
}

export async function fetchSession(): Promise<SessionUser> {
  const response = await apiFetch(env.sessionPath)

  if (response.status === 401 || response.status === 403) {
    throw new ApiError('Não autorizado', response.status)
  }

  if (!response.ok) {
    throw new ApiError(
      'Não foi possível validar a sessão',
      response.status,
    )
  }

  const data: unknown = await response.json()

  if (
    typeof data !== 'object' ||
    data === null ||
    !('id' in data) ||
    (typeof data.id !== 'string' && typeof data.id !== 'number')
  ) {
    throw new ApiError(
      'Resposta de sessão inválida',
      500,
      formatResponsePayload(data),
    )
  }

  return normalizeSessionUser(data as SessionUser)
}
