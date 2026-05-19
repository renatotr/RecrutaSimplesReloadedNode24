import { useId, useState, type FormEvent } from 'react'
import { usePermission } from '../../auth/usePermission'
import { P } from '../../config/permissions'

export function DeactivatePositionsBlock() {
  const autoDeactivateId = useId()
  const daysId = useId()
  const { hasPermission } = usePermission()
  const canWrite = hasPermission(P.CONFIGURATION_OPTIONS_DEACTIVATE_EMAIL_WRITE)

  const [autoDeactivate, setAutoDeactivate] = useState(false)
  const [daysOld, setDaysOld] = useState('')
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  const parsedDays = Number.parseInt(daysOld, 10)
  const daysValid =
    !autoDeactivate || (Number.isFinite(parsedDays) && parsedDays > 0)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canWrite || !daysValid) return

    setSaving(true)
    setFeedback(null)

    // TODO: persist via legacy API when endpoint is available
    const payload = {
      autoDeactivate,
      daysOld: autoDeactivate ? parsedDays : null,
    }
    console.info('[configuracoes] deactivate positions', payload)

    setSaving(false)
    setFeedback('Configuração salva localmente (integração com API pendente).')
  }

  return (
    <section className="config-block" aria-labelledby={`${autoDeactivateId}-title`}>
      <header className="config-block__header">
        <h2 id={`${autoDeactivateId}-title`} className="config-block__title">
          Desativar vagas
        </h2>
        <p className="config-block__description">
          Define se vagas antigas devem ser desativadas automaticamente e após
          quantos dias da publicação.
        </p>
      </header>

      <form className="config-block__form" onSubmit={handleSubmit}>
        <label className="config-field config-field--checkbox">
          <input
            type="checkbox"
            id={autoDeactivateId}
            checked={autoDeactivate}
            disabled={!canWrite}
            onChange={(e) => {
              setAutoDeactivate(e.target.checked)
              setFeedback(null)
            }}
          />
          <span>Desativar vagas automaticamente</span>
        </label>

        <div className="config-field">
          <label htmlFor={daysId} className="config-field__label">
            Desativar vagas com mais de (dias)
          </label>
          <input
            type="number"
            id={daysId}
            className="config-field__input"
            min={1}
            step={1}
            inputMode="numeric"
            placeholder="Ex.: 90"
            value={daysOld}
            disabled={!canWrite || !autoDeactivate}
            onChange={(e) => {
              setDaysOld(e.target.value)
              setFeedback(null)
            }}
            aria-describedby={`${daysId}-hint`}
          />
          <p id={`${daysId}-hint`} className="config-field__hint">
            {autoDeactivate
              ? 'Informe após quantos dias da publicação a vaga será desativada.'
              : 'Ative a opção acima para definir o prazo em dias.'}
          </p>
        </div>

        <div className="config-block__actions">
          <button
            type="submit"
            className="config-block__save"
            disabled={!canWrite || !daysValid || saving}
          >
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
          {!canWrite ? (
            <p className="config-block__readonly-hint" role="status">
              Você pode visualizar estas opções, mas não possui permissão para
              alterá-las.
            </p>
          ) : null}
        </div>

        {feedback ? (
          <p className="config-block__feedback" role="status">
            {feedback}
          </p>
        ) : null}
      </form>
    </section>
  )
}
