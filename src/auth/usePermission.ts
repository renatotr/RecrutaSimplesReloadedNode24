import { useAuth } from './useAuth'
import {
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
  hasRole,
  satisfiesRule,
} from './permissions'
import type { PermissionCode } from '../config/permissions'
import type { AccessRule } from '../config/routeAccess'

export function usePermission() {
  const { permissionIndex } = useAuth()

  return {
    permissionIndex,
    hasPermission: (code: PermissionCode | string) =>
      hasPermission(permissionIndex, code),
    hasAny: (codes: readonly (PermissionCode | string)[]) =>
      hasAnyPermission(permissionIndex, codes),
    hasAll: (codes: readonly (PermissionCode | string)[]) =>
      hasAllPermissions(permissionIndex, codes),
    hasRole: (code: string) => hasRole(permissionIndex, code),
    satisfies: (rule: AccessRule) => satisfiesRule(permissionIndex, rule),
  }
}
