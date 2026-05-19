import type { ReactNode } from 'react'

export interface TabItem {
  id: string
  label: string
}

interface TabBarProps {
  tabs: TabItem[]
  activeId: string
  onTabChange: (id: string) => void
  actions?: ReactNode
}

export function TabBar({ tabs, activeId, onTabChange, actions }: TabBarProps) {
  return (
    <nav className="rs-tabs" aria-label="Abas da página">
      <ul className="rs-tabs__list" role="tablist">
        {tabs.map((tab) => (
          <li key={tab.id} className="rs-tabs__tab" role="presentation">
            <button
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={activeId === tab.id}
              aria-controls={`panel-${tab.id}`}
              className={
                activeId === tab.id
                  ? 'rs-tabs__button rs-tabs__button--active'
                  : 'rs-tabs__button'
              }
              onClick={() => onTabChange(tab.id)}
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>
      {actions ? <div className="rs-tabs__actions">{actions}</div> : null}
    </nav>
  )
}

export function TabActionsDropdown({
  label = 'Ações',
  onClick,
}: {
  label?: string
  onClick?: () => void
}) {
  return (
    <button type="button" className="rs-tabs__action-btn" onClick={onClick}>
      {label}
      <span className="rs-tabs__action-chevron" aria-hidden>
        ▾
      </span>
    </button>
  )
}
