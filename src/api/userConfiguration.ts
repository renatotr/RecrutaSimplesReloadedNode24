import { mergeConfigurationBlocks } from '../lib/userConfigurations'
import { env } from '../config/env'
import type { SessionConfiguration } from '../types/session'
import type { SessionUser } from '../types/session'
import { ApiError, apiFetch, formatResponsePayload } from './client'
import { normalizeSessionUser } from './session'

const USER_CONFIGURATION_PATH = env.userConfigurationPath

/** One block in the POST body array, e.g. `{ "deactivate_old_positions": { ... } }`. */
export type ConfigurationBlockEntry = Record<string, unknown>

/** Browser URL and legacy target (dev: Vite proxy destination). */
export function getUserConfigurationUrls(): {
  browserUrl: string
  legacyUrl: string
} {
  const browserUrl = `${env.apiBaseUrl.replace(/\/$/, '')}${USER_CONFIGURATION_PATH}`
  const legacyUrl = `${env.devLegacyOrigin.replace(/\/$/, '')}${USER_CONFIGURATION_PATH}`
  return { browserUrl, legacyUrl }
}

async function readErrorDetails(response: Response): Promise<string> {
  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    return response.statusText || `Erro HTTP ${response.status}`
  }

  try {
    const data: unknown = await response.json()
    if (typeof data === 'object' && data !== null) {
      const record = data as Record<string, unknown>
      if (typeof record.message === 'string' && record.message.trim()) {
        return record.message
      }
      if (typeof record.error === 'string' && record.error.trim()) {
        return record.error
      }
    }
    return formatResponsePayload(data)
  } catch {
    return response.statusText || `Erro HTTP ${response.status}`
  }
}

function extractConfigurationFromResponse(data: unknown): SessionConfiguration | null {
  if (Array.isArray(data)) {
    return mergeConfigurationBlocks(data)
  }

  if (typeof data !== 'object' || data === null) return null

  const record = data as Record<string, unknown>

  if (record.configuration != null) {
    if (typeof record.configuration === 'object' && !Array.isArray(record.configuration)) {
      return record.configuration as SessionConfiguration
    }
    if (Array.isArray(record.configuration)) {
      return mergeConfigurationBlocks(record.configuration)
    }
  }

  if (record.session != null && typeof record.session === 'object') {
    const session = normalizeSessionUser(record.session as SessionUser)
    return session.configuration ?? null
  }

  if (record.user != null && typeof record.user === 'object') {
    const user = normalizeSessionUser(record.user as SessionUser)
    return user.configuration ?? null
  }

  return record as SessionConfiguration
}

export async function getUserConfiguration(): Promise<SessionConfiguration | null> {
  if (import.meta.env.DEV) {
    const { browserUrl, legacyUrl } = getUserConfigurationUrls()
    console.info('[user/configuration] GET browser →', browserUrl)
    console.info('[user/configuration] GET legacy →', legacyUrl)
  }

  const response = await apiFetch(USER_CONFIGURATION_PATH, { method: 'GET' })

  if (!response.ok) {
    const details = await readErrorDetails(response)
    throw new ApiError(
      'Não foi possível carregar as configurações',
      response.status,
      details,
    )
  }

  const data: unknown = await response.json()
  return extractConfigurationFromResponse(data)
}

/**
 * POST body: JSON array of blocks to update, e.g.
 * `[{ "deactivate_old_positions": { "enabled": true, "age": 90 } }]`
 */
export async function saveUserConfiguration(
  blocks: ConfigurationBlockEntry[],
): Promise<void> {
  if (import.meta.env.DEV) {
    const { browserUrl, legacyUrl } = getUserConfigurationUrls()
    console.info('[user/configuration] POST browser →', browserUrl)
    console.info('[user/configuration] POST legacy →', legacyUrl)
    console.info('[user/configuration] POST body →', JSON.stringify(blocks))
  }

  const response = await apiFetch(USER_CONFIGURATION_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(blocks),
  })

  if (response.status === 200) return

  const details = await readErrorDetails(response)
  throw new ApiError(
    'Não foi possível salvar as configurações',
    response.status,
    details,
  )
}
