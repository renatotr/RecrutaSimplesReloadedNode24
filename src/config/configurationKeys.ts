/** Keys inside SessionUser.configuration (legacy API). */
export const CONFIGURATION_KEYS = {
  DEACTIVATE_OLD_POSITIONS: 'deactivate_old_positions',
} as const

/** Older session payloads may still use this key (read-only fallback). */
export const LEGACY_CONFIGURATION_KEYS = {
  DEACTIVE_OLD_POSITIONS_AUTOMATICALLY: 'deactive_old_positions_automatically',
} as const
