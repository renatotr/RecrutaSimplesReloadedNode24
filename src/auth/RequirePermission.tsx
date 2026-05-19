import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { getRouteAccessRule } from '../config/routeAccess'
import type { AccessRule } from '../config/routeAccess'
import { ForbiddenPage } from '../routes/ForbiddenPage'
import { usePermission } from './usePermission'

interface RequirePermissionProps {
  children: ReactNode
  /** Override route-based rule from config/routeAccess.ts */
  rule?: AccessRule
}

export function RequirePermission({ children, rule }: RequirePermissionProps) {
  const { pathname } = useLocation()
  const { satisfies } = usePermission()

  const accessRule = rule ?? getRouteAccessRule(pathname)

  if (accessRule && !satisfies(accessRule)) {
    return <ForbiddenPage />
  }

  return <>{children}</>
}
