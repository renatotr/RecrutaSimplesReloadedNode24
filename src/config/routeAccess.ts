import { P, type PermissionCode } from './permissions'

export type AccessRule =
  | { anyOf: PermissionCode[] }
  | { allOf: PermissionCode[] }

/**
 * Required permissions per route path (exact match).
 * Routes not listed are allowed for any authenticated user.
 */
export const ROUTE_ACCESS: Record<string, AccessRule> = {
  '/configuracoes': { anyOf: [P.CONFIGURATION_MAINMENU_READ] },
  '/campaigns': { anyOf: [P.CAMPAIGNS_READ] },
}

export function getRouteAccessRule(pathname: string): AccessRule | null {
  return ROUTE_ACCESS[pathname] ?? null
}
