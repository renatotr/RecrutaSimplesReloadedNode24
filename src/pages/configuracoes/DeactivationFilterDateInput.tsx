import { brDateToIso, isoToBrDate } from './deactivationReportUtils'

type DeactivationFilterDateInputProps = {
  value: string
  onChange: (brDate: string) => void
  id?: string
}

export function DeactivationFilterDateInput({
  value,
  onChange,
  id,
}: DeactivationFilterDateInputProps) {
  return (
    <div className="deact-report__date-picker" lang="pt-BR">
      <input
        id={id}
        type="date"
        className="deact-report__input deact-report__input--date"
        value={brDateToIso(value)}
        onChange={(e) => onChange(isoToBrDate(e.target.value))}
      />
    </div>
  )
}
