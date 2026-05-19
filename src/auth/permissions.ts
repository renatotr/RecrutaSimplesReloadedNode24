import type {
  SessionPermission,
  SessionRole,
  SessionUser,
} from '../types/session'
import type { PermissionCode } from '../config/permissions'
import type { AccessRule } from '../config/routeAccess'

export interface PermissionIndex {
  permissionCodes: Set<string>
  roleCodes: Set<string>
  raw: SessionUser
}

function resolvePermissionCode(permission: SessionPermission): string | null {
  if (permission.code != null && permission.code !== '') {
    return String(permission.code)
  }
  if (permission.id != null) {
    return String(permission.id)
  }
  return null
}

function resolveRoleCode(role: SessionRole): string | null {
  if (role.code != null && role.code !== '') {
    return String(role.code)
  }
  if (role.id != null) {
    return String(role.id)
  }
  return null
}

export function buildPermissionIndex(user: SessionUser): PermissionIndex {
  const permissionCodes = new Set<string>()
  const roleCodes = new Set<string>()

  for (const permission of user.permissions ?? []) {
    const code = resolvePermissionCode(permission)
    if (code) permissionCodes.add(code)
  }

  for (const role of user.roles ?? []) {
    const code = resolveRoleCode(role)
    if (code) roleCodes.add(code)
  }

  return { permissionCodes, roleCodes, raw: user }
}

export function satisfiesRule(
  index: PermissionIndex | null,
  rule: AccessRule,
): boolean {
  if (!index) return false
  if ('anyOf' in rule) {
    return rule.anyOf.some((code) => index.permissionCodes.has(code))
  }
  return rule.allOf.every((code) => index.permissionCodes.has(code))
}

export function hasPermission(
  index: PermissionIndex | null,
  code: PermissionCode | string,
): boolean {
  return index?.permissionCodes.has(code) ?? false
}

export function hasAnyPermission(
  index: PermissionIndex | null,
  codes: readonly (PermissionCode | string)[],
): boolean {
  if (!index || codes.length === 0) return false
  return codes.some((code) => index.permissionCodes.has(code))
}

export function hasAllPermissions(
  index: PermissionIndex | null,
  codes: readonly (PermissionCode | string)[],
): boolean {
  if (!index || codes.length === 0) return false
  return codes.every((code) => index.permissionCodes.has(code))
}

export function hasRole(
  index: PermissionIndex | null,
  code: string,
): boolean {
  return index?.roleCodes.has(code) ?? false
}
