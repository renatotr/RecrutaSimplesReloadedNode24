import { useState } from 'react'
import { ApiError } from '../../api/client'
import { fetchDeactivationReportLogs } from '../../api/changeJobStatusLogs'
import type {
  DeactivationReportFilters,
  DeactivationReportRow,
  DeactivationSortDirection,
  DeactivationSortField,
} from '../../types/deactivationReport'
import { DeactivationFilterDateInput } from './DeactivationFilterDateInput'
import {
  DEACTIVATION_REPORT_AGE_COLUMN_LABEL,
  exportDeactivationReportToXlsx,
} from './deactivationReportUtils'

const SORT_OPTIONS: { value: DeactivationSortField; label: string }[] = [
  { value: 'age_when_deactivated', label: 'Idade da vaga (dias)' },
  { value: 'deactivation_date', label: 'Data da desativação' },
  { value: 'job_title', label: 'Título da vaga' },
  { value: 'email_job_owner', label: 'Usuário (e-mail)' },
]

const DEFAULT_FILTERS: DeactivationReportFilters = {
  dateFrom: '',
  dateTo: '',
  ownerEmail: '',
  sortCriteria: [],
}

function ExcelIcon() {
  return (
    <svg
      className="deact-report__excel-icon"
      viewBox="0 0 24 24"
      aria-hidden
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2 5 5h-1V4h1zM8 13h1.5l.75 2 .75-2H12v3h-1v-2l-.9 2H9.9l-.9-2v2H8v-3zm5 0h3v1h-2v.5h2v1h-2v.5h2v1h-3v-3z"
      />
    </svg>
  )
}

function formatReportFetchError(error: unknown): string {
  if (error instanceof ApiError) {
    return error.details?.trim() || error.message
  }
  if (error instanceof Error) return error.message
  return String(error)
}

export function DeactivationReportBlock() {
  const [draft, setDraft] = useState<DeactivationReportFilters>(DEFAULT_FILTERS)
  const [rows, setRows] = useState<DeactivationReportRow[]>([])
  const [total, setTotal] = useState(0)
  const [hasSearched, setHasSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateDraft(patch: Partial<DeactivationReportFilters>) {
    setDraft((current) => ({ ...current, ...patch }))
  }

  function isSortActive(field: DeactivationSortField): boolean {
    return draft.sortCriteria.some((c) => c.field === field)
  }

  function getSortDirection(field: DeactivationSortField): DeactivationSortDirection {
    return (
      draft.sortCriteria.find((c) => c.field === field)?.direction ?? 'asc'
    )
  }

  function toggleSort(field: DeactivationSortField) {
    setDraft((current) => {
      const exists = current.sortCriteria.some((c) => c.field === field)
      const sortCriteria = exists
        ? current.sortCriteria.filter((c) => c.field !== field)
        : [...current.sortCriteria, { field, direction: 'asc' as const }]
      return { ...current, sortCriteria }
    })
  }

  function setSortDirection(
    field: DeactivationSortField,
    direction: DeactivationSortDirection,
  ) {
    setDraft((current) => ({
      ...current,
      sortCriteria: current.sortCriteria.map((c) =>
        c.field === field ? { ...c, direction } : c,
      ),
    }))
  }

  async function handleSearch() {
    const filters: DeactivationReportFilters = {
      ...draft,
      sortCriteria: draft.sortCriteria.map((c) => ({ ...c })),
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetchDeactivationReportLogs(filters)
      setRows(response.rows)
      setTotal(response.total)
      setHasSearched(true)
    } catch (err) {
      setRows([])
      setTotal(0)
      setError(formatReportFetchError(err))
      setHasSearched(true)
    } finally {
      setLoading(false)
    }
  }

  function handleClearFilters() {
    const cleared: DeactivationReportFilters = {
      ...DEFAULT_FILTERS,
      sortCriteria: [],
    }
    setDraft(cleared)
    setRows([])
    setTotal(0)
    setError(null)
    setHasSearched(false)
  }

  return (
    <section className="deact-report" aria-label="Relatório de desativações">
      <header className="deact-report__header">
        <p className="deact-report__description">
          Consulte o histórico de desativações automáticas. 
        </p>
      </header>

      <div className="deact-report__filters">
        <h3 className="deact-report__filters-title">Filtros</h3>

        <fieldset className="deact-report__fieldset">
          <legend className="deact-report__legend">Data da desativação</legend>
          <p className="deact-report__field-hint">
            Preencha De, Até ou ambos. Deixe em branco para não aplicar aquele
            limite.
          </p>
          <div className="deact-report__date-range">
            <label className="deact-report__field">
              <span className="deact-report__field-label">De</span>
              <DeactivationFilterDateInput
                value={draft.dateFrom ?? ''}
                onChange={(br) => updateDraft({ dateFrom: br })}
              />
            </label>
            <label className="deact-report__field">
              <span className="deact-report__field-label">Até</span>
              <DeactivationFilterDateInput
                value={draft.dateTo ?? ''}
                onChange={(br) => updateDraft({ dateTo: br })}
              />
            </label>
          </div>
        </fieldset>

        <label className="deact-report__field deact-report__field--grow">
          <span className="deact-report__field-label">
            E-mail do responsável pela vaga
          </span>
          <input
            type="email"
            className="deact-report__input deact-report__input--wide"
            placeholder="Ex.: maria.silva@empresa.com.br"
            value={draft.ownerEmail ?? ''}
            onChange={(e) => updateDraft({ ownerEmail: e.target.value })}
          />
          <span className="deact-report__field-hint">
            Deixe em branco para trazer as desativações das vaga de todos os usuários.
          </span>
        </label>

        <fieldset className="deact-report__fieldset">
          <legend className="deact-report__legend">
            Ordenação (pode selecionar mais de uma)
          </legend>
          <p className="deact-report__field-hint">
            Marque os critérios desejados e escolha crescente ou decrescente. A
            ordem de seleção será respeitada pela API do legado.
          </p>
          <div className="deact-report__sort-list">
            {SORT_OPTIONS.map((option) => {
              const active = isSortActive(option.value)
              const direction = getSortDirection(option.value)

              return (
                <div
                  key={option.value}
                  className={
                    active
                      ? 'deact-report__sort-row deact-report__sort-row--active'
                      : 'deact-report__sort-row'
                  }
                >
                  <label className="deact-report__sort-row-check">
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => toggleSort(option.value)}
                    />
                    <span>{option.label}</span>
                  </label>
                  <div
                    className="deact-report__sort-direction"
                    role="group"
                    aria-label={`Direção: ${option.label}`}
                    aria-disabled={!active}
                  >
                    <label className="deact-report__sort-direction-option">
                      <input
                        type="radio"
                        name={`sort-dir-${option.value}`}
                        checked={direction === 'asc'}
                        disabled={!active}
                        onChange={() =>
                          setSortDirection(option.value, 'asc')
                        }
                      />
                      <span>Crescente</span>
                    </label>
                    <label className="deact-report__sort-direction-option">
                      <input
                        type="radio"
                        name={`sort-dir-${option.value}`}
                        checked={direction === 'desc'}
                        disabled={!active}
                        onChange={() =>
                          setSortDirection(option.value, 'desc')
                        }
                      />
                      <span>Decrescente</span>
                    </label>
                  </div>
                </div>
              )
            })}
          </div>
        </fieldset>

        {error && (
          <p className="rs-feedback rs-feedback--error" role="alert">
            {error}
          </p>
        )}

        <div className="deact-report__filter-actions">
          <button
            type="button"
            className="deact-report__btn deact-report__btn--primary"
            onClick={() => void handleSearch()}
            disabled={loading}
          >
            {loading ? 'Buscando…' : 'Buscar'}
          </button>
          <button
            type="button"
            className="deact-report__btn deact-report__btn--ghost"
            onClick={handleClearFilters}
          >
            Limpar filtros
          </button>
        </div>
      </div>

      <div className="deact-report__results">
        <div className="deact-report__results-toolbar">
          <p className="deact-report__results-count">
            {loading
              ? 'Carregando…'
              : hasSearched
                ? `${total} registro(s) encontrado(s)`
                : 'Informe os filtros e clique em Buscar'}
          </p>
          <button
            type="button"
            className="deact-report__export-btn"
            onClick={() => exportDeactivationReportToXlsx(rows)}
            disabled={loading || rows.length === 0}
            title="Exportar para Excel"
          >
            <ExcelIcon />
            <span>Exportar Excel</span>
          </button>
        </div>

        <div className="deact-report__table-wrap">
          <table className="deact-report__table">
            <thead>
              <tr>
                <th scope="col">ID alteração</th>
                <th scope="col">ID vaga</th>
                <th scope="col">Título da vaga</th>
                <th scope="col">Email Dono Vaga</th>
                <th scope="col">Email responsável Desativação</th>
                <th scope="col">Data desativação</th>
                <th scope="col" className="deact-report__cell-age">
                  {DEACTIVATION_REPORT_AGE_COLUMN_LABEL}
                </th>
                <th scope="col">Status anterior</th>
                <th scope="col">Status novo</th>
              </tr>
            </thead>
            <tbody>
              {!hasSearched ? (
                <tr>
                  <td colSpan={9} className="deact-report__empty">
                    Informe os filtros e clique em Buscar.
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="deact-report__empty">
                    Nenhum registro encontrado com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.change_id}>
                    <td>{row.change_id}</td>
                    <td>{row.changed_job_id}</td>
                    <td className="deact-report__cell-title">{row.job_title}</td>
                    <td>{row.email_job_owner}</td>
                    <td>{row.email_change_responsible}</td>
                    <td>{row.deactivation_date}</td>
                    <td className="deact-report__cell-age">
                      {row.age_when_deactivated}
                    </td>
                    <td>
                      <span className="deact-report__status deact-report__status--from">
                        {row.from_status}
                      </span>
                    </td>
                    <td>
                      <span className="deact-report__status deact-report__status--to">
                        {row.to_status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
