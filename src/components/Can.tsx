import type { ReactNode } from 'react'
import type { PermissionCode } from '../config/permissions'
import { usePermission } from '../auth/usePermission'

interface CanProps {
  children: ReactNode
  permission?: PermissionCode | string
  anyOf?: readonly (PermissionCode | string)[]
  allOf?: readonly (PermissionCode | string)[]
  role?: string
  fallback?: ReactNode
}

export function Can({
  children,
  permission,
  anyOf,
  allOf,
  role,
  fallback = null,
}: CanProps) {
  const { hasPermission, hasAny, hasAll, hasRole } = usePermission()

  let allowed = true

  if (permission) {
    allowed = hasPermission(permission)
  } else if (anyOf && anyOf.length > 0) {
    allowed = hasAny(anyOf)
  } else if (allOf && allOf.length > 0) {
    allowed = hasAll(allOf)
  } else if (role) {
    allowed = hasRole(role)
  }

  if (!allowed) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
