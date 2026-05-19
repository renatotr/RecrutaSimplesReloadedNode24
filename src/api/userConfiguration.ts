import type { SessionConfiguration } from '../types/session'
import { ApiError, apiFetch, formatResponsePayload } from './client'

const PANEL_CONFIGURATION_PATH = '/painel/configuracoes'

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

  const response = await apiFetch(path, { method: 'GET' })

  if (response.status === 200) return

  const details = await readErrorDetails(response)
  throw new ApiError(
    'Não foi possível salvar as configurações',
    response.status,
    details,
  )
}
