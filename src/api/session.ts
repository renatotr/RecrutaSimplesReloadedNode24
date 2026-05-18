import { env } from '../config/env'
import type { SessionUser } from '../types/session'
import { ApiError, apiFetch, formatResponsePayload } from './client'

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

  return data as SessionUser
}
