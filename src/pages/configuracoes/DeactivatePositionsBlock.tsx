import { useEffect, useId, useMemo, useState, type FormEvent } from 'react'
import { ApiError } from '../../api/client'
import { saveUserConfiguration } from '../../api/userConfiguration'
import { useAuth } from '../../auth/useAuth'
import { usePermission } from '../../auth/usePermission'
import { P } from '../../config/permissions'
import { CONFIGURATION_KEYS } from '../../config/configurationKeys'
import {
  buildConfigurationWithDeactivateOldPositions,
  configurationBlockEntry,
  deactivateFormValuesFromSession,
  readDeactivateOldPositions,
} from '../../lib/userConfigurations'
type Feedback = { kind: 'success' | 'error'; message: string }

function formatSaveConfigurationError(error: unknown): string {
  let detail: string

  if (error instanceof ApiError) {
    detail = error.details?.trim() || error.message
  } else if (error instanceof Error) {
    detail = error.message
  } else {
    detail = String(error)
  }

  return `Erro ao salvar a configuração: ${detail}`
}

export function DeactivatePositionsBlock() {
  const autoDeactivateId = useId()
  const daysId = useId()
  const { user, refreshSession, patchConfiguration } = useAuth()
  const configuration = user?.configuration
  const { hasPermission } = usePermission()
  const canWrite = hasPermission(P.CONFIGURATION_OPTIONS_DEACTIVATE_EMAIL_WRITE)

  const configurationSnapshot = JSON.stringify(configuration ?? null)

  const formFromSession = useMemo(
    () => deactivateFormValuesFromSession(configuration),
    [configurationSnapshot],
  )

  const [autoDeactivate, setAutoDeactivate] = useState(
    () => formFromSession.enabled,
  )
  const [daysOld, setDaysOld] = useState(() => formFromSession.ageDays)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<Feedback | null>(null)

  useEffect(() => {
    setAutoDeactivate(formFromSession.enabled)
    setDaysOld(formFromSession.ageDays)
  }, [formFromSession.enabled, formFromSession.ageDays, configurationSnapshot])

  const parsedDays = Number.parseInt(daysOld, 10)
  const daysValid =
    !autoDeactivate || (Number.isFinite(parsedDays) && parsedDays > 0)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canWrite || !daysValid) return

    const existing = readDeactivateOldPositions(user?.configuration)
    const age =
      autoDeactivate && Number.isFinite(parsedDays) && parsedDays > 0
        ? parsedDays
        : (existing?.age ?? parsedDays)

    const patch = {
      enabled: autoDeactivate,
      age: Number.isFinite(age) && age > 0 ? age : 1,
    }

    const merged = buildConfigurationWithDeactivateOldPositions(
      user?.configuration,
      patch,
    )

    setSaving(true)
    setFeedback(null)

    try {
      await saveUserConfiguration([
        configurationBlockEntry(
          CONFIGURATION_KEYS.DEACTIVATE_OLD_POSITIONS,
          patch,
        ),
      ])
      await refreshSession()
      patchConfiguration(merged)
      setFeedback({
        kind: 'success',
        message: 'Configurações atualizadas com sucesso',
      })
    } catch (error) {
      setFeedback({
        kind: 'error',
        message: formatSaveConfigurationError(error),
      })
    } finally {
      setSaving(false)
    }
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
        <br />
        <p className="config-block__description">
          <b> Importante:</b> As vagas serão automaticamente desativadas UMA VEZ POR DIA, à 00:01
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
          <p
            className={`rs-feedback${
              feedback.kind === 'error'
                ? ' rs-feedback--error'
                : ' rs-feedback--success'
            }`}
            role="status"
          >
            {feedback.message}
          </p>
        ) : null}
      </form>
    </section>
  )
}
