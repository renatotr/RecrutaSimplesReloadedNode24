import { env } from '../config/env'
import type { SessionConfiguration } from '../types/session'
import { ApiError, apiFetch, formatResponsePayload } from './client'

const PANEL_CONFIGURATION_PATH = '/painel/configuracoes'

/** Browser URL and legacy target (dev: Vite proxy destination). */
export function getSaveConfigurationUrls(path: string): {
  browserUrl: string
  legacyUrl: string
} {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const browserUrl = path.startsWith('http')
    ? path
    : `${env.apiBaseUrl.replace(/\/$/, '')}${normalizedPath}`
  const legacyUrl = `${env.devLegacyOrigin.replace(/\/$/, '')}${normalizedPath}`
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

export async function saveUserConfiguration(
  configuration: SessionConfiguration,
): Promise<void> {
  const configurationJson = encodeURIComponent(JSON.stringify(configuration))
  const path = `${PANEL_CONFIGURATION_PATH}/${configurationJson}`

  if (import.meta.env.DEV) {
    const { browserUrl, legacyUrl } = getSaveConfigurationUrls(path)
    console.info('[Salvar] Browser request:', browserUrl)
    console.info('[Salvar] Legacy (after Vite proxy):', legacyUrl)
  }

  const response = await apiFetch(path, { method: 'GET' })

  if (response.status === 200) return

  const details = await readErrorDetails(response)
  throw new ApiError(
    'Não foi possível salvar as configurações',
    response.status,
    details,
  )
}
