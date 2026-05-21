export type DeactivationSortField =
  | 'age_when_deactivated'
  | 'deactivation_date'
  | 'job_title'
  | 'email_job_owner'

export type DeactivationSortDirection = 'asc' | 'desc'

export interface DeactivationSortCriterion {
  field: DeactivationSortField
  direction: DeactivationSortDirection
}

export interface DeactivationReportFilters {
  /** Lower bound when set (DD/MM/YYYY, start of day inclusive). */
  dateFrom?: string
  /** Upper bound when set (DD/MM/YYYY, end of day inclusive). */
  dateTo?: string
  ownerEmail?: string
  sortCriteria: DeactivationSortCriterion[]
}

/** Row shape returned by GET /change-job-status-logs/get-logs-by-theme. */
export interface DeactivationReportRow {
  change_id: string
  changed_job_id: string
  job_title: string
  deactivation_date: string
  email_job_owner: string
  email_change_responsible: string
  age_when_deactivated: number
  from_status: string
  to_status: string
}
