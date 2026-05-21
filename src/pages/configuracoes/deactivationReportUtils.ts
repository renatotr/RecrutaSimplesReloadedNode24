import * as XLSX from 'xlsx'
import { parseBrDate } from '../../lib/brDate'
import type {
  DeactivationReportFilters,
  DeactivationReportRow,
  DeactivationSortCriterion,
  DeactivationSortField,
} from '../../types/deactivationReport'

export { brDateToIso, isoToBrDate } from '../../lib/brDate'

function endOfDay(ts: number): number {
  const date = new Date(ts)
  date.setHours(23, 59, 59, 999)
  return date.getTime()
}

function parseChangeDate(value: string): number | null {
  return (
    parseBrDate(value) ??
    (Number.isFinite(Date.parse(value)) ? Date.parse(value) : null)
  )
}

function matchesDateFilter(
  row: DeactivationReportRow,
  filters: DeactivationReportFilters,
): boolean {
  const deactivatedTs = parseChangeDate(row.deactivation_date)
  if (deactivatedTs == null) return true
  const from = parseBrDate(filters.dateFrom)
  const to = parseBrDate(filters.dateTo)

  if (from != null && deactivatedTs < from) return false
  if (to != null && deactivatedTs > endOfDay(to)) return false
  return true
}

function matchesOwnerEmail(
  row: DeactivationReportRow,
  ownerEmail: string | undefined,
): boolean {
  const query = ownerEmail?.trim().toLowerCase()
  if (!query) return true
  return row.email_job_owner.toLowerCase().includes(query)
}

function compareByField(
  a: DeactivationReportRow,
  b: DeactivationReportRow,
  field: DeactivationSortField,
): number {
  switch (field) {
    case 'age_when_deactivated':
      return a.age_when_deactivated - b.age_when_deactivated
    case 'deactivation_date': {
      const aTs = parseChangeDate(a.deactivation_date) ?? 0
      const bTs = parseChangeDate(b.deactivation_date) ?? 0
      return aTs - bTs
    }
    case 'job_title':
      return a.job_title.localeCompare(b.job_title, 'pt-BR')
    case 'email_job_owner':
      return a.email_job_owner.localeCompare(b.email_job_owner, 'pt-BR')
    default:
      return 0
  }
}

function compareRows(
  a: DeactivationReportRow,
  b: DeactivationReportRow,
  criterion: DeactivationSortCriterion,
): number {
  const cmp = compareByField(a, b, criterion.field)
  return criterion.direction === 'desc' ? -cmp : cmp
}

export function applyDeactivationReportQuery(
  rows: DeactivationReportRow[],
  filters: DeactivationReportFilters,
): DeactivationReportRow[] {
  const filtered = rows.filter(
    (row) =>
      matchesDateFilter(row, filters) &&
      matchesOwnerEmail(row, filters.ownerEmail),
  )

  return [...filtered].sort((a, b) => {
    for (const criterion of filters.sortCriteria) {
      const cmp = compareRows(a, b, criterion)
      if (cmp !== 0) return cmp
    }
    return a.change_id.localeCompare(b.change_id)
  })
}

export const DEACTIVATION_REPORT_AGE_COLUMN_LABEL =
  'Idade Vaga Quando Inativada (em dias)'

export function exportDeactivationReportToXlsx(rows: DeactivationReportRow[]): void {
  const headers = [
    'ID alteração',
    'ID vaga',
    'Título da vaga',
    'Email Dono Vaga',
    'Email responsável Desativação',
    'Data da desativação',
    DEACTIVATION_REPORT_AGE_COLUMN_LABEL,
    'Status anterior',
    'Status novo',
  ]

  const data = rows.map((row) => [
    row.change_id,
    row.changed_job_id,
    row.job_title,
    row.email_job_owner,
    row.email_change_responsible,
    row.deactivation_date,
    row.age_when_deactivated,
    row.from_status,
    row.to_status,
  ])

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data])
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Desativações')
  XLSX.writeFile(
    workbook,
    `vagas-desativadas-${new Date().toISOString().slice(0, 10)}.xlsx`,
  )
}
