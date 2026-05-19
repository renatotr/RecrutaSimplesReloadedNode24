import type { ReactNode } from 'react'

interface PageBannerProps {
  title: string
  label?: ReactNode
  meta?: ReactNode
  status?: string
  asideLink?: { label: string; href?: string }
}

export function PageBanner({
  title,
  label,
  meta,
  status,
  asideLink,
}: PageBannerProps) {
  return (
    <header className="rs-banner">
      <div className="rs-banner__main">
        <h1 className="rs-banner__title">{title}</h1>
        {label ? <div className="rs-banner__label">{label}</div> : null}
        {meta ? <div className="rs-banner__meta">{meta}</div> : null}
      </div>
      {(status || asideLink) && (
        <aside className="rs-banner__aside">
          {status ? <p className="rs-banner__status">{status}</p> : null}
          {asideLink ? (
            <a className="rs-banner__link" href={asideLink.href ?? '#'}>
              {asideLink.label}
            </a>
          ) : null}
        </aside>
      )}
    </header>
  )
}
