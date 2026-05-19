import {
  CONFIGURATION_KEYS,
  LEGACY_CONFIGURATION_KEYS,
} from '../config/configurationKeys'
import type { SessionConfiguration } from '../types/session'
import type { DeactivateOldPositionsConfig } from '../types/userConfiguration'

const DEACTIVATE_BLOCK_KEYS = [
  CONFIGURATION_KEYS.DEACTIVATE_OLD_POSITIONS,
  LEGACY_CONFIGURATION_KEYS.DEACTIVE_OLD_POSITIONS_AUTOMATICALLY,
  'deactivate_old_position',
  'deactive_old_positions',
] as const

/** Merges one key into a copy of the full configuration object (other keys preserved). */
export function mergeConfigurationField<V>(
  configuration: SessionConfiguration | null | undefined,
  key: string,
  value: V,
): SessionConfiguration {
  const base =
    configuration !== null &&
    configuration !== undefined &&
    typeof configuration === 'object' &&
    !Array.isArray(configuration)
      ? { ...configuration }
      : {}

  return { ...base, [key]: value }
}

export function normalizeConfiguration(
  configuration: SessionConfiguration | string | null | undefined,
): SessionConfiguration | null {
  if (configuration == null) return null

  if (typeof configuration === 'string') {
    try {
      const parsed: unknown = JSON.parse(configuration)
      if (
        typeof parsed === 'object' &&
        parsed !== null &&
        !Array.isArray(parsed)
      ) {
        return parsed as SessionConfiguration
      }
      return null
    } catch {
      return null
    }
  }

  if (typeof configuration === 'object' && !Array.isArray(configuration)) {
    return configuration
  }

  return null
}

function getRecordEntryIgnoreCase(
  record: Record<string, unknown>,
  ...keys: string[]
): unknown {
  for (const key of keys) {
    if (key in record) return record[key]

    const match = Object.keys(record).find(
      (candidate) => candidate.toLowerCase() === key.toLowerCase(),
    )
    if (match) return record[match]
  }

  return undefined
}

function parseBoolean(value: unknown): boolean {
  return (
    value === true ||
    value === 1 ||
    value === '1' ||
    value === 'true' ||
    value === 'TRUE'
  )
}

function parseAge(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return Math.trunc(value)
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number.parseInt(value, 10)
    if (Number.isFinite(parsed) && parsed > 0) return parsed
  }
  return undefined
}

export function parseDeactivateOldPositions(
  raw: unknown,
): DeactivateOldPositionsConfig | null {
  if (typeof raw === 'string') {
    try {
      return parseDeactivateOldPositions(JSON.parse(raw) as unknown)
    } catch {
      return null
    }
  }

  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return null
  }

  const record = raw as Record<string, unknown>
  const enabledRaw = getRecordEntryIgnoreCase(
    record,
    'enabled',
    'is_enabled',
    'active',
  )
  const ageRaw = getRecordEntryIgnoreCase(
    record,
    'age',
    'age_in_days',
    'days',
    'days_old',
  )

  const hasEnabled = enabledRaw !== undefined
  const hasAge = ageRaw !== undefined

  if (!hasEnabled && !hasAge) return null

  const age = parseAge(ageRaw)

  return {
    enabled: parseBoolean(enabledRaw),
    age: age ?? 0,
  }
}

function isDeactivateBlockShape(record: Record<string, unknown>): boolean {
  return (
    getRecordEntryIgnoreCase(record, 'enabled', 'is_enabled', 'active') !==
      undefined ||
    getRecordEntryIgnoreCase(record, 'age', 'age_in_days', 'days', 'days_old') !==
      undefined
  )
}

function findDeactivateOldPositionsRaw(
  configuration: SessionConfiguration,
): unknown {
  for (const key of DEACTIVATE_BLOCK_KEYS) {
    const value = getRecordEntryIgnoreCase(
      configuration as Record<string, unknown>,
      key,
    )
    if (value !== undefined) return value
  }

  if (isDeactivateBlockShape(configuration as Record<string, unknown>)) {
    return configuration
  }

  return undefined
}

export function readDeactivateOldPositions(
  configuration: SessionConfiguration | string | null | undefined,
): DeactivateOldPositionsConfig | null {
  const normalized = normalizeConfiguration(configuration)
  if (!normalized) return null

  return parseDeactivateOldPositions(findDeactivateOldPositionsRaw(normalized))
}

export function buildConfigurationWithDeactivateOldPositions(
  configuration: SessionConfiguration | null | undefined,
  patch: DeactivateOldPositionsConfig,
): SessionConfiguration {
  return mergeConfigurationField(
    normalizeConfiguration(configuration) ?? undefined,
    CONFIGURATION_KEYS.DEACTIVATE_OLD_POSITIONS,
    patch,
  )
}

export function deactivateFormValuesFromSession(
  configuration: SessionConfiguration | string | null | undefined,
): { enabled: boolean; ageDays: string } {
  const saved = readDeactivateOldPositions(configuration)

  return {
    enabled: saved?.enabled ?? false,
    ageDays: saved && saved.age > 0 ? String(saved.age) : '',
  }
}
