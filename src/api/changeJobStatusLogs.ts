import { env } from '../config/env'
import {
  brDateToTimestamptzEnd,
  brDateToTimestamptzStart,
} from '../lib/brDate'
import type {
  DeactivationReportFilters,
  DeactivationReportRow,
} from '../types/deactivationReport'
import { ApiError, apiFetch, formatResponsePayload } from './client'

export interface DeactivationReportResponse {
  rows: DeactivationReportRow[]
  total: number
}

const LOGS_BY_THEME_PATH = env.changeJobStatusLogsByThemePath

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

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && !Number.isNaN(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isNaN(parsed) ? null : parsed
  }
  return null
}

function asString(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value
  return null
}

export function normalizeDeactivationReportRow(
  raw: unknown,
): DeactivationReportRow | null {
  if (typeof raw !== 'object' || raw === null) return null
  const record = raw as Record<string, unknown>

  const change_id = asString(record.change_id)
  const changed_job_id = asString(record.changed_job_id)
  const job_title = asString(record.job_title)
  const deactivation_date = asString(
    record.deactivation_date ?? record.change_date,
  )
  const email_job_owner = asString(record.email_job_owner)
  const email_change_responsible = asString(record.email_change_responsible)
  const age_when_deactivated = asNumber(record.age_when_deactivated)
  const from_status = asString(record.from_status)
  const to_status = asString(record.to_status)

  if (
    !change_id ||
    !changed_job_id ||
    !job_title ||
    !deactivation_date ||
    !email_job_owner ||
    !email_change_responsible ||
    age_when_deactivated == null ||
    !from_status ||
    !to_status
  ) {
    return null
  }

  return {
    change_id,
    changed_job_id,
    job_title,
    deactivation_date,
    email_job_owner,
    email_change_responsible,
    age_when_deactivated,
    from_status,
    to_status,
  }
}

function normalizeDeactivationReportResponse(
  data: unknown,
): DeactivationReportResponse {
  if (Array.isArray(data)) {
    const rows = data
      .map(normalizeDeactivationReportRow)
      .filter((row): row is DeactivationReportRow => row != null)
    return { rows, total: rows.length }
  }

  if (typeof data !== 'object' || data === null) {
    throw new ApiError('Resposta do relatório inválida', 500)
  }

  const record = data as Record<string, unknown>
  const rawRows =
    record.rows ?? record.data ?? record.logs ?? record.items ?? []

  if (!Array.isArray(rawRows)) {
    throw new ApiError('Resposta do relatório inválida', 500)
  }

  const rows = rawRows
    .map(normalizeDeactivationReportRow)
    .filter((row): row is DeactivationReportRow => row != null)

  const total = asNumber(record.total) ?? rows.length
  return { rows, total }
}

/** Builds GET query string (snake_case) from report filters. */
export function buildDeactivationReportQuery(
  filters: DeactivationReportFilters,
): string {
  const params = new URLSearchParams()

  const dateFrom = filters.dateFrom?.trim()
  const dateTo = filters.dateTo?.trim()
  const ownerEmail = filters.ownerEmail?.trim()

  if (dateFrom) {
    const timestamptz = brDateToTimestamptzStart(dateFrom)
    if (timestamptz) params.set('date_from', timestamptz)
  }
  if (dateTo) {
    const timestamptz = brDateToTimestamptzEnd(dateTo)
    if (timestamptz) params.set('date_to', timestamptz)
  }
  if (ownerEmail) params.set('email_job_owner', ownerEmail)

  filters.sortCriteria.forEach(({ field, direction }, index) => {
    params.append(`sort_criteria[${index}][field]`, field)
    params.append(`sort_criteria[${index}][direction]`, direction)
  })

  const query = params.toString()
  return query ? `?${query}` : ''
}

export function getDeactivationReportLogsUrl(
  filters: DeactivationReportFilters,
): string {
  return `${env.apiBaseUrl.replace(/\/$/, '')}${LOGS_BY_THEME_PATH}${buildDeactivationReportQuery(filters)}`
}

export async function fetchDeactivationReportLogs(
  filters: DeactivationReportFilters,
): Promise<DeactivationReportResponse> {
  const query = buildDeactivationReportQuery(filters)
  const path = `${LOGS_BY_THEME_PATH}${query}`

  if (import.meta.env.DEV) {
    const browserUrl = getDeactivationReportLogsUrl(filters)
    const legacyUrl = `${env.devLegacyOrigin.replace(/\/$/, '')}${path}`
    console.info('[change-job-status-logs] GET browser →', browserUrl)
    console.info('[change-job-status-logs] GET legacy →', legacyUrl)
  }

  const response = await apiFetch(path, { method: 'GET' })

  if (!response.ok) {
    const details = await readErrorDetails(response)
    throw new ApiError(
      'Não foi possível carregar o relatório de desativações',
      response.status,
      details,
    )
  }

  const data: unknown = await response.json()
  return normalizeDeactivationReportResponse(data)
}
