/**
 * Permission codes returned by the legacy API (permissions[].code).
 * Extend as new modules are added.
 */
export const P = {
  CONFIGURATION_MAINMENU_READ: 'configuration.mainmenu.read',
  CONFIGURATION_OPTIONS_DEACTIVATE_EMAIL_READ:
    'configuration.options.deactivate-email.read',
  CONFIGURATION_OPTIONS_DEACTIVATE_EMAIL_WRITE:
    'configuration.options.deactivate-email.write',
  CAMPAIGNS_READ: 'campaigns.read',
  CAMPAIGNS_WRITE: 'campaigns.write',
} as const

export type PermissionCode = (typeof P)[keyof typeof P]
