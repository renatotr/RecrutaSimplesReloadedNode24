import type { ReactNode } from 'react'

interface PageShellProps {
  children: ReactNode
}

export function PageShell({ children }: PageShellProps) {
  return (
    <div className="rs-page">
      <div className="rs-page__inner">{children}</div>
    </div>
  )
}
